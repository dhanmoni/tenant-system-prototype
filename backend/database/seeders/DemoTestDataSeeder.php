<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\Office;
use App\Models\TenancyApplication;
use App\Models\User;
use App\Models\VillageWard;
use App\Models\RentRevisionApplication;
use App\Models\OtherChargesRevisionApplication;
use App\Models\ValuerAppointmentApplication;
use App\Models\RentCourtPossessionApplication;
use App\Models\RentCourtFilingApplication;
use App\Models\RentAuthorityFilingApplication;
use App\Models\RentCourtAppealApplication;
use App\Models\RentTribunalAppealApplication;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class DemoTestDataSeeder extends Seeder
{
    public function run()
    {
        // 1. Clear existing data
        RentRevisionApplication::truncate();
        OtherChargesRevisionApplication::truncate();
        ValuerAppointmentApplication::truncate();
        RentCourtPossessionApplication::truncate();
        RentCourtFilingApplication::truncate();
        RentAuthorityFilingApplication::truncate();
        RentCourtAppealApplication::truncate();
        RentTribunalAppealApplication::truncate();
        TenancyApplication::truncate();

        // 2. Setup context
        $raAssistantUser = User::where('email', 'ra.assistant@nic.in')->first();
        $primaryDistrict = $raAssistantUser ? District::find($raAssistantUser->district_id) : District::first();
        if (!$primaryDistrict) return;

        // Fetch two other districts to seed additional district data
        $otherDistricts = District::where('id', '!=', $primaryDistrict->id)->take(2)->get();
        $districtsToSeed = collect([$primaryDistrict])->merge($otherDistricts);

        foreach ($districtsToSeed as $district) {
            $offices = Office::where('district_id', $district->id)->orderBy('id')->get();
            $office = $offices->first();
            $villageWard = VillageWard::where('district_id', $district->id)->first();
            $tenantUser = User::where('email', 'tenant@nic.in')->first();
            $landlordUser = User::where('email', 'landlord@nic.in')->first();
            $raAssistant = User::where('role', 'ra_assistant')->first();
            $rcAssistant = User::where('role', 'rc_assistant')->first();
            $rtAssistant = User::where('role', 'rt_assistant')->first();

            if (!$tenantUser) continue;

            // 3. Create a valid COMPLETED tenancy for services
            $uid = "ATRMS-" . str_pad($district->id, 2, '0', STR_PAD_LEFT) . "01" . date('Y') . "-0001";
            TenancyApplication::create([
                'application_no' => 'APP-DEMO-' . str_pad($district->id, 2, '0', STR_PAD_LEFT) . '-001',
                'ref_code' => 'DEMOREF' . str_pad($district->id, 2, '0', STR_PAD_LEFT) . '001',
                'user_id' => $tenantUser->id,
                'initiator_role' => 'TENANT',
                'initiator_completed' => true,
                'second_party_completed' => true,
                'landlord_user_id' => $landlordUser?->id,
                'tenant_user_id' => $tenantUser->id,
                'registration_date' => now()->subMonths(1),
                'office_id' => $office?->id,
                'village_ward_id' => $villageWard?->id,
                'apply_type' => 'Joint',
                'status' => 'COMPLETED',
                'application_type' => 'Tenancy Certificate',
                'landlord_name' => 'John Landlord',
                'landlord_address' => 'Demo Address',
                'landlord_email' => 'landlord@demo.com',
                'landlord_phone' => '9222222221',
                'tenant_name' => $tenantUser->name,
                'tenant_address' => 'Demo Tenant Address',
                'tenant_email' => $tenantUser->email,
                'tenant_phone' => $tenantUser->phone,
                'property_possession_date' => now()->subMonths(2),
                'property_rent_payable' => 15000,
                'property_premises_description' => 'Demo Premises for Service Tests',
                'property_tenancy_duration' => '11 months',
                'uid' => $uid,
                'district_id' => $district->id,
            ]);

            // Extra UIN apps spread across circle offices so the district map can show per-subdivision counts.
            if ($offices->count() > 0) {
                $extraCount = min(8, $offices->count());
                for ($n = 0; $n < $extraCount; $n++) {
                    $circleOffice = $offices[$n % $offices->count()];
                    TenancyApplication::create([
                        'application_no' => 'APP-DEMO-' . str_pad($district->id, 2, '0', STR_PAD_LEFT) . '-C' . str_pad((string) ($n + 2), 2, '0', STR_PAD_LEFT),
                        'ref_code' => 'DEMOREF' . str_pad($district->id, 2, '0', STR_PAD_LEFT) . 'C' . str_pad((string) ($n + 2), 2, '0', STR_PAD_LEFT),
                        'user_id' => $tenantUser->id,
                        'initiator_role' => 'TENANT',
                        'initiator_completed' => true,
                        'second_party_completed' => true,
                        'landlord_user_id' => $landlordUser?->id,
                        'tenant_user_id' => $tenantUser->id,
                        'registration_date' => now()->subDays(20 + $n),
                        'office_id' => $circleOffice->id,
                        'village_ward_id' => $villageWard?->id,
                        'apply_type' => 'Joint',
                        'status' => $n % 3 === 0 ? 'COMPLETED' : 'SUBMITTED',
                        'application_type' => 'Tenancy Certificate',
                        'landlord_name' => 'Circle Landlord ' . ($n + 1),
                        'landlord_address' => 'Demo Address',
                        'landlord_email' => 'landlord' . ($n + 1) . '@demo.com',
                        'landlord_phone' => '92222222' . str_pad((string) ($n + 10), 2, '0', STR_PAD_LEFT),
                        'tenant_name' => $tenantUser->name,
                        'tenant_address' => 'Demo Tenant Address',
                        'tenant_email' => $tenantUser->email,
                        'tenant_phone' => $tenantUser->phone,
                        'property_possession_date' => now()->subMonths(2),
                        'property_rent_payable' => 10000 + ($n * 500),
                        'property_premises_description' => 'Circle office demo premises ' . ($n + 1),
                        'property_tenancy_duration' => '11 months',
                        'uid' => 'ATRMS-' . str_pad($district->id, 2, '0', STR_PAD_LEFT) . str_pad((string) ($n + 2), 2, '0', STR_PAD_LEFT) . date('Y') . '-' . str_pad((string) ($n + 2), 4, '0', STR_PAD_LEFT),
                        'district_id' => $district->id,
                    ]);
                }
            }
            // 4. Create Service Applications in different stages (Distribution: 2 IN-REVIEW, 1 REJECTED, 2 SUBMITTED, 1 COMPLETED)

            // 5. Add specific distribution to each category (2 IN-REVIEW, 1 REJECTED, 2 SUBMITTED, 1 COMPLETED)
            $categories = [
                ['model' => RentRevisionApplication::class, 'prefix' => '10', 'assistant' => 'ra_assistant', 'head' => 'rent_authority'],
                ['model' => RentAuthorityFilingApplication::class, 'prefix' => '20', 'assistant' => 'ra_assistant', 'head' => 'rent_authority'],
                ['model' => RentCourtFilingApplication::class, 'prefix' => '30', 'assistant' => 'rc_assistant', 'head' => 'rent_court'],
                ['model' => RentCourtPossessionApplication::class, 'prefix' => '40', 'assistant' => 'rc_assistant', 'head' => 'rent_court'],
                ['model' => RentTribunalAppealApplication::class, 'prefix' => '50', 'assistant' => 'rt_assistant', 'head' => 'rent_tribunal'],
                ['model' => OtherChargesRevisionApplication::class, 'prefix' => '60', 'assistant' => 'ra_assistant', 'head' => 'rent_authority'],
            ];

            foreach ($categories as $cat) {
                for ($i = 1; $i <= 6; $i++) {
                    $status = match ($i) {
                        1, 2 => 'IN_REVIEW',
                        3 => 'REJECTED',
                        4, 5 => 'SUBMITTED',
                        6 => 'COMPLETED',
                    };
                    
                    $role = match ($i) {
                        1, 2 => $cat['head'],
                        4, 5 => $cat['assistant'],
                        default => null,
                    };

                    $data = [
                        'application_no' => 'APP-' . str_pad($district->id, 2, '0', STR_PAD_LEFT) . date('Y') . '-' . $cat['prefix'] . $i,
                        'user_id' => $tenantUser->id,
                        'district_id' => $district->id,
                        'tenancy_uin' => $uid,
                        'signature_name' => $tenantUser->name,
                        'status' => $status,
                        'assigned_to_role' => $role,
                    ];

                    // Add specific fields based on model
                    if ($cat['model'] === RentRevisionApplication::class) {
                        $data = array_merge($data, [
                            'landlord_name' => 'Landlord ' . $i,
                            'tenant_name' => $tenantUser->name,
                            'landlord_address' => 'Demo Address ' . $i,
                            'tenant_address' => 'Demo Address ' . $i,
                            'rented_premises_description' => 'Demo Premises ' . $i,
                            'present_monthly_rent' => 10000 + ($i * 1000),
                            'proposed_monthly_rent' => 12000 + ($i * 1000),
                            'reason_for_rent_revision' => 'Annual increase ' . $i,
                        ]);
                    } elseif ($cat['model'] === RentAuthorityFilingApplication::class) {
                        $data = array_merge($data, [
                            'applicant_name' => $tenantUser->name,
                            'applicant_residential_address' => 'Demo Address ' . $i,
                            'opposite_party_name' => 'Opposite Party ' . $i,
                            'opposite_party_residential_address' => 'Demo Address ' . $i,
                        ]);
                    } elseif ($cat['model'] === RentCourtFilingApplication::class) {
                        $data = array_merge($data, [
                            'rent_court_at' => 'District Rent Court',
                            'applicant_name' => $tenantUser->name,
                            'applicant_residential_address' => 'Demo Address ' . $i,
                            'respondent_name' => 'Respondent ' . $i,
                            'respondent_residential_address' => 'Demo Address ' . $i,
                        ]);
                    } elseif ($cat['model'] === RentCourtPossessionApplication::class) {
                        $data = array_merge($data, [
                            'before_rent_court' => 'District Rent Court',
                            'applicant_name' => $tenantUser->name,
                            'applicant_residential_address' => 'Demo Address ' . $i,
                        ]);
                    } elseif ($cat['model'] === RentTribunalAppealApplication::class) {
                        $data = array_merge($data, [
                            'rent_tribunal_at' => 'State Rent Tribunal',
                            'appellant_name' => $tenantUser->name,
                            'appellant_residential_address' => 'Demo Address ' . $i,
                            'respondent_name' => 'Respondent ' . $i,
                            'respondent_residential_address' => 'Demo Address ' . $i,
                        ]);
                    } elseif ($cat['model'] === OtherChargesRevisionApplication::class) {
                        $data = array_merge($data, [
                            'landlord_name' => 'Landlord ' . $i,
                            'tenant_name' => $tenantUser->name,
                            'landlord_address' => 'Demo Address ' . $i,
                            'tenant_address' => 'Demo Address ' . $i,
                            'rented_premises_description' => 'Demo Premises ' . $i,
                            'existing_other_charges_details' => 'Electricity: 500',
                            'proposed_other_charges_details' => 'Electricity: ' . (500 + ($i * 100)),
                            'reason_for_other_charges_revision' => 'Rate hike ' . $i,
                        ]);
                    }

                    // Add workflow fields
                    if ($status === 'IN_REVIEW') {
                        $data['forwarded_at'] = now()->subDays($i);
                        $data['forwarded_by_user_id'] = ($cat['assistant'] === 'ra_assistant') ? $raAssistant?->id : (($cat['assistant'] === 'rc_assistant') ? $rcAssistant?->id : User::where('role', 'rt_assistant')->first()?->id);
                    } elseif ($status === 'REJECTED') {
                        $data['rejected_at'] = now()->subDays($i);
                        $data['rejection_message'] = 'Rejected due to reason ' . $i;
                    } elseif ($status === 'COMPLETED') {
                        $data['approved_at'] = now()->subDays($i);
                    }

                    $cat['model']::create($data);
                }
            }
        }
    }
}
