<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->string('application_type', 64)->default('Application for Tenancy Certificate')->after('user_id');
            $table->string('status', 32)->default('Under process')->after('apply_type');
            $table->string('current_with', 64)->nullable()->after('status');
            $table->json('movement_history')->nullable()->after('current_with');
        });
    }

    public function down()
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'status', 'current_with', 'movement_history']);
        });
    }
};
