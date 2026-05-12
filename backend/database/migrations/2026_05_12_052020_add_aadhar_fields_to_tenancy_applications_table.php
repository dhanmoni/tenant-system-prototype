<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAadharFieldsToTenancyApplicationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->string('landlord_aadhar')->nullable();
            $table->string('tenant_aadhar')->nullable();
            $table->string('manager_aadhar')->nullable();
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
            $table->dropColumn(['landlord_aadhar', 'tenant_aadhar', 'manager_aadhar']);
        });
    }
}
