<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MakePartyDetailsNullableInTenancyApplications extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->text('landlord_address')->nullable()->change();
            $table->string('landlord_email')->nullable()->change();
            $table->string('landlord_pan')->nullable()->change();
            $table->text('tenant_address')->nullable()->change();
            $table->string('tenant_email')->nullable()->change();
            $table->string('tenant_pan')->nullable()->change();
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
            $table->text('landlord_address')->nullable(false)->change();
            $table->string('landlord_email')->nullable(false)->change();
            $table->string('landlord_pan')->nullable(false)->change();
            $table->text('tenant_address')->nullable(false)->change();
            $table->string('tenant_email')->nullable(false)->change();
            $table->string('tenant_pan')->nullable(false)->change();
        });
    }
}
