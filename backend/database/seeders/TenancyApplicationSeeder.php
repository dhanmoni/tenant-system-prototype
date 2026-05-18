<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\TenancyApplication;
use App\Models\User;
use App\Models\Office;
use App\Models\VillageWard;
use Illuminate\Database\Seeder;

class TenancyApplicationSeeder extends Seeder
{
    public function run()
    {
        $tenantUser = User::where('email', 'tenant@nic.in')->first();
        $landlordUser = User::where('email', 'landlord@nic.in')->first();
        $district = District::first();
        $office = $district ? Office::where('district_id', $district->id)->first() : Office::first();
        $villageWard = $district ? VillageWard::where('district_id', $district->id)->first() : VillageWard::first();
        if (!$tenantUser || !$office || !$villageWard) {
            return;
        }

        $staffUser = User::whereIn('role', ['director', 'assistant_director', 'district_head', 'district_assistant'])->first();

        // Application 1: Fully completed (both parties done)
        $refCode1 = TenancyApplication::generateRefCode('9222222221', '9444444444', now()->subDays(10)->format('Y-m-d'), $villageWard->id);
        TenancyApplication::firstOrCreate(
            ['application_no' => 'APP-' . now()->format('Ym') . '-000001'],
            [
                'ref_code' => $refCode1,
                'user_id' => $tenantUser->id,
                'initiator_role' => 'TENANT',
                'initiator_completed' => true,
                'second_party_completed' => true,
                'landlord_user_id' => $landlordUser ? $landlordUser->id : null,
                'tenant_user_id' => $tenantUser->id,
                'registration_date' => now()->subDays(10),
                'office_id' => $office->id,
                'village_ward_id' => $villageWard->id,
                'apply_type' => 'Joint',
                'status' => 'COMPLETED',
                'current_with' => 'Rent Authority',
                'application_type' => 'Tenancy Certificate',
                'landlord_name' => $landlordUser ? $landlordUser->name : 'Rajesh Kumar',
                'landlord_address' => '123 Main Street, Sample City',
                'landlord_email' => $landlordUser ? $landlordUser->email : 'landlord1@nic.in',
                'landlord_phone' => '9222222221',
                'landlord_pan' => 'ABCDE1234F',
                'landlord_aadhar' => '123456789012',
                'tenant_name' => $tenantUser->name,
                'tenant_address' => '456 Tenant Lane, Sample City',
                'tenant_email' => $tenantUser->email,
                'tenant_phone' => $tenantUser->phone ?? '9444444444',
                'tenant_pan' => 'TENAN1234T',
                'tenant_aadhar' => '987654321098',
                'property_possession_date' => now()->subDays(30),
                'property_rent_payable' => 25000.00,
                'property_premises_description' => '3 BHK Apartment, 1200 sq ft',
                'property_furniture_description' => 'Fully furnished',
                'property_tenancy_duration' => '11 months',
                'uid' => TenancyApplication::generateUid($villageWard, $office->id),
                'district_id' => $district->id,
                'movement_history' => [['status' => 'COMPLETED', 'current_with' => 'Rent Authority', 'moved_at' => now()->toDateTimeString()]],
            ]
        );

        // Application 2: Partial (initiated by landlord, awaiting tenant)
        $refCode2 = TenancyApplication::generateRefCode('9222222221', '9333333333', now()->subDays(5)->format('Y-m-d'), $villageWard->id);
        TenancyApplication::firstOrCreate(
            ['application_no' => 'APP-' . now()->format('Ym') . '-000002'],
            [
                'ref_code' => $refCode2,
                'user_id' => $landlordUser ? $landlordUser->id : null,
                'initiator_role' => 'LANDLORD',
                'initiator_completed' => true,
                'second_party_completed' => false,
                'landlord_user_id' => $landlordUser ? $landlordUser->id : null,
                'tenant_user_id' => null,
                'registration_date' => now()->subDays(5),
                'office_id' => $office->id,
                'village_ward_id' => $villageWard->id,
                'apply_type' => 'Joint',
                'status' => 'PARTIAL',
                'current_with' => null,
                'application_type' => 'Tenancy Certificate',
                'landlord_name' => $landlordUser ? $landlordUser->name : 'Priya Sharma',
                'landlord_address' => '789 Park Avenue, Sample City',
                'landlord_email' => $landlordUser ? $landlordUser->email : 'landlord2@nic.in',
                'landlord_phone' => '9222222221',
                'landlord_pan' => 'FGHIJ5678K',
                'tenant_name' => 'User One',
                'tenant_address' => '',
                'tenant_email' => 'user1@gmail.com',
                'tenant_phone' => '9333333333',
                'tenant_pan' => '',
                'property_possession_date' => now()->subDays(60),
                'property_rent_payable' => 18000.00,
                'property_premises_description' => '2 BHK Apartment, 900 sq ft',
                'property_furniture_description' => 'Semi furnished',
                'property_tenancy_duration' => '11 months',
                'uid' => TenancyApplication::generateUid($villageWard, $office->id),
                'district_id' => $district->id,
                'movement_history' => [['status' => 'PARTIAL', 'current_with' => null, 'moved_at' => now()->toDateTimeString()]],
            ]
        );

        // Application 3: Partial (initiated by property manager, awaiting landlord)
        $refCode3 = TenancyApplication::generateRefCode('9555555511', '9666666611', now()->subDays(3)->format('Y-m-d'), $villageWard->id);
        TenancyApplication::firstOrCreate(
            ['application_no' => 'APP-' . now()->format('Ym') . '-000003'],
            [
                'ref_code' => $refCode3,
                'user_id' => $tenantUser->id,
                'initiator_role' => 'PROPERTY_MANAGER',
                'initiator_completed' => true,
                'second_party_completed' => false,
                'landlord_user_id' => null,
                'tenant_user_id' => null,
                'registration_date' => now()->subDays(3),
                'office_id' => $office->id,
                'village_ward_id' => $villageWard->id,
                'apply_type' => 'Joint',
                'status' => 'PARTIAL',
                'current_with' => null,
                'application_type' => 'Tenancy Certificate',
                'landlord_name' => $landlordUser ? $landlordUser->name : 'Property Owner',
                'landlord_address' => '11 River View, Sample City',
                'landlord_email' => $landlordUser ? $landlordUser->email : 'landlord3@nic.in',
                'landlord_phone' => '9555555511',
                'landlord_pan' => 'LMNOP1234Q',
                'manager_name' => $tenantUser->name,
                'manager_address' => '22 Manager Road, Sample City',
                'manager_email' => $tenantUser->email,
                'manager_phone' => $tenantUser->phone ?? '9666666611',
                'manager_pan' => 'MNGRP1234M',
                'tenant_name' => 'Managed Tenant',
                'tenant_address' => '33 Tenant Avenue, Sample City',
                'tenant_email' => 'managed.tenant@nic.in',
                'tenant_phone' => '9666666611',
                'tenant_pan' => 'TENPM1234T',
                'property_possession_date' => now()->subDays(35),
                'property_rent_payable' => 22000.00,
                'property_premises_description' => 'Manager-initiated tenancy case',
                'property_furniture_description' => 'Semi furnished',
                'property_tenancy_duration' => '11 months',
                'uid' => TenancyApplication::generateUid($villageWard, $office->id),
                'district_id' => $district->id,
                'movement_history' => [['status' => 'PARTIAL', 'current_with' => null, 'moved_at' => now()->toDateTimeString()]],
            ]
        );

        // Application 4: Staff-visible application
        if ($staffUser) {
            $refCode4 = TenancyApplication::generateRefCode('9777777700', '9888888800', now()->subDays(2)->format('Y-m-d'), $villageWard->id);
            TenancyApplication::firstOrCreate(
                ['application_no' => 'APP-' . now()->format('Ym') . '-STAFF0'],
                [
                    'ref_code' => $refCode4,
                    'user_id' => $staffUser->id,
                    'initiator_role' => 'LANDLORD',
                    'initiator_completed' => true,
                    'second_party_completed' => true,
                    'landlord_user_id' => null,
                    'tenant_user_id' => null,
                    'registration_date' => now()->subDays(2),
                    'office_id' => $office->id,
                    'village_ward_id' => $villageWard->id,
                    'apply_type' => 'Joint',
                    'status' => 'COMPLETED',
                    'current_with' => 'NIC Office - ' . $office->name,
                    'application_type' => 'Tenancy Certificate',
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
                    'property_furniture_description' => '',
                    'property_tenancy_duration' => '11 months',
                    'uid' => TenancyApplication::generateUid($villageWard, $office->id),
                    'district_id' => $district->id,
                    'movement_history' => [['status' => 'COMPLETED', 'current_with' => 'NIC Office', 'moved_at' => now()->toDateTimeString()]],
                ]
            );
        }
    }
}
