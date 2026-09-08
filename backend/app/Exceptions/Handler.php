<?php

namespace App\Exceptions;

use App\Support\TenancyAccess;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * What an unauthenticated request gets.
     *
     * Always 401, never a redirect. Laravel's own handler ends with
     * `redirect()->guest($exception->redirectTo($request) ?? route('login'))`, and this application
     * serves an API and defines no `login` route - so the fallback raises RouteNotFoundException
     * and a plain 401 arrives at the browser as a 500. That is reachable: the tenancy document
     * routes (receipt, acknowledgement, application details, agreement) can be typed straight into
     * an address bar, and a request that way carries `Accept: text/html`, which is exactly the
     * branch that redirects. Overriding Authenticate::redirectTo() alone does not fix it, because
     * null is what triggers the route('login') fallback.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        return response()->json(['message' => $exception->getMessage() ?: 'Unauthenticated.'], 401);
    }

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        /*
         * A tenancy that does not exist and a tenancy that is not yours must look the same.
         *
         * Route-model binding raises this before any controller runs, so without it the router
         * itself would answer "no such application number" in a different shape from the
         * controller's refusal, and the pair would still be a directory of which application
         * numbers have been issued - the enumeration Rule 4(4) forbids. The controllers answer
         * 404 with TenancyAccess::APPLICATION_NOT_AVAILABLE; this gives the router the same words.
         *
         * Scoped to the tenancy routes on purpose. A 404 anywhere else in the API discloses
         * nothing about a tenancy and should keep saying whatever it says.
         */
        $this->renderable(function (NotFoundHttpException $e, Request $request) {
            if (!$request->is('api/tenancy-applications/*')) {
                return null;
            }

            return response()->json(['message' => TenancyAccess::APPLICATION_NOT_AVAILABLE], 404);
        });
    }
}
