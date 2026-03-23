<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rent_court_appeal_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Form-V (Appeal before Rent Court)
            $table->string('rent_court_at', 255);
            $table->string('tenancy_unique_identification_number', 64);

            // Appellant
            $table->string('appellant_name', 255);
            $table->text('appellant_residential_address');

            // Respondent
            $table->string('respondent_name', 255);
            $table->text('respondent_residential_address');

            // Details of appeal
            $table->text('order_particulars_against_which_appeal_made')->nullable(); // para 1
            $table->text('jurisdiction_of_rent_court')->nullable(); // para 2
            $table->text('limitation')->nullable(); // para 3
            $table->text('memorandum_of_appeal')->nullable(); // para 4
            $table->text('matters_not_previously_filed_or_pending')->nullable(); // para 5
            $table->text('relief_sought')->nullable(); // para 6
            $table->text('interim_order_sought')->nullable(); // para 7
            $table->text('list_of_enclosures')->nullable(); // para 8

            // Verification / signature
            $table->string('signature_name', 255);
            $table->string('signature_image_path')->nullable();

            $table->string('status')->default('SUBMITTED');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rent_court_appeal_applications');
    }
};

