<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTenantProfileFields extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_type', 20)->nullable()->after('phone');
            $table->text('address')->nullable()->after('profile_type');
            $table->string('pin_code', 10)->nullable()->after('address');
            $table->string('pan_card', 20)->nullable()->after('pin_code');
            $table->string('passport_photo_path')->nullable()->after('pan_card');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = ['profile_type', 'address', 'pin_code', 'pan_card', 'passport_photo_path'];
            $existing = array_filter($columns, fn ($column) => Schema::hasColumn('users', $column));
            if ($existing) {
                $table->dropColumn($existing);
            }
        });
    }
}
