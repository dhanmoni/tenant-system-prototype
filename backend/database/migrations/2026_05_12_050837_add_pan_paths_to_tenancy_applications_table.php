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
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->string('landlord_pan_path')->nullable();
            $table->string('tenant_pan_path')->nullable();
            $table->string('manager_pan_path')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->dropColumn(['landlord_pan_path', 'tenant_pan_path', 'manager_pan_path']);
        });
    }
};
