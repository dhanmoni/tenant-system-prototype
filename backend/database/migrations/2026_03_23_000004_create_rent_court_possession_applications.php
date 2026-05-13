<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rent_court_possession_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Form-II: Application before rent court for recovery of possession
            $table->string('before_rent_court', 255); // court name / bench, as applicable

            $table->string('applicant_name');
            $table->text('applicant_residential_address');

            $table->string('tenant_unique_identification_number');
            $table->string('tenant_name')->nullable();

            // Core contents (reduced to manageable fields for prototype)
            $table->text('jurisdiction_statement')->nullable();
            $table->text('facts_of_case')->nullable();
            $table->text('grounds_for_relief')->nullable();
            $table->text('matters_not_previously_filed')->nullable();
            $table->text('relief_sought')->nullable();
            $table->text('interim_order_sought')->nullable();
            $table->text('enclosures_list')->nullable();

            // Verification / signature
            $table->string('signature_name');
            $table->string('signature_image_path')->nullable();

            $table->string('status')->default('SUBMITTED');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rent_court_possession_applications');
    }
};

