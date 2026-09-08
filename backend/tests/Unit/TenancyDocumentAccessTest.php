<?php

namespace Tests\Unit;

use App\Constants\Roles;
use App\Http\Controllers\TenancyApplicationController;
use App\Models\TenancyApplication;
use App\Models\User;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

/**
 * Who may read a rendered tenancy — the receipt, the acknowledgement, the application details, the
 * agreement — once TenancyDocumentRoutesTest has established that a signed-in account is required
 * at all.
 *
 * Two limbs decide it, and the interesting failures are on opposite sides. userCanAccess() failing
 * open lets a stranger read a tenancy, which is the rule 4(4) breach. officeHolderCanAccess()
 * failing closed lets a Rent Authority officer open a file in the admin UI and then be refused when
 * they press Print, which is how a security fix quietly becomes a support ticket. Both are pinned
 * here.
 *
 * The two predicates are private to the controller because nothing outside it decides this; they
 * are reached by reflection rather than widened for the sake of a test. No database access.
 */
class TenancyDocumentAccessTest extends TestCase
{
    private function invoke(string $method, $user, TenancyApplication $application): bool
    {
        $reflected = new ReflectionMethod(TenancyApplicationController::class, $method);
        $reflected->setAccessible(true);

        return $reflected->invoke(new TenancyApplicationController(), $user, $application);
    }

    private function tenancy(array $attributes = []): TenancyApplication
    {
        return (new TenancyApplication())->forceFill(array_merge([
            'application_no' => 'ATRMS-0101-2026-0001',
            'district_id' => 4,
            'office_id' => 11,
            'user_id' => 7,
            'landlord_user_id' => 1,
            'tenant_user_id' => 2,
            'landlord_phone' => '9000000001',
            'tenant_phone' => '9000000002',
            'landlord_email' => 'landlord@example.com',
            'tenant_email' => 'tenant@example.com',
        ], $attributes));
    }

    private function user(array $attributes): User
    {
        return (new User())->forceFill(array_merge(['role' => Roles::USER], $attributes));
    }

    public function test_the_parties_and_the_filer_may_read_the_documents(): void
    {
        $tenancy = $this->tenancy();

        foreach ([1, 2, 7] as $id) {
            $this->assertTrue(
                $this->invoke('userCanAccess', $this->user(['id' => $id]), $tenancy),
                "account {$id} is a party to this tenancy and must be able to print it"
            );
        }
    }

    public function test_a_signed_in_stranger_may_not_read_the_documents(): void
    {
        $stranger = $this->user([
            'id' => 99,
            'phone' => '9000000099',
            'email' => 'stranger@example.com',
        ]);

        $tenancy = $this->tenancy();

        $this->assertFalse($this->invoke('userCanAccess', $stranger, $tenancy));
        $this->assertFalse($this->invoke('officeHolderCanAccess', $stranger, $tenancy));
    }

    public function test_a_citizen_account_is_not_an_office_holder_even_in_the_same_district(): void
    {
        $citizen = $this->user(['id' => 99, 'district_id' => 4]);

        $this->assertFalse(
            $this->invoke('officeHolderCanAccess', $citizen, $this->tenancy()),
            'district_id on a citizen account records where they live, not an office they hold'
        );
    }

    public function test_office_holders_in_the_district_may_read_the_documents(): void
    {
        $roles = array_merge(Roles::allAdmin(), Roles::principals(), Roles::assistants());

        foreach ($roles as $role) {
            $this->assertTrue(
                $this->invoke('officeHolderCanAccess', $this->user(['id' => 50, 'role' => $role, 'district_id' => 4]), $this->tenancy()),
                "{$role} handles files in district 4 and must be able to print this one"
            );
        }
    }

    public function test_an_office_holder_from_another_district_may_not(): void
    {
        foreach ([Roles::DISTRICT_ADMIN, Roles::RENT_AUTHORITY, Roles::RA_ASSISTANT] as $role) {
            $this->assertFalse(
                $this->invoke('officeHolderCanAccess', $this->user(['id' => 50, 'role' => $role, 'district_id' => 9]), $this->tenancy()),
                "{$role} of district 9 has no business with a district 4 tenancy"
            );
        }
    }

    public function test_the_valuer_may_not_read_a_tenancy(): void
    {
        $valuer = $this->user(['id' => 50, 'role' => Roles::VALUER, 'district_id' => 4]);

        $this->assertFalse(
            $this->invoke('officeHolderCanAccess', $valuer, $this->tenancy()),
            'the workflow controller lets a Valuer near valuer-appointment applications only'
        );
    }

    public function test_a_citizen_with_an_office_id_is_not_let_in_by_it(): void
    {
        // Only UserManagementController sets office_id, and registration does not, so no citizen
        // has one today. But nothing stops an administrator creating a `user` account with one,
        // and before 8 Sep 2026 that account would have read every tenancy filed at that office:
        // userCanAccess() matched office_id without looking at the role at all.
        $citizen = $this->user(['id' => 99, 'role' => Roles::USER, 'office_id' => 11]);

        $this->assertFalse(
            $this->invoke('userCanAccess', $citizen, $this->tenancy(['office_id' => 11])),
            'sharing an office number with a tenancy is not being a party to it'
        );
    }

    public function test_an_officer_is_still_let_in_by_their_office(): void
    {
        foreach ([Roles::RENT_AUTHORITY, Roles::RA_ASSISTANT, Roles::DISTRICT_ADMIN] as $role) {
            $this->assertTrue(
                $this->invoke('userCanAccess', $this->user(['id' => 50, 'role' => $role, 'office_id' => 11]), $this->tenancy(['office_id' => 11])),
                "{$role} serves in office 11 and handles its files"
            );
        }
    }

    public function test_super_admin_reads_any_district(): void
    {
        $superAdmin = $this->user(['id' => 50, 'role' => Roles::SUPER_ADMIN, 'district_id' => 9]);

        $this->assertTrue($this->invoke('officeHolderCanAccess', $superAdmin, $this->tenancy()));
    }
}
