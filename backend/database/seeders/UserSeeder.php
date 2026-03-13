<?php

namespace Database\Seeders;

use App\Models\Designation;
use App\Models\District;
use App\Models\Office;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $district = District::first();
        $office = Office::where('district_id', $district?->id)->first();
        $designationDirector = Designation::where('name', 'Director')->first();
        $designationAD = Designation::where('name', 'Assistant Director')->first();
        $designationDH = Designation::where('name', 'District Head')->first();
        $designationDA = Designation::where('name', 'District Assistant')->first();

        $users = [
            [
                'name' => 'System Admin',
                'email' => 'admin@nic.in',
                'password' => 'password',
                'role' => User::ROLE_SYSTEM_ADMIN,
                'district_id' => null,
                'office_id' => null,
                'designation_id' => null,
                'phone' => '9999999999',
                'approved_at' => now(),
            ],
            [
                'name' => 'Director User',
                'email' => 'director@nic.in',
                'password' => 'password',
                'role' => User::ROLE_DIRECTOR,
                'district_id' => $district?->id,
                'office_id' => $office?->id,
                'designation_id' => $designationDirector?->id,
                'phone' => '9888888888',
                'approved_at' => now(),
            ],
            [
                'name' => 'Assistant Director User',
                'email' => 'assistant.director@nic.in',
                'password' => 'password',
                'role' => User::ROLE_ASSISTANT_DIRECTOR,
                'district_id' => $district?->id,
                'office_id' => $office?->id,
                'designation_id' => $designationAD?->id,
                'phone' => '9777777777',
                'approved_at' => now(),
            ],
            [
                'name' => 'District Head User',
                'email' => 'district.head@nic.in',
                'password' => 'password',
                'role' => User::ROLE_DISTRICT_HEAD,
                'district_id' => $district?->id,
                'office_id' => $office?->id,
                'designation_id' => $designationDH?->id,
                'phone' => '9666666666',
                'approved_at' => now(),
            ],
            [
                'name' => 'District Assistant User',
                'email' => 'district.assistant@nic.in',
                'password' => 'password',
                'role' => User::ROLE_DISTRICT_ASSISTANT,
                'district_id' => $district?->id,
                'office_id' => $office?->id,
                'designation_id' => $designationDA?->id,
                'phone' => '9555555555',
                'approved_at' => now(),
            ],
            [
                'name' => 'Staff',
                'email' => 'staff@nic.in',
                'password' => 'password',
                'role' => User::ROLE_ASSISTANT_DIRECTOR,
                'district_id' => $district?->id,
                'office_id' => $office?->id,
                'designation_id' => $designationAD?->id,
                'phone' => '9111111110',
                'approved_at' => now(),
            ],
            [
                'name' => 'Tenant Owner',
                'email' => 'tenant@nic.in',
                'password' => 'password',
                'role' => 'tenant owner',
                'district_id' => $district?->id,
                'office_id' => null,
                'designation_id' => null,
                'phone' => '9444444444',
                'approved_at' => now(),
            ],
            [
                'name' => 'User One',
                'email' => 'user1@gmail.com',
                'password' => 'password',
                'role' => 'tenant owner',
                'district_id' => $district?->id,
                'office_id' => null,
                'designation_id' => null,
                'phone' => '9333333333',
                'approved_at' => now(),
            ],
            [
                'name' => 'Landlord / Owner',
                'email' => 'landlord@nic.in',
                'password' => 'password',
                'role' => 'tenant owner',
                'district_id' => $district?->id,
                'office_id' => null,
                'designation_id' => null,
                'phone' => '9222222221',
                'approved_at' => now(),
            ],
        ];

        foreach ($users as $data) {
            $password = $data['password'];
            unset($data['password']);
            User::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                ])
            );
        }

        // Set district head and assistant director on first district
        if ($district) {
            $updates = [];
            $districtHead = User::where('role', User::ROLE_DISTRICT_HEAD)->first();
            $assistantDirector = User::where('role', User::ROLE_ASSISTANT_DIRECTOR)->first();
            if ($districtHead) {
                $updates['district_head_id'] = $districtHead->id;
            }
            if ($assistantDirector) {
                $updates['assistant_director_id'] = $assistantDirector->id;
            }
            if (!empty($updates)) {
                $district->update($updates);
            }
        }
    }
}
