<?php

namespace Database\Seeders;

use App\Models\OtherChargesRevisionApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class OtherChargesRevisionApplicationSeeder extends Seeder
{
    public function run()
    {
        $tenantUser = User::where('email', 'tenant@nic.in')->first();
        if (!$tenantUser) {
            return;
        }

        OtherChargesRevisionApplication::firstOrCreate(
            ['application_no' => 'RC-' . now()->format('Ym') . '-000001'],
            [
                'user_id' => $tenantUser->id,
                'rent_authority_uid' => 'RAUID-' . now()->format('Ymd') . '-002',
                'tenancy_agreement_document_no' => 'DOC-TS-002',

                'landlord_name' => 'Landlord Demo',
                'landlord_address' => 'House No. 1, Demo Street, Assam',
                'tenant_name' => $tenantUser->name ?? 'Tenant Demo',
                'tenant_address' => 'House No. 2, Tenant Street, Assam',

                'manager_name' => null,
                'manager_address' => null,

                'rented_premises_description' => 'Rented premises for demo application',
                'existing_other_charges_details' => 'Electricity & water charges as per existing agreement.',
                'proposed_other_charges_details' => 'Revised charges for electricity & water based on usage.',
                'reason_for_other_charges_revision' => 'Requested revision for fair billing (demo).',

                'signed_by' => 'tenant',
                'signature_name' => 'Tenant Demo',
                'signature_image_path' => null,
                'status' => 'SUBMITTED',

                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        );
    }
}

