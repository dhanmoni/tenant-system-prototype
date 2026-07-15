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
        $jsonPath = database_path('seeders/data/villages.json');
        if (!file_exists($jsonPath)) {
            $this->command->warn('villages.json not found. Run migrations to populate data or ensure the file exists.');
            return;
        }

        Schema::disableForeignKeyConstraints();
        VillageWard::truncate();
        Schema::enableForeignKeyConstraints();

        $jsonData = json_decode(file_get_contents($jsonPath), true);
        
        $districtMapping = [
            'Kamrup' => 'Kamrup Rural',
            'Nalbari' => 'Nalbari',
            'Barpeta' => 'Barpeta',
            'Mangaldai' => 'Darrang',
            'Dhubri' => 'Dhubri',
            'Goalpara' => 'Goalpara',
            'Bongaigaon' => 'Bongaigaon',
            'Morigaon' => 'Morigaon',
            'Nagaon MB' => 'Nagaon',
            'Hojai' => 'Hojai',
            'Tezpur' => 'Sonitpur',
            'Biswanath' => 'Biswanath',
            'Golaghat' => 'Golaghat',
            'Jorhat' => 'Jorhat',
            'Sivsagar' => 'Sivasagar',
            'charaideo' => 'Charaideo',
            'North Lakhimpur' => 'Lakhimpur',
            'Dibrugarh' => 'Dibrugarh',
            'Tinsukia' => 'Tinsukia',
            'Cachar' => 'Cachar',
            'Hailakandi' => 'Hailakandi',
            'Karimganj' => 'Karimganj',
            'Dhemaji' => 'Dhemaji',
            'Udalguri' => 'Udalguri',
            'Kokrajhar' => 'Kokrajhar',
            'Karbi-Anglong' => 'Karbi Anglong',
            'West karbi-Anglong' => 'West Karbi Anglong'
        ];

        $seededDistrictIds = [];

        foreach ($jsonData as $districtData) {
            $excelDistrictName = $districtData['district_name'];
            $dbDistrictName = $districtMapping[$excelDistrictName] ?? $excelDistrictName;
            
            $district = District::where('name', 'LIKE', '%' . $dbDistrictName . '%')->first();
            
            if ($district) {
                $seededDistrictIds[] = $district->id;
                $insertData = [];
                foreach ($districtData['entries'] as $entry) {
                    $insertData[] = [
                        'area_type' => $entry['area_type'] ?? null,
                        'local_body' => $entry['local_body'] ?? null,
                        'name' => $entry['name'],
                        'type' => $entry['type'],
                        'district_id' => $district->id,
                        'villages' => json_encode($entry['villages'] ?? []),
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }
                
                foreach (array_chunk($insertData, 500) as $chunk) {
                    VillageWard::insertOrIgnore($chunk);
                }
            }
        }

        // Add fallback data for any district that was missed
        $allDistricts = District::all();
        foreach ($allDistricts as $dist) {
            if (!in_array($dist->id, $seededDistrictIds)) {
                $fallbackData = [
                    [
                        'area_type' => 'Urban',
                        'local_body' => $dist->name,
                        'name' => 'Ward 1',
                        'type' => 'ward',
                        'district_id' => $dist->id,
                        'villages' => json_encode([]),
                        'created_at' => now(),
                        'updated_at' => now()
                    ],
                    [
                        'area_type' => 'Urban',
                        'local_body' => $dist->name,
                        'name' => 'Ward 2',
                        'type' => 'ward',
                        'district_id' => $dist->id,
                        'villages' => json_encode([]),
                        'created_at' => now(),
                        'updated_at' => now()
                    ],
                    [
                        'area_type' => 'Rural',
                        'local_body' => $dist->name . ' G.P.',
                        'name' => 'Ward 1 (Demo)',
                        'type' => 'ward',
                        'district_id' => $dist->id,
                        'villages' => json_encode(['Test Village 1', 'Test Village 2']),
                        'created_at' => now(),
                        'updated_at' => now()
                    ]
                ];
                VillageWard::insertOrIgnore($fallbackData);
            }
        }
    }
}
