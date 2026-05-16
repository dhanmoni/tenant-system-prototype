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
        // Fallback for district if not exists (should not happen with migrations)
        if (!$district) {
            $district = District::create(['name' => 'Kamrup']);
        }

        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@nic.in',
                'password' => 'password',
                'role' => User::ROLE_SUPER_ADMIN,
                'district_id' => null,
                'phone' => '9999999999',
                'approved_at' => now(),
            ],
            [
                'name' => 'District Admin User',
                'email' => 'district.admin@nic.in',
                'password' => 'password',
                'role' => User::ROLE_DISTRICT_ADMIN,
                'district_id' => $district->id,
                'phone' => '9888888888',
                'approved_at' => now(),
            ],
            [
                'name' => 'Rent Authority User',
                'email' => 'rent.authority@nic.in',
                'password' => 'password',
                'role' => User::ROLE_RENT_AUTHORITY,
                'district_id' => $district->id,
                'phone' => '9777777777',
                'approved_at' => now(),
            ],
            [
                'name' => 'Rent Court User',
                'email' => 'rent.court@nic.in',
                'password' => 'password',
                'role' => User::ROLE_RENT_COURT,
                'district_id' => $district->id,
                'phone' => '9666666666',
                'approved_at' => now(),
            ],
            [
                'name' => 'Rent Tribunal User',
                'email' => 'rent.tribunal@nic.in',
                'password' => 'password',
                'role' => User::ROLE_RENT_TRIBUNAL,
                'district_id' => $district->id,
                'phone' => '9555555555',
                'approved_at' => now(),
            ],
            [
                'name' => 'RA Assistant',
                'email' => 'ra.assistant@nic.in',
                'password' => 'password',
                'role' => User::ROLE_RA_ASSISTANT,
                'district_id' => $district->id,
                'phone' => '9111111110',
                'approved_at' => now(),
            ],
            [
                'name' => 'RC Assistant',
                'email' => 'rc.assistant@nic.in',
                'password' => 'password',
                'role' => User::ROLE_RC_ASSISTANT,
                'district_id' => $district->id,
                'phone' => '9111111111',
                'approved_at' => now(),
            ],
            [
                'name' => 'RT Assistant',
                'email' => 'rt.assistant@nic.in',
                'password' => 'password',
                'role' => User::ROLE_RT_ASSISTANT,
                'district_id' => $district->id,
                'phone' => '9111111112',
                'approved_at' => now(),
            ],
            [
                'name' => 'user',
                'email' => 'tenant@nic.in',
                'password' => 'password',
                'role' => User::ROLE_USER,
                'district_id' => $district->id,
                'phone' => '9444444444',
                'approved_at' => now(),
            ],
        ];

        foreach ($users as $data) {
            $password = $data['password'];
            unset($data['password']);
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                ])
            );

            // Link to district if needed
            if ($user->role === User::ROLE_DISTRICT_ADMIN) {
                $district->update(['district_admin_id' => $user->id]);
            } elseif ($user->role === User::ROLE_RENT_AUTHORITY) {
                $district->update(['assistant_director_id' => $user->id]);
            } elseif ($user->role === User::ROLE_RENT_COURT) {
                $district->update(['district_head_id' => $user->id]);
            } elseif ($user->role === User::ROLE_RENT_TRIBUNAL) {
                $district->update(['rent_tribunal_id' => $user->id]);
            }
        }
    }
}
