<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Clean slate for roles table
        DB::table('roles')->truncate();
        $roles = [
            'super_admin',
            'district_admin',
            'rent_authority',
            'rent_court',
            'rent_tribunal',
            'ra_assistant',
            'rc_assistant',
            'rt_assistant',
            'user',
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insert([
                'name' => $role,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Reset all users to 'user' role except the main admin if it exists
        DB::table('users')->where('email', '!=', 'admin@nic.in')->update(['role' => 'user']);
        DB::table('users')->where('email', 'admin@nic.in')->update(['role' => 'super_admin']);

        // Update default role for users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('system_admin')->change();
        });
    }
};
