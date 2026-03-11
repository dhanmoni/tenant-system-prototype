<?php

namespace Database\Seeders;

use App\Models\TenancyApplication;
use App\Models\User;
use App\Models\Office;
use Illuminate\Database\Seeder;

class TenancyApplicationSeeder extends Seeder
{
    public function run()
    {
        $user = User::where('role', 'tenant owner')->first();
        $office = Office::first();
        if (!$user || !$office) {
            return;
        }

        $applications = [
            [
                'application_no' => 'TEN-' . now()->format('Ymd') . '-001',
                'registration_date' => now()->subDays(10),
                'apply_type' => 'New',
                'status' => 'Under process',
                'current_with' => 'District Office',
                'landlord_name' => 'Rajesh Kumar',
                'landlord_address' => '123 Main Street, Sample City',
                'landlord_email' => 'landlord1@nic.in',
                'landlord_phone' => '9111111111',
                'landlord_pan' => 'ABCDE1234F',
                'tenant_name' => $user->name,
                'tenant_address' => '456 Tenant Lane, Sample City',
                'tenant_email' => $user->email,
                'tenant_phone' => $user->phone ?? '9444444444',
                'tenant_pan' => 'TENAN1234T',
                'property_possession_date' => now()->subDays(30),
                'property_rent_payable' => 25000.00,
                'property_premises_description' => '3 BHK Apartment, 1200 sq ft',
                'property_furniture_description' => 'Fully furnished',
                'property_tenancy_duration' => '11 months',
            ],
            [
                'application_no' => 'TEN-' . now()->format('Ymd') . '-002',
                'registration_date' => now()->subDays(5),
                'apply_type' => 'Renewal',
                'status' => 'Pending',
                'current_with' => null,
                'landlord_name' => 'Priya Sharma',
                'landlord_address' => '789 Park Avenue, Sample City',
                'landlord_email' => 'landlord2@nic.in',
                'landlord_phone' => '9222222222',
                'landlord_pan' => 'FGHIJ5678K',
                'tenant_name' => $user->name,
                'tenant_address' => '456 Tenant Lane, Sample City',
                'tenant_email' => $user->email,
                'tenant_phone' => $user->phone ?? '9444444444',
                'tenant_pan' => 'TENAN1234T',
                'property_possession_date' => now()->subDays(60),
                'property_rent_payable' => 18000.00,
                'property_premises_description' => '2 BHK Apartment, 900 sq ft',
                'property_furniture_description' => 'Semi furnished',
                'property_tenancy_duration' => '11 months',
            ],
        ];

        foreach ($applications as $data) {
            TenancyApplication::firstOrCreate(
                ['application_no' => $data['application_no']],
                array_merge($data, [
                    'user_id' => $user->id,
                    'office_id' => $office->id,
                    'application_type' => 'Tenancy Certificate',
                ])
            );
        }
    }
}
