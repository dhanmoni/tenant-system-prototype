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
            RentRevisionApplicationSeeder::class,
            OtherChargesRevisionApplicationSeeder::class,
            ValuerAppointmentApplicationSeeder::class,
            RentCourtPossessionApplicationSeeder::class,
            RentCourtFilingApplicationSeeder::class,
            RentAuthorityFilingApplicationSeeder::class,
            RentCourtAppealApplicationSeeder::class,
            RentTribunalAppealApplicationSeeder::class,
            DemoTestDataSeeder::class,
        ]);
    }
}
