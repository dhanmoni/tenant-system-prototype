<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasColumn('tenancy_applications', 'application_type')) {
            Schema::table('tenancy_applications', function (Blueprint $table) {
                $table
                    ->string('application_type', 64)
                    ->default('Tenancy Certificate')
                    ->after('user_id');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('tenancy_applications', 'application_type')) {
            Schema::table('tenancy_applications', function (Blueprint $table) {
                $table->dropColumn('application_type');
            });
        }
    }
};
