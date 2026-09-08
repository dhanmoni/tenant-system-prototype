<?php

namespace Tests\Unit;

use App\Constants\ApplicationTypes;
use App\Http\Controllers\ApplicationWorkflowController;
use App\Models\TenancyApplication;
use App\Models\User;
use App\Support\DocumentStore;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * Uploaded files - passport photographs, signatures, PAN cards, agreements - were on the `public`
 * disk until 8 September 2026, which the web server serves at /storage/<path> to anyone at all.
 * Rule 4(4) of the Assam Tenancy Rules, 2025 forbids exactly that. They are now on a private disk
 * and leave only through a signed, expiring URL.
 *
 * These tests pin the parts of that arrangement which fail silently if they drift: a disk that is
 * quietly web-servable again, a field registry that lets a URL name a column it should not, and a
 * URL that carries no expiry.
 *
 * No database and no filesystem access.
 */
class DocumentStoreTest extends TestCase
{
    public function test_the_documents_disk_is_not_web_served(): void
    {
        $disk = config('filesystems.disks.' . DocumentStore::DISK);

        $this->assertIsArray($disk, 'the documents disk must be configured');
        $this->assertArrayNotHasKey(
            'url',
            $disk,
            'a `url` on this disk is how these files become public addresses again'
        );
        $this->assertSame('private', $disk['visibility'] ?? null);

        $root = str_replace('\\', '/', $disk['root']);
        $this->assertStringNotContainsString(
            '/public',
            $root,
            'the disk root must not be inside anything symlinked into the document root'
        );

        $links = array_map(fn ($target) => str_replace('\\', '/', $target), config('filesystems.links', []));
        $this->assertNotContains(
            $root,
            $links,
            'storage:link would publish the whole documents disk'
        );
    }

    public function test_a_minted_url_is_signed_and_expires(): void
    {
        $tenancy = (new TenancyApplication())->forceFill([
            'id' => 7,
            'landlord_photo_path' => 'tenancy/photos/abc.jpg',
        ]);

        $url = DocumentStore::url(
            ApplicationTypes::TENANCY_CERTIFICATE,
            $tenancy->id,
            'landlord_photo_path',
            $tenancy->landlord_photo_path
        );

        $this->assertNotNull($url);
        $this->assertStringContainsString('signature=', $url);
        $this->assertStringContainsString('expires=', $url);
        $this->assertStringNotContainsString(
            '/storage/',
            $url,
            'the file must not be addressed through the web-served disk'
        );
        $this->assertStringNotContainsString(
            'tenancy/photos/abc.jpg',
            $url,
            'the URL names a record and a column, never the stored path'
        );

        $this->assertTrue(URL::hasValidSignature($this->requestFor($url)));
    }

    public function test_a_record_without_that_file_gets_no_url(): void
    {
        $this->assertNull(DocumentStore::url(ApplicationTypes::TENANCY_CERTIFICATE, 7, 'landlord_photo_path', null));
        $this->assertNull(DocumentStore::url(ApplicationTypes::TENANCY_CERTIFICATE, null, 'landlord_photo_path', 'a.jpg'));
    }

    public function test_a_column_outside_the_registry_gets_no_url(): void
    {
        foreach (['landlord_aadhar', 'landlord_pan', 'password', 'remember_token'] as $field) {
            $this->assertNull(
                DocumentStore::url(ApplicationTypes::TENANCY_CERTIFICATE, 7, $field, 'anything'),
                "{$field} holds no file and must never be reachable through documents.show"
            );
        }
    }

    public function test_every_registered_field_names_a_file_path(): void
    {
        foreach (DocumentStore::scopes() as $scope => $fields) {
            $this->assertNotNull(
                DocumentStore::modelFor($scope),
                "scope {$scope} resolves to no model, so its URLs would always 404"
            );

            foreach ($fields as $field) {
                $this->assertStringEndsWith('_path', $field, "{$scope}.{$field}");
            }
        }
    }

    public function test_every_service_form_can_serve_its_signature(): void
    {
        foreach (ApplicationTypes::serviceForms() as $type) {
            $this->assertSame(
                ['signature_image_path'],
                DocumentStore::fieldsFor($type),
                "{$type} carries a signature image and must be able to render it"
            );
        }
    }

    public function test_urls_are_keyed_the_way_the_frontend_reads_them(): void
    {
        $tenancy = (new TenancyApplication())->forceFill([
            'id' => 7,
            'landlord_photo_path' => 'tenancy/photos/abc.jpg',
            'agreement_pdf_path' => 'tenancy/agreements/abc.pdf',
        ]);

        $urls = DocumentStore::urlsFor($tenancy, ApplicationTypes::TENANCY_CERTIFICATE);

        $this->assertNotNull($urls['landlord_photo_url'] ?? null);
        $this->assertNotNull($urls['agreement_pdf_url'] ?? null);
        // Present and null, not absent: the browser tests these keys for truthiness.
        $this->assertArrayHasKey('tenant_photo_url', $urls);
        $this->assertNull($urls['tenant_photo_url']);
    }

    public function test_a_model_is_matched_to_its_own_scope(): void
    {
        $this->assertSame(
            ApplicationTypes::TENANCY_CERTIFICATE,
            DocumentStore::scopeFor(new TenancyApplication())
        );
        $this->assertSame(DocumentStore::USER_SCOPE, DocumentStore::scopeFor(new User()));
    }

    public function test_the_type_to_model_map_has_one_copy(): void
    {
        foreach (ApplicationTypes::all() as $type) {
            $this->assertSame(
                ApplicationTypes::modelFor($type),
                (new ApplicationWorkflowController())->getModel($type),
                "{$type} resolves to different models in the workflow controller and the registry"
            );
        }
    }

    public function test_the_serving_route_is_signed(): void
    {
        $route = collect(Route::getRoutes())->first(
            fn ($candidate) => $candidate->getName() === 'documents.show'
        );

        $this->assertNotNull($route, 'documents.show must exist');
        $this->assertContains(
            'signed',
            $route->gatherMiddleware(),
            'without `signed` this route hands any file to anyone who can type a record id'
        );
    }

    private function requestFor(string $url): \Illuminate\Http\Request
    {
        return \Illuminate\Http\Request::create($url, 'GET');
    }
}
