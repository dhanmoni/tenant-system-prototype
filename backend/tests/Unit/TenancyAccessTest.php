<?php

namespace Tests\Unit;

use App\Models\TenancyApplication;
use App\Models\User;
use App\Support\TenancyAccess;
use PHPUnit\Framework\TestCase;

/**
 * Rule 4(4) confines tenancy details to "concerned Parties only". These tests pin the two ways that
 * gate could quietly fail open: an account that is not a party being let through, and a record with
 * blank contact details matching an account with blank contact details.
 *
 * No database access, so this is safe to run against any environment.
 */
class TenancyAccessTest extends TestCase
{
    private function tenancy(array $attributes): TenancyApplication
    {
        return (new TenancyApplication())->forceFill($attributes);
    }

    private function user(array $attributes): User
    {
        return (new User())->forceFill($attributes);
    }

    public function test_landlord_tenant_and_filer_accounts_are_concerned_parties(): void
    {
        $tenancy = $this->tenancy([
            'user_id' => 7,
            'landlord_user_id' => 1,
            'tenant_user_id' => 2,
        ]);

        foreach ([1, 2, 7] as $id) {
            $this->assertTrue(
                TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => $id])),
                "account {$id} should be a party to this tenancy"
            );
        }
    }

    public function test_a_signed_in_stranger_is_not_a_concerned_party(): void
    {
        $tenancy = $this->tenancy([
            'user_id' => 7,
            'landlord_user_id' => 1,
            'tenant_user_id' => 2,
            'landlord_phone' => '9000000001',
            'tenant_phone' => '9000000002',
            'landlord_email' => 'landlord@example.com',
            'tenant_email' => 'tenant@example.com',
        ]);

        $stranger = $this->user([
            'id' => 99,
            'phone' => '9000000099',
            'email' => 'stranger@example.com',
        ]);

        $this->assertFalse(TenancyAccess::isConcernedParty($tenancy, $stranger));
    }

    public function test_an_unauthenticated_caller_is_not_a_concerned_party(): void
    {
        $this->assertFalse(
            TenancyAccess::isConcernedParty($this->tenancy(['landlord_user_id' => 1]), null)
        );
    }

    /**
     * Records filed before the party columns were linked to accounts carry the parties only as the
     * contact details from the intimation, so those still have to resolve.
     */
    public function test_party_is_recognised_by_phone_or_email_when_no_account_is_linked(): void
    {
        $tenancy = $this->tenancy([
            'landlord_phone' => '9000000001',
            'tenant_email' => 'Tenant@Example.com',
            'manager_phone' => '9000000003',
        ]);

        $this->assertTrue(TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 11, 'phone' => '9000000001'])));
        $this->assertTrue(TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 12, 'phone' => '9000000003'])));

        // The intimation and the account registration are two separate typings of one number.
        $this->assertTrue(
            TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 14, 'phone' => '+91 90000 00001']))
        );
        $this->assertFalse(
            TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 15, 'phone' => '+91 90000 00009']))
        );

        // Addresses are compared without regard to case; a party must not be locked out of their
        // own tenancy because the intimation capitalised their address differently.
        $this->assertTrue(
            TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 13, 'email' => 'tenant@example.com']))
        );
    }

    /**
     * A subscriber number whose own first digits are 91 must survive normalisation intact. Under a
     * loose "starts with 91" rule, 9101424242 would be cut down to 01424242 and its owner refused
     * their own tenancy, while a stranger on 01424242 would be let in.
     */
    public function test_a_number_beginning_91_is_not_mistaken_for_a_country_code(): void
    {
        $tenancy = $this->tenancy(['landlord_phone' => '9101424242']);

        $this->assertTrue(
            TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 21, 'phone' => '9101424242']))
        );
        $this->assertTrue(
            TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 22, 'phone' => '+91 91014 24242']))
        );

        $this->assertFalse(
            TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 23, 'phone' => '01424242']))
        );
        $this->assertFalse(
            TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 24, 'phone' => '1424242']))
        );
    }

    /**
     * The shapes one number is written in. Getting these wrong refuses a party their own tenancy,
     * so each is pinned rather than left to the reader of the regex.
     */
    public function test_country_code_and_trunk_prefix_forms_of_one_number_all_match(): void
    {
        $tenancy = $this->tenancy(['tenant_phone' => '9000000001']);

        $forms = [
            '9000000001',
            '+91 90000 00001',
            '919000000001',
            '09000000001',
            '0919000000001',
            '+91-9000000001',
        ];

        foreach ($forms as $i => $form) {
            $this->assertTrue(
                TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 30 + $i, 'phone' => $form])),
                "{$form} should resolve to the same subscriber as 9000000001"
            );
        }
    }

    /**
     * The trap in the contact-details fallback: a record with no landlord phone and an account with
     * no phone are both null, and a careless comparison makes every such account a party to every
     * such record. That would hand the whole register to one signed-in stranger.
     */
    public function test_blank_contact_details_do_not_match_each_other(): void
    {
        $tenancy = $this->tenancy([
            'user_id' => 7,
            'landlord_phone' => null,
            'landlord_email' => '',
            'tenant_phone' => null,
            'tenant_email' => null,
            'manager_phone' => null,
            'manager_email' => null,
        ]);

        $noContact = $this->user(['id' => 99, 'phone' => null, 'email' => null]);
        $blankContact = $this->user(['id' => 98, 'phone' => '', 'email' => '']);

        $this->assertFalse(TenancyAccess::isConcernedParty($tenancy, $noContact));
        $this->assertFalse(TenancyAccess::isConcernedParty($tenancy, $blankContact));
    }

    /**
     * A record whose party columns are all null must not match an account whose id is null-ish.
     */
    public function test_unlinked_party_columns_do_not_match_an_account(): void
    {
        $tenancy = $this->tenancy([
            'user_id' => null,
            'landlord_user_id' => null,
            'tenant_user_id' => null,
        ]);

        $this->assertFalse(TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 0])));
        $this->assertFalse(TenancyAccess::isConcernedParty($tenancy, $this->user(['id' => 5])));
    }

    /**
     * One string for every refusal. If someone adds a second, the endpoint starts distinguishing
     * "no such UIN" from "not your UIN" again and the UIN space becomes enumerable.
     */
    public function test_the_refusal_message_reveals_nothing_about_the_record(): void
    {
        $message = strtolower(TenancyAccess::NOT_AVAILABLE);

        $this->assertNotSame('', trim($message));
        foreach (['cancelled', 'withdrawn', 'exists', 'not found', 'belongs to'] as $leak) {
            $this->assertStringNotContainsString($leak, $message);
        }
    }
}
