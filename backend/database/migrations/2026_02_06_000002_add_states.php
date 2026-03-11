<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStates extends Migration
{
    public function up()
    {
        Schema::create('states', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::table('districts', function (Blueprint $table) {
            $table->foreignId('state_id')->nullable()->after('name')->constrained('states')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('districts', function (Blueprint $table) {
            $table->dropForeign(['state_id']);
            $table->dropColumn('state_id');
        });

        Schema::dropIfExists('states');
    }
}
