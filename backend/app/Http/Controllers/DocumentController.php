<?php

namespace App\Http\Controllers;

use App\Support\DocumentStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * The only exit from the `documents` disk.
 *
 * The route carries the `signed` middleware and nothing else, so the authorisation happened
 * earlier: a signed URL is minted by DocumentStore only where the API is already returning a record
 * the caller has been allowed to see, and it expires. See the class docblock on DocumentStore for
 * why an authenticated route is not usable for these particular files.
 *
 * Three things are checked here even so, because a valid signature says only that this application
 * issued the URL, not that the URL still makes sense:
 *
 *   - the scope and field must be in DocumentStore's registry, so a URL can only ever name a column
 *     that holds a file path;
 *   - the record must exist and hold a path in that column;
 *   - the file must be on one of the two disks.
 *
 * All three failures answer 404. There is nothing to tell apart here - the caller already held a
 * URL this application signed - but a 404 keeps the handler from becoming a way to ask which record
 * ids exist.
 */
class DocumentController extends Controller
{
    public function show(Request $request, string $scope, string $id, string $field)
    {
        if (!in_array($field, DocumentStore::fieldsFor($scope), true)) {
            abort(404);
        }

        $model = DocumentStore::modelFor($scope);
        if (!$model) {
            abort(404);
        }

        $record = $model::find($id);
        if (!$record) {
            abort(404);
        }

        $path = $record->{$field} ?? null;
        $disk = DocumentStore::diskFor($path);
        if (!$disk) {
            abort(404);
        }

        $mime = Storage::disk($disk)->mimeType($path) ?: 'application/octet-stream';

        return Storage::disk($disk)->response($path, basename($path), [
            'Content-Type' => $mime,
            // A tenancy document must not be cached by anything between here and the browser.
            // `private` keeps it out of shared caches; the max-age matches the life of the URL that
            // reached it, so a back button works and a stale tab does not.
            'Cache-Control' => 'private, max-age=' . (DocumentStore::URL_TTL_MINUTES * 60),
            // These are photographs, PDFs and scans of identity documents. Nothing here should ever
            // be sniffed into something executable.
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
