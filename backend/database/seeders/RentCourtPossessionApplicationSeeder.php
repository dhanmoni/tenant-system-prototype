<?php

namespace Database\Seeders;

use App\Models\RentCourtPossessionApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RentCourtPossessionApplicationSeeder extends Seeder
{
    public function run()
    {
        $tenantUser = User::where('email', 'tenant@nic.in')->first();
        if (!$tenantUser) {
            return;
        }

        RentCourtPossessionApplication::firstOrCreate(
            ['application_no' => 'RC-' . now()->format('Ym') . '-000001'],
            [
                'user_id' => $tenantUser->id,
                'before_rent_court' => 'Before the Rent Court - Demo',
                'applicant_name' => $tenantUser->name ?? 'Tenant Demo',
                'applicant_residential_address' => 'Demo residential address, Assam',
                'tenancy_uin' => 'UID-DEMO-001',
                'tenant_name' => 'Tenant Demo',

                'jurisdiction_statement' => 'The applicant states that this matter is within the jurisdiction of the Rent Court.',
                'facts_of_case' => 'Premises were rented out to the tenant, and recovery of possession is requested as per rules (demo).',
                'grounds_for_relief' => 'Grounds for recovery of possession (demo).',
                'matters_not_previously_filed' => 'Applicant declares no previous filing/pending matter (demo).',
                'relief_sought' => 'Recovery of possession of the premises (demo).',
                'interim_order_sought' => 'Interim relief as deemed fit by the Rent Court (demo).',
                'enclosures_list' => '1) Application copy; 2) Evidence; 3) Supporting documents (demo).',

                'signature_name' => 'Tenant Demo',
                'signature_image_path' => null,
                'status' => 'SUBMITTED',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        );
    }
}

