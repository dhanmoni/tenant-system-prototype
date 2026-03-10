<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUserProfileFields extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('office_id')->nullable()->after('district_id')->constrained('offices')->nullOnDelete();
            $table->foreignId('designation_id')->nullable()->after('office_id')->constrained('designations')->nullOnDelete();
            $table->string('phone', 30)->nullable()->after('designation_id');
            $table->timestamp('approved_at')->nullable()->after('phone');
            $table->foreignId('approved_by_user_id')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['approved_by_user_id']);
            $table->dropForeign(['designation_id']);
            $table->dropForeign(['office_id']);
            $table->dropColumn(['office_id', 'designation_id', 'phone', 'approved_at', 'approved_by_user_id']);
        });
    }
}
