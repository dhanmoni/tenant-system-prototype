<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('village_wards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type', 32); // 'village' or 'ward'
            $table->foreignId('district_id')->constrained('districts')->cascadeOnDelete();
            $table->json('villages')->nullable();
            $table->string('area_type')->nullable();
            $table->string('local_body')->nullable();
            $table->timestamps();

            $table->unique(['name', 'district_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('village_wards');
    }
};
