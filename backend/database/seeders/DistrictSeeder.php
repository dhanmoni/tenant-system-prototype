<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\State;
use Illuminate\Database\Seeder;

class DistrictSeeder extends Seeder
{
    public function run()
    {
        $data = [
            'Assam' => ['Kamrup Metropolitan', 'Dibrugarh', 'Jorhat'],
            'Delhi' => ['Central Delhi', 'South Delhi', 'North Delhi'],
            'Maharashtra' => ['Mumbai', 'Pune', 'Nagpur'],
            'Karnataka' => ['Bengaluru Urban', 'Mysuru', 'Belagavi'],
            'Tamil Nadu' => ['Chennai', 'Coimbatore', 'Madurai'],
            'Uttar Pradesh' => ['Lucknow', 'Kanpur', 'Varanasi'],
        ];

        foreach ($data as $stateName => $districtNames) {
            $state = State::where('name', $stateName)->first();
            if (!$state) {
                continue;
            }
            foreach ($districtNames as $name) {
                District::firstOrCreate(
                    ['name' => $name],
                    ['state_id' => $state->id]
                );
            }
        }
    }
}
