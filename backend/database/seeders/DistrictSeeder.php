<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\State;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DistrictSeeder extends Seeder
{
    public function run()
    {
        // Truncate all districts (disable FK constraints so offices/users don't block)
        Schema::disableForeignKeyConstraints();
        District::truncate();
        Schema::enableForeignKeyConstraints();

        $state = State::where('name', 'Assam')->first();
        if (!$state) {
            $this->command->warn('State "Assam" not found. Run StateSeeder first.');
            return;
        }

        // All Assam districts in serial order (by division: Lower Assam, North, Upper, Central, Barak Valley)
        $assamDistricts = [
            // Lower Assam
            'Baksa', 'Barpeta', 'Bongaigaon', 'Chirang', 'Dhubri', 'Goalpara', 'Nalbari',
            'Kamrup Metropolitan', 'Kamrup Rural', 'Kokrajhar', 'South Salmara-Mankachar', 'Bajali', 'Tamulpur',
            // North Assam
            'Darrang', 'Sonitpur', 'Udalguri', 'Biswanath',
            // Upper Assam
            'Charaideo', 'Dhemaji', 'Dibrugarh', 'Golaghat', 'Jorhat', 'Lakhimpur', 'Majuli', 'Sivasagar', 'Tinsukia',
            // Central Assam
            'Dima Hasao', 'West Karbi Anglong', 'Karbi Anglong', 'Morigaon', 'Nagaon', 'Hojai',
            // Barak Valley
            'Cachar', 'Hailakandi', 'Karimganj',
        ];

        foreach ($assamDistricts as $name) {
            District::create([
                'name' => $name,
                'state_id' => $state->id,
            ]);
        }
    }
}
