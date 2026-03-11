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

        $skipPaths = [
            'api/login',
            'api/logout',
            'api/user',
            'sanctum/csrf-cookie',
        ];

        if (in_array($path, $skipPaths, true)) {
            return $response;
        }

        UserActivityLog::create([
            'user_id' => $user->id,
            'session_id' => $request->session()->getId(),
            'action' => $method . ' ' . $path,
            'ip_address' => $request->ip(),
            'ip_location' => null,
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
            'meta' => [
                'status' => $response->status(),
            ],
            'logged_at' => now(),
        ]);

        return $response;
    }
}
