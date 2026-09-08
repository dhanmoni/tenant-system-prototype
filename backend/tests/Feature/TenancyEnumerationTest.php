<?php

namespace Tests\Feature;

use App\Http\Controllers\TenancyApplicationController;
use App\Support\TenancyAccess;
use ReflectionMethod;
use Tests\TestCase;

/**
 * A tenancy that does not exist and a tenancy that is not yours must be one answer.
 *
 * Application numbers run APP-YYYYMM-NNNNNN. While a real record answered 403 and an unissued
 * number answered 404, any signed-in account could walk that sequence and learn which applications
 * had been filed and in which month, without ever reading one - the enumeration Rule 4(4) forbids,
 * and the same reasoning TenancyAccess::NOT_AVAILABLE already applied to UIN lookup.
 *
 * Two halves have to agree for that to hold: the controller's refusal, and route-model binding,
 * which raises its own 404 before any controller runs. These tests pin the half that lives outside
 * the controller, plus the 401 that used to be a 500.
 *
 * Every case is decided by the router or by middleware, before the database is touched, so this
 * needs no database and is safe to run anywhere.
 */
class TenancyEnumerationTest extends TestCase
{
    public function test_a_tenancy_route_that_matches_nothing_gives_the_canonical_answer(): void
    {
        $this->getJson('/api/tenancy-applications/APP-209912-999999/no-such-document')
            ->assertNotFound()
            ->assertExactJson(['message' => TenancyAccess::APPLICATION_NOT_AVAILABLE]);
    }

    public function test_the_canonical_answer_names_no_reason(): void
    {
        $message = strtolower(TenancyAccess::APPLICATION_NOT_AVAILABLE);

        foreach (['forbidden', 'not found', 'does not exist', 'permission', 'unauthorised', 'unauthorized'] as $tell) {
            $this->assertStringNotContainsString(
                $tell,
                $message,
                'the refusal must not hint at which of the two reasons applies'
            );
        }
    }

    public function test_the_controller_refusal_matches_the_router_answer(): void
    {
        // The other half. 403 here would have meant "this one is real, just not yours" - which,
        // over a sequential application number, is a directory of every application ever filed.
        $method = new ReflectionMethod(TenancyApplicationController::class, 'tenancyNotAvailable');
        $method->setAccessible(true);
        $response = $method->invoke(new TenancyApplicationController());

        $this->assertSame(404, $response->getStatusCode());
        $this->assertSame(
            ['message' => TenancyAccess::APPLICATION_NOT_AVAILABLE],
            json_decode($response->getContent(), true),
            'the controller and route-model binding must answer in the same words'
        );
    }

    public function test_other_api_404s_are_left_alone(): void
    {
        // The rewrite is scoped to tenancy paths. A 404 elsewhere discloses nothing about a
        // tenancy and should keep saying whatever it says.
        $response = $this->getJson('/api/no-such-endpoint');

        $response->assertNotFound();
        $this->assertNotSame(
            TenancyAccess::APPLICATION_NOT_AVAILABLE,
            $response->json('message'),
            'the tenancy wording must not leak onto unrelated endpoints'
        );
    }

    public function test_an_unauthenticated_browser_request_gets_401_not_500(): void
    {
        // These URLs can be typed straight into an address bar, which sends Accept: text/html -
        // the branch where Laravel redirects to route('login'). This application defines no such
        // route, so that branch used to raise RouteNotFoundException and answer 500.
        $this->get('/api/tenancy-applications/APP-209912-999999/receipt', ['Accept' => 'text/html'])
            ->assertStatus(401);
    }

    public function test_an_unauthenticated_xhr_request_gets_401(): void
    {
        $this->getJson('/api/tenancy-applications/APP-209912-999999/receipt')
            ->assertStatus(401);
    }
}
