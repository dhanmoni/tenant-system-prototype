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
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('application_type', 64)->default('Application for Tenancy Certificate');
            $table->string('application_no')->unique();
            $table->string('uid')->nullable()->unique();
            $table->string('ref_code')->nullable()->unique();
            $table->date('registration_date')->nullable();
            $table->foreignId('office_id')->nullable()->constrained('offices')->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
            $table->string('apply_type', 32)->nullable();
            $table->string('status', 32)->default('Under process');
            $table->unsignedTinyInteger('wizard_step')->default(1);
            $table->string('current_with', 64)->nullable();
            
            $table->string('initiator_role', 32)->nullable();
            $table->boolean('initiator_completed')->default(false);
            $table->boolean('second_party_completed')->default(false);
            
            $table->foreignId('landlord_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('landlord_name')->nullable();
            $table->text('landlord_address')->nullable();
            $table->string('landlord_email')->nullable();
            $table->string('landlord_phone')->nullable();
            $table->string('landlord_pan')->nullable();
            $table->string('landlord_aadhar')->nullable();
            
            $table->string('manager_name')->nullable();
            $table->text('manager_address')->nullable();
            $table->string('manager_email')->nullable();
            $table->string('manager_phone')->nullable();
            $table->string('manager_pan')->nullable();
            $table->string('manager_aadhar')->nullable();
            
            $table->foreignId('tenant_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tenant_name')->nullable();
            $table->text('tenant_address')->nullable();
            $table->string('tenant_email')->nullable();
            $table->string('tenant_phone')->nullable();
            $table->string('tenant_pan')->nullable();
            $table->string('tenant_aadhar')->nullable();
            $table->text('tenant_previous_tenancy')->nullable();
            
            $table->string('area_type')->nullable();
            $table->string('local_body')->nullable();
            $table->foreignId('village_ward_id')->nullable()->constrained('village_wards')->nullOnDelete();
            $table->string('village_name')->nullable();
            
            $table->date('property_possession_date')->nullable();
            $table->decimal('property_rent_payable', 12, 2)->nullable();
            $table->text('property_premises_description')->nullable();
            $table->text('property_furniture_description')->nullable();
            $table->string('property_charge_electricity')->nullable();
            $table->string('property_charge_water')->nullable();
            $table->string('property_charge_furnishing')->nullable();
            $table->string('property_charge_other_services')->nullable();
            $table->string('property_tenancy_duration')->nullable();
            
            $table->string('agreement_pdf_path')->nullable();
            $table->string('landlord_photo_path')->nullable();
            $table->string('landlord_signature_path')->nullable();
            $table->string('tenant_photo_path')->nullable();
            $table->string('tenant_signature_path')->nullable();
            $table->string('landlord_pan_path')->nullable();
            $table->string('tenant_pan_path')->nullable();
            $table->string('manager_pan_path')->nullable();
            
            $table->json('movement_history')->nullable();
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tenancy_applications');
    }
};
