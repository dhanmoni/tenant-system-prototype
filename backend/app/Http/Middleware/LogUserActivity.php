<?php

namespace App\Http\Middleware;

use App\Models\UserActivityLog;
use Closure;
use Illuminate\Http\Request;

class LogUserActivity
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $user = $request->user();
        if (!$user) {
            return $response;
        }

        $path = $request->path();
        $method = strtoupper($request->method());

        if ($method === 'GET') {
            return $response;
        }

        $skipPaths = [
            'api/login',
            'api/logout',
            'api/user',
            'sanctum/csrf-cookie',
        ];

        if (in_array($path, $skipPaths, true)) {
            return $response;
        }

        UserActivityLog::record($request, $method . ' ' . $path, [
            'status' => $response->status(),
        ]);

        return $response;
    }
}
