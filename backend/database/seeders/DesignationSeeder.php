<?php

namespace Database\Seeders;

use App\Models\Designation;
use Illuminate\Database\Seeder;

class DesignationSeeder extends Seeder
{
    public function run()
    {
        $designations = [
            'Director',
            'Assistant Director',
            'District Head',
            'District Assistant',
            'System Administrator',
            'Office Assistant',
        ];

        foreach ($designations as $name) {
            Designation::firstOrCreate(['name' => $name]);
        }
    }
}
