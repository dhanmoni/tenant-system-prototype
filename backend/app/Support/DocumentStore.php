<?php

namespace App\Support;

use App\Constants\ApplicationTypes;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

/**
 * Every file a filer uploads, and the only way one comes back out.
 *
 * Until 8 September 2026 all of them - both parties' passport photographs, their signatures, their
 * PAN cards, the executed tenancy agreement, the signature on each of the eight service forms -
 * were written to the `public` disk, which is symlinked into public/storage and served by the web
 * server with no authentication of any kind. The API handed the paths out (`landlord_pan_url`,
 * `agreement_pdf_path`), the SPA built `<img src="{base}/storage/{path}">` from them, and from that
 * moment the document was readable by anyone who had ever seen the URL, for ever, signed in or not.
 * Rule 4(4) of the Assam Tenancy Rules, 2025 says tenancy details "shall not be accessible to
 * public or any unauthorised person" under any circumstances; a permanent unauthenticated URL to
 * somebody's PAN card is the plainest possible breach of it.
 *
 * Files now go to the `documents` disk, which is outside the document root and has no URL. They
 * leave only through the `documents.show` route, and only by a signed URL this class mints - which
 * the API issues alongside a record the caller has already been authorised to see.
 *
 * Why signed URLs rather than an authenticated route: these files are consumed by `<img src>` and
 * by `window.open`, neither of which can carry a bearer token, and the frontend and API are served
 * from different origins here (see the SESSION_SAME_SITE note in config/session.php), so a session
 * cookie is not reliably sent on a subresource request either. A signed URL is a capability handed
 * to a caller who has just passed the record's own access check; it names one file, and it expires.
 * That is a different thing from a public address, which is what these files had before.
 */
class DocumentStore
{
    /** Where uploads are written. Outside public/, no `url` key, nothing web-serves it. */
    public const DISK = 'documents';

    /**
     * Where uploads written before 8 September 2026 still are.
     *
     * Reads fall through to it, so securing the disk did not break every existing record on the day
     * it shipped. `php artisan documents:secure` empties it; until that has been run everywhere,
     * this fallback is what keeps old files visible.
     */
    public const LEGACY_DISK = 'public';

    /**
     * How long a minted URL stays good.
     *
     * An hour, set against how these URLs are actually used rather than against a round number. A
     * detail page is issued its URLs once, on load, and the reader may sit on it for a while before
     * pressing "View agreement"; too short a life and the button fails on a page that looks fine.
     * An hour is comfortably inside the 120-minute session (config/session.php) that produced the
     * URLs, and is the difference between a capability and the permanent public address these
     * files had before - the leak paths that matter, a browser history or a proxy log, are not
     * meaningfully worse at sixty minutes than at fifteen.
     */
    public const URL_TTL_MINUTES = 60;

    /**
     * The columns that hold a file path, per scope.
     *
     * A signed URL names a scope, a record id and a field, and the field is looked up here rather
     * than taken from the request: without this list, `documents.show` would read any column of any
     * row named in a URL, and the signature would be protecting the wrong thing.
     */
    private const FIELDS = [
        ApplicationTypes::TENANCY_CERTIFICATE => [
            'agreement_pdf_path',
            'landlord_photo_path',
            'landlord_signature_path',
            'landlord_pan_path',
            'tenant_photo_path',
            'tenant_signature_path',
            'tenant_pan_path',
            'manager_pan_path',
        ],
        self::USER_SCOPE => [
            'passport_photo_path',
        ],
    ];

    /** The account holder's own photograph, which is not tied to any one application. */
    public const USER_SCOPE = 'user';

    /** The one file every service form carries. */
    private const SERVICE_FORM_FIELDS = ['signature_image_path'];

    public static function scopes(): array
    {
        $scopes = self::FIELDS;

        foreach (ApplicationTypes::serviceForms() as $type) {
            $scopes[$type] = self::SERVICE_FORM_FIELDS;
        }

        return $scopes;
    }

    public static function fieldsFor(string $scope): array
    {
        return self::scopes()[$scope] ?? [];
    }

    public static function modelFor(string $scope): ?string
    {
        if ($scope === self::USER_SCOPE) {
            return User::class;
        }

        return ApplicationTypes::modelFor($scope);
    }

    /**
     * Which scope a model belongs to, so a caller holding a record does not have to name it.
     */
    public static function scopeFor(Model $model): ?string
    {
        foreach (array_keys(self::scopes()) as $scope) {
            $class = self::modelFor($scope);
            if ($class && $model instanceof $class) {
                return $scope;
            }
        }

        return null;
    }

    public static function store(UploadedFile $file, string $directory): string
    {
        return $file->store($directory, self::DISK);
    }

    public static function delete(?string $path): void
    {
        if (!$path) {
            return;
        }

        Storage::disk(self::DISK)->delete($path);
        Storage::disk(self::LEGACY_DISK)->delete($path);
    }

    /**
     * Which disk actually holds this path, or null if nothing does.
     *
     * The relative path is identical on both disks, so a legacy file and its secured copy differ
     * only in where they live. The secured disk is checked first, so a half-finished migration
     * serves the new copy rather than the old one.
     */
    public static function diskFor(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        foreach ([self::DISK, self::LEGACY_DISK] as $disk) {
            if (Storage::disk($disk)->exists($path)) {
                return $disk;
            }
        }

        return null;
    }

    public static function exists(?string $path): bool
    {
        return self::diskFor($path) !== null;
    }

    public static function contents(?string $path): ?string
    {
        $disk = self::diskFor($path);

        return $disk ? Storage::disk($disk)->get($path) : null;
    }

    /**
     * The file's location on this machine, for the things that can only take a path - Dompdf
     * merging the agreement, mime_content_type() in the printable view.
     */
    public static function absolutePath(?string $path): ?string
    {
        $disk = self::diskFor($path);
        if (!$disk) {
            return null;
        }

        $full = Storage::disk($disk)->path($path);

        return is_file($full) ? $full : null;
    }

    public static function mimeType(?string $path): ?string
    {
        $disk = self::diskFor($path);

        return $disk ? (Storage::disk($disk)->mimeType($path) ?: null) : null;
    }

    /**
     * A signed, expiring URL for one file on one record.
     *
     * Returns null when the record has no such file, so a caller can hand the result straight to
     * the API response and let the absence show as null rather than as a URL that 404s.
     */
    public static function url(string $scope, $id, string $field, ?string $path): ?string
    {
        if (!$path || !$id || !in_array($field, self::fieldsFor($scope), true)) {
            return null;
        }

        return URL::temporarySignedRoute('documents.show', now()->addMinutes(self::URL_TTL_MINUTES), [
            'scope' => $scope,
            'id' => $id,
            'field' => $field,
        ]);
    }

    /**
     * Every file URL a record has, keyed the way the frontend reads them: `landlord_photo_path`
     * becomes `landlord_photo_url`.
     *
     * This is what replaced the old `{app.url}/storage/{path}` string-building. Callers that used
     * to expose the raw `_path` columns expose these instead - a path is only useful to somebody
     * who can turn it into a URL, and after this change nobody outside this class can.
     */
    public static function urlsFor(?Model $model, ?string $scope = null): array
    {
        if (!$model) {
            return [];
        }

        $scope ??= self::scopeFor($model);
        if (!$scope) {
            return [];
        }

        $urls = [];
        foreach (self::fieldsFor($scope) as $field) {
            $key = preg_replace('/_path$/', '_url', $field);
            $urls[$key] = self::url($scope, $model->getKey(), $field, $model->{$field} ?? null);
        }

        return $urls;
    }
}
