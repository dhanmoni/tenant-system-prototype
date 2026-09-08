<?php

namespace Tests\Feature;

use App\Constants\ApplicationTypes;
use App\Support\DocumentStore;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * The refusals at `documents.show`.
 *
 * These files were fetchable at /storage/<path> by anyone until 8 September 2026. Now the only way
 * in is a URL this application signed, and the point of these tests is that each way of arriving
 * without one is turned away.
 *
 * Every case here is decided before the controller reaches the database - the signature middleware
 * rejects three of them, and the field registry rejects the other two - so like the rest of this
 * suite it needs no database and is safe to run anywhere.
 */
class DocumentRouteTest extends TestCase
{
    private function signed(array $parameters, ?\DateTimeInterface $expiry = null): string
    {
        return URL::temporarySignedRoute(
            'documents.show',
            $expiry ?? now()->addMinutes(DocumentStore::URL_TTL_MINUTES),
            $parameters
        );
    }

    private function tenancyPhoto(): array
    {
        return [
            'scope' => ApplicationTypes::TENANCY_CERTIFICATE,
            'id' => 1,
            'field' => 'landlord_photo_path',
        ];
    }

    public function test_an_unsigned_request_is_refused(): void
    {
        $url = $this->signed($this->tenancyPhoto());

        $this->get(strtok($url, '?'))->assertForbidden();
    }

    public function test_a_tampered_signature_is_refused(): void
    {
        $url = $this->signed($this->tenancyPhoto());
        $tampered = preg_replace('/signature=[0-9a-f]+/', 'signature=' . str_repeat('0', 64), $url);

        $this->get($tampered)->assertForbidden();
    }

    public function test_an_expired_url_is_refused(): void
    {
        $url = $this->signed($this->tenancyPhoto(), now()->subMinute());

        $this->get($url)->assertForbidden();
    }

    public function test_a_signature_does_not_open_a_column_outside_the_registry(): void
    {
        // A validly signed URL, but naming a column that holds a PAN number rather than a file.
        // The signature is genuine; the registry is what refuses.
        $url = $this->signed([
            'scope' => ApplicationTypes::TENANCY_CERTIFICATE,
            'id' => 1,
            'field' => 'landlord_aadhar',
        ]);

        $this->get($url)->assertNotFound();
    }

    public function test_a_signature_does_not_open_an_unregistered_scope(): void
    {
        $url = $this->signed(['scope' => 'users', 'id' => 1, 'field' => 'password']);

        $this->get($url)->assertNotFound();
    }
}
