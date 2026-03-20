<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            StateSeeder::class,
            DistrictSeeder::class,
            VillageWardSeeder::class,
            OfficeSeeder::class,
            DesignationSeeder::class,
            UserSeeder::class,
            TenancyApplicationSeeder::class,
        ]);
    }
}
