<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rent_tribunal_appeal_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Form-VI: Appeal to be filed before the Rent Tribunal
            $table->string('rent_tribunal_at', 255);
            $table->string('tenancy_unique_identification_number', 64);

            // Appellant (A)
            $table->string('appellant_name', 255);
            $table->text('appellant_residential_address');

            // Respondent (B)
            $table->string('respondent_name', 255);
            $table->text('respondent_residential_address');

            // Details of appeal (1-5)
            $table->text('order_particulars_against_which_appeal_made')->nullable(); // para 1
            $table->text('jurisdiction_of_rent_tribunal')->nullable(); // para 2
            $table->text('limitation')->nullable(); // para 3
            $table->text('memorandum_of_appeal')->nullable(); // para 4
            $table->text('matters_not_previously_filed_or_pending')->nullable(); // para 5

            // Reliefs (6-7) + enclosures (8)
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
        Schema::dropIfExists('rent_tribunal_appeal_applications');
    }
};

