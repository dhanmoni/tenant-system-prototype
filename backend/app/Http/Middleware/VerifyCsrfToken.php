<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // TODO: PROD - Revert this when frontend and backend share the same custom domain to re-enable CSRF protection
        'api/*',
        'sanctum/csrf-cookie'
    ];
}
