<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('tenancy_applications', 'property_tenancy_end_date')) {
                $table->date('property_tenancy_end_date')->nullable()->after('property_possession_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            if (Schema::hasColumn('tenancy_applications', 'property_tenancy_end_date')) {
                $table->dropColumn('property_tenancy_end_date');
            }
        });
    }
};
