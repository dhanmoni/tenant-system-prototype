<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $serviceTables = [
            'rent_authority_form_i_applications',
            'rent_authority_form_ia_applications',
            'rent_authority_form_ib_applications',
            'rent_court_form_4_applications',
            'rent_court_form_5_applications',
            'rent_authority_form_6_applications',
            'rent_court_form_7_applications',
            'rent_tribunal_form_8_applications',
        ];

        foreach ($serviceTables as $table) {
            Schema::table($table, function (Blueprint $tableBlueprint) {
                $tableBlueprint->index('user_id');
            });
        }

        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('landlord_user_id');
            $table->index('tenant_user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('application_tables', function (Blueprint $table) {
            //
        });
    }
}
