<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('valuer_appointment_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Form-I-B fields
            $table->string('rent_authority_uid');

            $table->string('applicant_name');
            $table->string('applicant_relation_type'); // Son | Daughter | Wife
            $table->string('applicant_relation_target_name'); // father/husband name
            $table->string('applicant_resident_place');

            $table->string('applicant_landlord_or_tenant'); // landlord | tenant
            $table->text('premises_situated_address');
            $table->string('district');

            // Signature
            $table->string('signed_by')->nullable(); // landlord | tenant
            $table->string('signature_name');
            $table->string('signature_image_path')->nullable();

            $table->string('status')->default('SUBMITTED');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('valuer_appointment_applications');
    }
};

