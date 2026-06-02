<?php

namespace Database\Seeders;

use App\Models\RentRevisionApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RentRevisionApplicationSeeder extends Seeder
{
    public function run()
    {
        $tenantUser = User::where('email', 'tenant@nic.in')->first();
        if (!$tenantUser) {
            return;
        }

        RentRevisionApplication::firstOrCreate(
            ['application_no' => 'RR-' . now()->format('Ym') . '-000001'],
            [
                'user_id' => $tenantUser->id,
                'tenancy_uin' => 'RAUID-' . now()->format('Ymd') . '-001',
                'tenancy_agreement_document_no' => 'DOC-TS-001',
                'landlord_name' => 'Landlord Demo',
                'landlord_address' => 'House No. 1, Demo Street, Assam',
                'tenant_name' => $tenantUser->name ?? 'Tenant Demo',
                'tenant_address' => 'House No. 2, Tenant Street, Assam',
                'manager_name' => null,
                'manager_address' => null,
                'rented_premises_description' => 'Rented premises for demo application',
                'present_monthly_rent' => 10000.00,
                'proposed_monthly_rent' => 12000.00,
                'reason_for_rent_revision' => 'Revision requested due to rent agreement terms (demo).',
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

