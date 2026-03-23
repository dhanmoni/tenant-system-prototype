<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('other_charges_revision_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Form-I-A fields
            $table->string('rent_authority_uid');
            $table->string('tenancy_agreement_document_no')->nullable();

            $table->string('landlord_name');
            $table->text('landlord_address');
            $table->string('tenant_name');
            $table->text('tenant_address');

            $table->string('manager_name')->nullable();
            $table->text('manager_address')->nullable();

            $table->text('rented_premises_description');

            $table->text('existing_other_charges_details');
            $table->text('proposed_other_charges_details');
            $table->text('reason_for_other_charges_revision');

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
        Schema::dropIfExists('other_charges_revision_applications');
    }
};

