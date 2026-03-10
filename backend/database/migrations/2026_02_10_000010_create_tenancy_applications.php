<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tenancy_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no')->unique();
            $table->date('registration_date');
            $table->foreignId('office_id')->nullable()->constrained('offices')->nullOnDelete();
            $table->string('apply_type', 32);
            $table->string('landlord_name');
            $table->text('landlord_address');
            $table->string('landlord_email');
            $table->string('landlord_phone');
            $table->string('landlord_pan');
            $table->string('manager_name')->nullable();
            $table->text('manager_address')->nullable();
            $table->string('manager_email')->nullable();
            $table->string('manager_phone')->nullable();
            $table->string('manager_pan')->nullable();
            $table->string('tenant_name');
            $table->text('tenant_address');
            $table->string('tenant_email');
            $table->string('tenant_phone');
            $table->string('tenant_pan');
            $table->text('tenant_previous_tenancy')->nullable();
            $table->date('property_possession_date');
            $table->decimal('property_rent_payable', 12, 2);
            $table->text('property_premises_description');
            $table->text('property_furniture_description')->nullable();
            $table->string('property_charge_electricity')->nullable();
            $table->string('property_charge_water')->nullable();
            $table->string('property_charge_furnishing')->nullable();
            $table->string('property_charge_other_services')->nullable();
            $table->string('property_tenancy_duration');
            $table->string('agreement_pdf_path')->nullable();
            $table->string('landlord_photo_path')->nullable();
            $table->string('landlord_signature_path')->nullable();
            $table->string('tenant_photo_path')->nullable();
            $table->string('tenant_signature_path')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tenancy_applications');
    }
};
