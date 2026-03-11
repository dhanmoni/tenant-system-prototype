<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRolesAndDistricts extends Migration
{
    public function up()
    {
        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->foreignId('assistant_director_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('district_head_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('system_admin')->after('email');
            $table->foreignId('district_id')->nullable()->after('role')->constrained('districts')->nullOnDelete();
            $table->foreignId('reports_to_user_id')->nullable()->after('district_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['reports_to_user_id']);
            $table->dropForeign(['district_id']);
            $table->dropColumn(['role', 'district_id', 'reports_to_user_id']);
        });

        Schema::dropIfExists('districts');
    }
}
