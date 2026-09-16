<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Form II prints no respondent block (gazette-divergences A2), but rule 7 proceedings still
 * need a service address for the tenant. Stored beside tenant_name so notices can use it.
 *
 * Additive and nullable so filings submitted before this migration remain readable.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rent_court_form_4_applications', function (Blueprint $table) {
            $table->text('tenant_residential_address')->nullable()->after('tenant_name');
        });
    }

    public function down(): void
    {
        Schema::table('rent_court_form_4_applications', function (Blueprint $table) {
            $table->dropColumn('tenant_residential_address');
        });
    }
};
