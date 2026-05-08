<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MakePropertyPremisesDescriptionNullableInTenancyApplications extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->text('property_premises_description')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->text('property_premises_description')->nullable(false)->change();
        });
    }
}
