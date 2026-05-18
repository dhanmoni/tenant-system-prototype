<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\User;
use App\Models\ValuerAppointmentApplication;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ValuerAppointmentApplicationSeeder extends Seeder
{
    public function run()
    {
        $tenantUser = User::where('email', 'tenant@nic.in')->first();
        if (!$tenantUser) {
            return;
        }

        $district = District::first();
        $districtName = $district?->name ?? 'Assam';

        ValuerAppointmentApplication::firstOrCreate(
            ['application_no' => 'VA-' . now()->format('Ym') . '-000001'],
            [
                'user_id' => $tenantUser->id,
                'tenancy_uin' => 'RAUID-' . now()->format('Ymd') . '-003',

                'applicant_name' => 'Applicant Demo',
                'applicant_relation_type' => 'Son',
                'applicant_relation_target_name' => 'Father Demo',
                'applicant_resident_place' => 'Assam',

                'applicant_landlord_or_tenant' => 'tenant',
                'premises_situated_address' => 'Premises situated at demo address',
                'district' => $districtName,

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

