<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RenameUidColumnsToTenancyUin extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('rent_authority_form_i_applications', function (Blueprint $table) {
            $table->renameColumn('rent_authority_uid', 'tenancy_uin');
        });
        Schema::table('rent_authority_form_ia_applications', function (Blueprint $table) {
            $table->renameColumn('rent_authority_uid', 'tenancy_uin');
        });
        Schema::table('rent_authority_form_ib_applications', function (Blueprint $table) {
            $table->renameColumn('rent_authority_uid', 'tenancy_uin');
        });
        Schema::table('rent_authority_form_6_applications', function (Blueprint $table) {
            $table->renameColumn('rent_authority_uid', 'tenancy_uin');
        });
        Schema::table('rent_court_form_4_applications', function (Blueprint $table) {
            $table->renameColumn('tenant_unique_identification_number', 'tenancy_uin');
        });
        Schema::table('rent_court_form_5_applications', function (Blueprint $table) {
            $table->renameColumn('tenancy_unique_identification_number', 'tenancy_uin');
        });
        Schema::table('rent_court_form_7_applications', function (Blueprint $table) {
            $table->renameColumn('tenancy_unique_identification_number', 'tenancy_uin');
        });
        Schema::table('rent_tribunal_form_8_applications', function (Blueprint $table) {
            $table->renameColumn('tenancy_unique_identification_number', 'tenancy_uin');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('rent_authority_form_i_applications', function (Blueprint $table) {
            $table->renameColumn('tenancy_uin', 'rent_authority_uid');
        });
        Schema::table('rent_authority_form_ia_applications', function (Blueprint $table) {
            $table->renameColumn('tenancy_uin', 'rent_authority_uid');
        });
        Schema::table('rent_authority_form_ib_applications', function (Blueprint $table) {
            $table->renameColumn('tenancy_uin', 'rent_authority_uid');
        });
        Schema::table('rent_authority_form_6_applications', function (Blueprint $table) {
            $table->renameColumn('tenancy_uin', 'rent_authority_uid');
        });
        Schema::table('rent_court_form_4_applications', function (Blueprint $table) {
            $table->renameColumn('tenancy_uin', 'tenant_unique_identification_number');
        });
        Schema::table('rent_court_form_5_applications', function (Blueprint $table) {
            $table->renameColumn('tenancy_uin', 'tenancy_unique_identification_number');
        });
        Schema::table('rent_court_form_7_applications', function (Blueprint $table) {
            $table->renameColumn('tenancy_uin', 'tenancy_unique_identification_number');
        });
        Schema::table('rent_tribunal_form_8_applications', function (Blueprint $table) {
            $table->renameColumn('tenancy_uin', 'tenancy_unique_identification_number');
        });
    }
}
