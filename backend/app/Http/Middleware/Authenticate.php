<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Where to send an unauthenticated request.
     *
     * Nowhere: this application serves an API and has no `login` route, so the inherited
     * `route('login')` would raise RouteNotFoundException and turn a plain 401 into a 500. That
     * matters for the tenancy document routes (receipt, acknowledgement, application details,
     * agreement), which a browser can be pointed at directly and which therefore arrive without an
     * `Accept: application/json` header. Returning null makes every unauthenticated request fail
     * as 401, whatever it asked for.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        return null;
    }
}
