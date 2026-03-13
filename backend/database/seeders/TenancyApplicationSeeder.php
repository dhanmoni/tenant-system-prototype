<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\TenancyApplication;
use App\Models\User;
use App\Models\Office;
use Illuminate\Database\Seeder;

class TenancyApplicationSeeder extends Seeder
{
    public function run()
    {
        $tenantUser = User::where('role', 'tenant owner')->first();
        // Use same office as staff (first office in first district) so staff see these applications
        $district = District::first();
        $office = $district ? Office::where('district_id', $district->id)->first() : Office::first();
        if (!$tenantUser || !$office) {
            return;
        }

        $staffUser = User::whereIn('role', ['director', 'assistant_director', 'district_head', 'district_assistant'])->first();

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
                'tenant_name' => $tenantUser->name,
                'tenant_address' => '456 Tenant Lane, Sample City',
                'tenant_email' => $tenantUser->email,
                'tenant_phone' => $tenantUser->phone ?? '9444444444',
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
                'status' => 'Submitted',
                'current_with' => 'NIC Office',
                'landlord_name' => 'Priya Sharma',
                'landlord_address' => '789 Park Avenue, Sample City',
                'landlord_email' => 'landlord2@nic.in',
                'landlord_phone' => '9222222222',
                'landlord_pan' => 'FGHIJ5678K',
                'tenant_name' => $tenantUser->name,
                'tenant_address' => '456 Tenant Lane, Sample City',
                'tenant_email' => $tenantUser->email,
                'tenant_phone' => $tenantUser->phone ?? '9444444444',
                'tenant_pan' => 'TENAN1234T',
                'property_possession_date' => now()->subDays(60),
                'property_rent_payable' => 18000.00,
                'property_premises_description' => '2 BHK Apartment, 900 sq ft',
                'property_furniture_description' => 'Semi furnished',
                'property_tenancy_duration' => '11 months',
            ],
            [
                'application_no' => 'TEN-' . now()->format('Ymd') . '-003',
                'registration_date' => now()->subDays(3),
                'apply_type' => 'New',
                'status' => 'Pending',
                'current_with' => null,
                'landlord_name' => 'Amit Singh',
                'landlord_address' => '10 Green Park, Guwahati',
                'landlord_email' => 'amit@example.com',
                'landlord_phone' => '9333333333',
                'landlord_pan' => 'PANAM1234A',
                'tenant_name' => 'Demo Tenant',
                'tenant_address' => '20 Housing Colony, Guwahati',
                'tenant_email' => 'demo@example.com',
                'tenant_phone' => '9444444400',
                'tenant_pan' => 'TENDE1234D',
                'property_possession_date' => now()->subDays(15),
                'property_rent_payable' => 22000.00,
                'property_premises_description' => '3 BHK, 1100 sq ft',
                'property_furniture_description' => 'Fully furnished',
                'property_tenancy_duration' => '11 months',
            ],
            [
                'application_no' => 'TEN-' . now()->format('Ymd') . '-004',
                'registration_date' => now()->subDay(),
                'apply_type' => 'Renewal',
                'status' => 'Under process',
                'current_with' => 'District Office',
                'landlord_name' => 'Sneha Patel',
                'landlord_address' => '5 MG Road, Guwahati',
                'landlord_email' => 'sneha@example.com',
                'landlord_phone' => '9555555500',
                'landlord_pan' => 'PASNE5678S',
                'tenant_name' => 'Staff View Tenant',
                'tenant_address' => '15 Zoo Road, Guwahati',
                'tenant_email' => 'tenant2@nic.in',
                'tenant_phone' => '9666666600',
                'tenant_pan' => 'TENST1234S',
                'property_possession_date' => now()->subDays(90),
                'property_rent_payable' => 19500.00,
                'property_premises_description' => '2 BHK, 950 sq ft',
                'property_furniture_description' => 'Semi furnished',
                'property_tenancy_duration' => '11 months',
            ],
        ];

        foreach ($applications as $data) {
            $appNo = $data['application_no'];
            TenancyApplication::firstOrCreate(
                ['application_no' => $appNo],
                array_merge($data, [
                    'user_id' => $tenantUser->id,
                    'office_id' => $office->id,
                    'application_type' => 'Tenancy Certificate',
                ])
            );
        }

        // One application linked to staff user_id so staff always see at least one (office + user)
        if ($staffUser) {
            TenancyApplication::firstOrCreate(
                ['application_no' => 'TEN-' . now()->format('Ymd') . '-STAFF'],
                [
                    'user_id' => $staffUser->id,
                    'office_id' => $office->id,
                    'application_type' => 'Tenancy Certificate',
                    'registration_date' => now()->subDays(2),
                    'apply_type' => 'New',
                    'status' => 'Submitted',
                    'current_with' => 'NIC Office - ' . $office->name,
                    'landlord_name' => 'Office Landlord',
                    'landlord_address' => '1 Staff Area, Assam',
                    'landlord_email' => 'office.landlord@nic.in',
                    'landlord_phone' => '9777777700',
                    'landlord_pan' => 'PANOF1234O',
                    'tenant_name' => 'Staff Office Tenant',
                    'tenant_address' => '2 Staff Area, Assam',
                    'tenant_email' => 'staff.tenant@nic.in',
                    'tenant_phone' => '9888888800',
                    'tenant_pan' => 'TENOF1234O',
                    'property_possession_date' => now()->subDays(20),
                    'property_rent_payable' => 20000.00,
                    'property_premises_description' => 'Office-linked application',
                    'property_furniture_description' => 'N/A',
                    'property_tenancy_duration' => '11 months',
                ]
            );
        }
    }
}
