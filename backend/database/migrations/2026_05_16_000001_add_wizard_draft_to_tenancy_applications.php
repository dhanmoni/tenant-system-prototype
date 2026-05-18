<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->unsignedTinyInteger('wizard_step')->default(1)->after('status');
        });

        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->date('registration_date')->nullable()->change();
            $table->string('apply_type', 32)->nullable()->change();
            $table->string('landlord_name')->nullable()->change();
            $table->string('tenant_name')->nullable()->change();
            $table->string('landlord_phone')->nullable()->change();
            $table->string('tenant_phone')->nullable()->change();
            $table->date('property_possession_date')->nullable()->change();
            $table->decimal('property_rent_payable', 12, 2)->nullable()->change();
            $table->string('property_tenancy_duration')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->dropColumn('wizard_step');
        });
    }
};
