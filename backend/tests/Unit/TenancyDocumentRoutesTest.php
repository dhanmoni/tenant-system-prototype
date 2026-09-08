<?php

namespace Tests\Unit;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Rule 4(4) confines tenancy details to the concerned Parties. Four routes render a tenancy in
 * full - the receipt, the acknowledgement, the application details and the agreement - and until
 * 8 Sep 2026 two of them were declared above the auth group in routes/api.php and served the whole
 * record, both parties included, to anyone who could guess an application number.
 *
 * Nothing about the shape of those two routes says which side of the group they sit on, so the
 * mistake is invisible on inspection and easy to repeat when a route is moved. These tests read the
 * router itself.
 *
 * The access decision inside the controller is a separate matter; see TenancyAccessTest for the
 * party-membership predicate.
 */
class TenancyDocumentRoutesTest extends TestCase
{
    /**
     * Does this route authenticate?
     *
     * gatherMiddleware() hands back whatever routes/api.php wrote - the `auth:sanctum` alias here,
     * a class name elsewhere - so the alias map is resolved before comparing. Matching the string
     * "auth:sanctum" alone would pass happily on the day somebody points that alias at something
     * else.
     */
    private function authenticates(\Illuminate\Routing\Route $route): bool
    {
        $aliases = Route::getMiddleware();

        foreach ($route->gatherMiddleware() as $entry) {
            $name = explode(':', (string) $entry, 2)[0];
            $resolved = $aliases[$name] ?? $name;

            if (is_a($resolved, Middleware::class, true)) {
                return true;
            }
        }

        return false;
    }

    private function routeFor(string $uri): \Illuminate\Routing\Route
    {
        foreach (Route::getRoutes() as $route) {
            if ($route->uri() === $uri && in_array('GET', $route->methods(), true)) {
                return $route;
            }
        }

        $this->fail("no GET route is registered at {$uri}");
    }

    public static function documentRoutes(): array
    {
        return [
            'receipt' => ['api/tenancy-applications/{tenancyApplication}/receipt'],
            'acknowledgement' => ['api/tenancy-applications/{tenancyApplication}/acknowledgement'],
            'application details' => ['api/tenancy-applications/{tenancyApplication}/application-details'],
            'agreement' => ['api/tenancy-applications/{tenancyApplication}/agreement'],
        ];
    }

    #[DataProvider('documentRoutes')]
    public function test_every_tenancy_document_route_requires_authentication(string $uri): void
    {
        $this->assertTrue(
            $this->authenticates($this->routeFor($uri)),
            "{$uri} renders a tenancy record and must sit inside the auth:sanctum group"
        );
    }

    public function test_no_tenancy_application_route_is_public(): void
    {
        $unguarded = [];

        foreach (Route::getRoutes() as $route) {
            if (!str_starts_with($route->uri(), 'api/tenancy-applications')) {
                continue;
            }

            if (!$this->authenticates($route)) {
                $unguarded[] = implode('|', $route->methods()) . ' ' . $route->uri();
            }
        }

        $this->assertSame(
            [],
            $unguarded,
            "these tenancy routes answer without a signed-in account:\n" . implode("\n", $unguarded)
        );
    }
}
