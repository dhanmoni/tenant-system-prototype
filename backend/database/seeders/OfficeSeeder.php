<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\Office;
use App\Models\State;
use Illuminate\Database\Seeder;

class OfficeSeeder extends Seeder
{
    public function run()
    {
        $districts = District::with('state')->get();

        foreach ($districts as $district) {
            Office::firstOrCreate(
                [
                    'name' => 'Office - ' . $district->name,
                    'district_id' => $district->id,
                ],
                [
                    'state_id' => $district->state_id,
                    'address' => 'Sample Address, ' . $district->name . ', ' . $district->state->name,
                ]
            );
        }
    }
}
