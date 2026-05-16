<?php

namespace Database\Seeders;

use App\Models\RentCourtAppealApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RentCourtAppealApplicationSeeder extends Seeder
{
    public function run()
    {
        $tenantUser = User::where('email', 'tenant@nic.in')->first();
        if (!$tenantUser) {
            return;
        }

        RentCourtAppealApplication::firstOrCreate(
            ['application_no' => 'RCA-' . now()->format('Ym') . '-000001'],
            [
                'user_id' => $tenantUser->id,
                'rent_court_at' => 'Rent Court - Demo',
                'tenancy_uin' => 'TC-AS-2603-000001',

                'appellant_name' => $tenantUser->name ?? 'Tenant Demo',
                'appellant_residential_address' => 'Appellant residential address, Assam (demo)',

                'respondent_name' => 'Respondent Demo',
                'respondent_residential_address' => 'Respondent residential address, Assam (demo)',

                'order_particulars_against_which_appeal_made' => 'Particulars of Rent Authority order (demo).',
                'jurisdiction_of_rent_court' => 'Jurisdiction declaration (demo).',
                'limitation' => 'Within limitation period under Assam Tenancy Act (demo).',
                'memorandum_of_appeal' => 'Memorandum of appeal (demo).',
                'matters_not_previously_filed_or_pending' => 'No previous filing/pending matters (demo).',
                'relief_sought' => 'Relief(s) sought (demo).',
                'interim_order_sought' => 'Interim relief sought (demo).',
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

