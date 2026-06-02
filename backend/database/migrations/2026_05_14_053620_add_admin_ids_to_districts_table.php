<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('districts', function (Blueprint $table) {
            $table->foreignId('rent_tribunal_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('district_admin_id')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('districts', function (Blueprint $table) {
            $table->dropForeign(['rent_tribunal_id']);
            $table->dropForeign(['district_admin_id']);
            $table->dropColumn(['rent_tribunal_id', 'district_admin_id']);
        });
    }
};
