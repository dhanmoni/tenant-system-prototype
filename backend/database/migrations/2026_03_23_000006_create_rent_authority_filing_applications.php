<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rent_authority_filing_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Form-6 (FORM-IV): Application filled before the Rent Authority
            $table->string('rent_authority_uid', 64); // Unique Identification Number from Rent Authority

            // A. Applicant
            $table->string('applicant_name', 255);
            $table->text('applicant_residential_address');

            // B. Opposite party
            $table->string('opposite_party_name', 255);
            $table->text('opposite_party_residential_address');

            // Details of application
            $table->text('particulars_of_violation', 2000)->nullable();
            $table->text('jurisdiction_of_rent_authority', 2000)->nullable();
            $table->text('facts_of_case', 2000)->nullable();
            $table->text('grounds_for_relief', 2000)->nullable();
            $table->text('matters_not_previously_filed_or_pending', 2000)->nullable();
            $table->text('relief_sought', 2000)->nullable();
            $table->text('interim_order_sought', 2000)->nullable();
            $table->text('list_of_enclosures', 2000)->nullable();

            // Verification / signature
            $table->string('signature_name', 255);
            $table->string('signature_image_path')->nullable();

            $table->string('status')->default('SUBMITTED');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rent_authority_filing_applications');
    }
};

