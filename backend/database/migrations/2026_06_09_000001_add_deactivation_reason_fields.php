<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('block_reason', 1000)->nullable()->after('is_blocked');
        });

        Schema::table('districts', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('code');
            $table->string('deactivation_reason', 1000)->nullable()->after('is_active');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('block_reason');
        });

        Schema::table('districts', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'deactivation_reason']);
        });
    }
};
