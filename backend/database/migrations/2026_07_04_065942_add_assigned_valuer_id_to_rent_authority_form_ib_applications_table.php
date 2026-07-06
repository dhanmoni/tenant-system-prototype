<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAssignedValuerIdToRentAuthorityFormIbApplicationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('rent_authority_form_ib_applications', function (Blueprint $table) {
            $table->unsignedBigInteger('assigned_valuer_id')->nullable();
            $table->timestamp('valuer_assigned_at')->nullable();
            $table->text('valuer_report')->nullable();

            $table->foreign('assigned_valuer_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rent_authority_form_ib_applications', function (Blueprint $table) {
            $table->dropForeign(['assigned_valuer_id']);
            $table->dropColumn(['assigned_valuer_id', 'valuer_assigned_at', 'valuer_report']);
        });
    }
}
