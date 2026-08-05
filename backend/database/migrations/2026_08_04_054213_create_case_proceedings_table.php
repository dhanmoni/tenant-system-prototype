<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('case_proceedings', function (Blueprint $table) {
            $table->id();
            
            // Polymorphic relation to handle different application types
            $table->string('application_type');
            $table->unsignedBigInteger('application_id');
            
            $table->string('notice_type'); // e.g., 'appearance', 'applicant_absent', etc.
            
            $table->date('hearing_date')->nullable();
            $table->time('hearing_time')->nullable();
            
            $table->string('venue')->nullable();
            
            $table->text('remarks')->nullable(); // Additional details for adjournment, etc.
            
            $table->foreignId('sent_by_user_id')->constrained('users');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index for faster lookups
            $table->index(['application_type', 'application_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('case_proceedings');
    }
};
