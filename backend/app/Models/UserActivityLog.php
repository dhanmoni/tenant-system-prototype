<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'action',
        'ip_address',
        'ip_location',
        'user_agent',
        'meta',
        'logged_at',
    ];

    protected $casts = [
        'meta' => 'array',
        'logged_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Write one activity row for a request.
     *
     * The four places that log activity - the LogUserActivity middleware, the UIN lookup, the
     * tenancy document guard and notice signing - were each building this row by hand, and each
     * had to remember that the session may not exist. The middleware did not: it called
     * `$request->session()->getId()` outright, which throws "Session store not set on request" for
     * any authenticated non-GET arriving without a session. That is not hypothetical - Sanctum
     * starts a session only for origins listed in SANCTUM_STATEFUL_DOMAINS, so a token client, a
     * server-to-server call, or the SPA served from an origin that is not on that list all take
     * that path. And because the middleware runs on the way *out*, the failure turned a request
     * that had already done its work into a 500: a notice would be signed and recorded, and the
     * officer would be told it had failed.
     *
     * Logging is a record of what happened, not part of what happens. It must never be the reason
     * a request fails.
     */
    public static function record($request, string $action, array $meta = []): void
    {
        $user = $request->user();
        if (!$user) {
            return;
        }

        try {
            static::create([
                'user_id' => $user->id,
                'session_id' => self::sessionId($request),
                'action' => $action,
                'ip_address' => $request->ip(),
                'ip_location' => null,
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
                'meta' => $meta,
                'logged_at' => now(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * The session id, where there is a session.
     *
     * hasSession() alone is not enough: it reports whether a session object is attached, not
     * whether it was started, and getId() on an unstarted store is not something to gamble a
     * request on.
     */
    private static function sessionId($request): ?string
    {
        try {
            return $request->hasSession() ? $request->session()->getId() : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
