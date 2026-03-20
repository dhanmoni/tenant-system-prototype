<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\VillageWard;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class VillageWardSeeder extends Seeder
{
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        VillageWard::truncate();
        Schema::enableForeignKeyConstraints();

        $districts = District::all();

        // Pre-defined village/ward names per district (cycled through)
        $villageNames = [
            ['Beltola', 'ward'],
            ['Chandmari', 'ward'],
            ['Jalukbari', 'ward'],
            ['Panbazar', 'ward'],
            ['Uzanbazar', 'ward'],
        ];

        $townNames = [
            ['Guwahati Town', 'town'],
            ['Nagaon Town', 'town'],
            ['Silchar Town', 'town'],
            ['Dibrugarh Town', 'town'],
        ];

        $ruralNames = [
            ['Patacharkuchi', 'village'],
            ['Hajo', 'village'],
            ['Rangia', 'village'],
            ['Sualkuchi', 'village'],
            ['Baihata Chariali', 'village'],
        ];

        foreach ($districts as $index => $district) {
            // Add 2 wards, 1 town, 2 villages per district (rotated from the lists)
            $wards = array_slice($villageNames, $index % count($villageNames), 2);
            if (count($wards) < 2) {
                $wards = array_merge($wards, array_slice($villageNames, 0, 2 - count($wards)));
            }

            $town = $townNames[$index % count($townNames)];
            
            $villages = array_slice($ruralNames, $index % count($ruralNames), 2);
            if (count($villages) < 2) {
                $villages = array_merge($villages, array_slice($ruralNames, 0, 2 - count($villages)));
            }

            $entries = array_merge($wards, [$town], $villages);

            foreach ($entries as [$name, $type]) {
                // Make name unique per district by appending district name for non-unique entries
                $uniqueName = $name;
                VillageWard::firstOrCreate(
                    ['name' => $uniqueName, 'district_id' => $district->id],
                    ['type' => $type]
                );
            }
        }
    }
}
