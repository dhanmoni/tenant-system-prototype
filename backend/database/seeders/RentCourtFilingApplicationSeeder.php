<?php

namespace Database\Seeders;

use App\Models\RentCourtFilingApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RentCourtFilingApplicationSeeder extends Seeder
{
    public function run()
    {
        $tenantUser = User::where('email', 'tenant@nic.in')->first();
        if (!$tenantUser) {
            return;
        }

        RentCourtFilingApplication::firstOrCreate(
            ['application_no' => 'RCF-' . now()->format('Ym') . '-000002'],
            [
                'user_id' => $tenantUser->id,
                'rent_court_at' => 'Rent Court - Demo',
                'tenancy_unique_identification_number' => 'TC-AS-2603-000001',

                'applicant_name' => $tenantUser->name ?? 'Tenant Demo',
                'applicant_residential_address' => 'Residential address of the applicant, Assam (demo)',

                'respondent_name' => 'Respondent Demo',
                'respondent_residential_address' => 'Residential address of respondent, Assam (demo)',

                'particulars_of_application' => 'Particulars of application (demo).',
                'jurisdiction_of_rent_court' => 'This matter is within the jurisdiction of the Rent Court (demo).',
                'facts_of_case' => 'Facts of the case in chronological order (demo).',
                'grounds_for_relief' => 'Grounds for relief (demo).',
                'matters_not_previously_filed_or_pending' => 'No previous filing/pending matters (demo).',
                'relief_sought' => 'Specify relief(s) sought (demo).',
                'interim_order_sought' => 'Nature of interim relief sought (demo).',
                'list_of_enclosures' => "1) Enclosure A\n2) Enclosure B\n3) Enclosure C",

                'signature_name' => $tenantUser->name ?? 'Tenant Demo',
                'signature_image_path' => null,
                'status' => 'SUBMITTED',

                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        );
    }
}

