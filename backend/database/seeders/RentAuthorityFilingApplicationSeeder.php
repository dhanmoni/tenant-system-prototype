<?php

namespace Database\Seeders;

use App\Models\RentAuthorityFilingApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RentAuthorityFilingApplicationSeeder extends Seeder
{
    public function run()
    {
        $tenantUser = User::where('email', 'tenant@nic.in')->first();
        if (!$tenantUser) {
            return;
        }

        RentAuthorityFilingApplication::firstOrCreate(
            ['application_no' => 'RAF-' . now()->format('Ym') . '-000001'],
            [
                'user_id' => $tenantUser->id,
                'tenancy_uin' => 'RAUID-' . now()->format('Ymd') . '-010',

                'applicant_name' => $tenantUser->name ?? 'Tenant Demo',
                'applicant_residential_address' => 'Residential address of applicant, Assam (demo)',

                'opposite_party_name' => 'Opposite Party Demo',
                'opposite_party_residential_address' => 'Residential address of opposite party, Assam (demo)',

                'particulars_of_violation' => 'Particulars of violation (demo).',
                'jurisdiction_of_rent_authority' => 'Jurisdiction details (demo).',
                'facts_of_case' => 'Facts of the case (demo).',
                'grounds_for_relief' => 'Grounds for relief (demo).',
                'matters_not_previously_filed_or_pending' => 'No prior filings/pending matters (demo).',
                'relief_sought' => 'Relief sought (demo).',
                'interim_order_sought' => 'Interim order sought (demo).',
                'list_of_enclosures' => "1) Enclosure 1\n2) Enclosure 2\n3) Enclosure 3",

                'signature_name' => $tenantUser->name ?? 'Tenant Demo',
                'signature_image_path' => null,
                'status' => 'SUBMITTED',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        );
    }
}

