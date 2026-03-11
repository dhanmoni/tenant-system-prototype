<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        DB::table('tenancy_applications')
            ->where('application_type', 'Application for Tenancy Certificate')
            ->update(['application_type' => 'Tenancy Certificate']);
    }

    public function down()
    {
        DB::table('tenancy_applications')
            ->where('application_type', 'Tenancy Certificate')
            ->update(['application_type' => 'Application for Tenancy Certificate']);
    }
};
