<?php

namespace Database\Seeders;

use App\Models\RentTribunalAppealApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RentTribunalAppealApplicationSeeder extends Seeder
{
    public function run()
    {
        $tenantUser = User::where('email', 'tenant@nic.in')->first();
        if (!$tenantUser) {
            return;
        }

        RentTribunalAppealApplication::firstOrCreate(
            ['application_no' => 'RTA-' . now()->format('Ym') . '-000001'],
            [
                'user_id' => $tenantUser->id,

                'rent_tribunal_at' => 'Rent Tribunal - Demo',
                'tenancy_uin' => 'TC-AS-2603-000001',

                'appellant_name' => $tenantUser->name ?? 'Tenant Demo',
                'appellant_residential_address' => 'Residential address of appellant, Assam (demo)',

                'respondent_name' => 'Respondent Demo',
                'respondent_residential_address' => 'Residential address of respondent, Assam (demo)',

                'order_particulars_against_which_appeal_made' => 'Particulars of Rent Court order (demo).',
                'jurisdiction_of_rent_tribunal' => 'Jurisdiction declaration (demo).',
                'limitation' => 'Within limitation period (demo).',
                'memorandum_of_appeal' => 'Memorandum of appeal with legal grounds (demo).',
                'matters_not_previously_filed_or_pending' => 'No previous pending filings (demo).',

                'relief_sought' => 'Relief(s) sought (demo).',
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

