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
        $districts = District::whereIn('name', ['Nagaon', 'Jorhat'])->get();
        // Fallback for district if not exists (should not happen with migrations)
        if ($districts->isEmpty()) {
            $districts = collect([District::create(['name' => 'Nagaon'])]);
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
            ]
        ];

        $phonePrefix = 9888880000;

        foreach ($districts as $index => $district) {
            $prefix = strtolower(str_replace(' ', '', $district->name));
            $basePhone = $phonePrefix + ($index * 100);

            $users = array_merge($users, [
                [
                    'name' => "District Admin {$district->name}",
                    'email' => "{$prefix}.admin@nic.in",
                    'password' => 'password',
                    'role' => User::ROLE_DISTRICT_ADMIN,
                    'district_id' => $district->id,
                    'phone' => (string)($basePhone + 1),
                    'approved_at' => now(),
                ],
                [
                    'name' => "Rent Authority {$district->name}",
                    'email' => "{$prefix}.ra@nic.in",
                    'password' => 'password',
                    'role' => User::ROLE_RENT_AUTHORITY,
                    'district_id' => $district->id,
                    'phone' => (string)($basePhone + 2),
                    'approved_at' => now(),
                ],
                [
                    'name' => "Rent Court {$district->name}",
                    'email' => "{$prefix}.rc@nic.in",
                    'password' => 'password',
                    'role' => User::ROLE_RENT_COURT,
                    'district_id' => $district->id,
                    'phone' => (string)($basePhone + 3),
                    'approved_at' => now(),
                ],
                [
                    'name' => "Rent Tribunal {$district->name}",
                    'email' => "{$prefix}.rt@nic.in",
                    'password' => 'password',
                    'role' => User::ROLE_RENT_TRIBUNAL,
                    'district_id' => $district->id,
                    'phone' => (string)($basePhone + 4),
                    'approved_at' => now(),
                ],
                [
                    'name' => "RA Assistant {$district->name}",
                    'email' => "{$prefix}.ra.ast@nic.in",
                    'password' => 'password',
                    'role' => User::ROLE_RA_ASSISTANT,
                    'district_id' => $district->id,
                    'phone' => (string)($basePhone + 5),
                    'approved_at' => now(),
                ],
                [
                    'name' => "RC Assistant {$district->name}",
                    'email' => "{$prefix}.rc.ast@nic.in",
                    'password' => 'password',
                    'role' => User::ROLE_RC_ASSISTANT,
                    'district_id' => $district->id,
                    'phone' => (string)($basePhone + 6),
                    'approved_at' => now(),
                ],
                [
                    'name' => "RT Assistant {$district->name}",
                    'email' => "{$prefix}.rt.ast@nic.in",
                    'password' => 'password',
                    'role' => User::ROLE_RT_ASSISTANT,
                    'district_id' => $district->id,
                    'phone' => (string)($basePhone + 7),
                    'approved_at' => now(),
                ],
                [
                    'name' => "Valuer {$district->name}",
                    'email' => "{$prefix}.valuer@nic.in",
                    'password' => 'password',
                    'role' => User::ROLE_VALUER,
                    'district_id' => $district->id,
                    'phone' => (string)($basePhone + 8),
                    'approved_at' => now(),
                ],
                [
                    'name' => "Tenant {$district->name}",
                    'email' => "{$prefix}.tenant@nic.in",
                    'password' => 'password',
                    'role' => User::ROLE_USER,
                    'district_id' => $district->id,
                    'phone' => (string)($basePhone + 9),
                    'approved_at' => now(),
                ],
            ]);
        }

        // Legacy users and multi-role demos removed as per request

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
                $user->district?->update(['district_admin_id' => $user->id]);
            } elseif ($user->role === User::ROLE_RENT_AUTHORITY) {
                $user->district?->update(['assistant_director_id' => $user->id]);
            } elseif ($user->role === User::ROLE_RENT_COURT) {
                $user->district?->update(['district_head_id' => $user->id]);
            } elseif ($user->role === User::ROLE_RENT_TRIBUNAL) {
                $user->district?->update(['rent_tribunal_id' => $user->id]);
            }
        }
    }
}
