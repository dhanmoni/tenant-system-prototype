<?php

namespace Database\Seeders;

use App\Models\State;
use Illuminate\Database\Seeder;

class StateSeeder extends Seeder
{
    public function run()
    {
        $states = [
            'Assam',
        ];

        foreach ($states as $name) {
            State::firstOrCreate(['name' => $name]);
        }
    }
}
