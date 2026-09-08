<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Form I-B's two sentences, as made.
 *
 * The blanks themselves were already stored as separate columns; what was missing was the sentence
 * they compose into, and any record that the applicant made the undertaking at all. Rule 5(4) puts
 * the valuer's fee on "the aggrieved party, who has filed the application", so the undertaking is
 * the basis for charging them - it needs to be reconstructible, not implied by the form's layout.
 *
 * As with the verification on Forms II to VI, filing_attestations holds the authoritative record
 * and these columns are the working copy, so printing a filing needs no join.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('rent_authority_form_ib_applications')) {
            return;
        }

        Schema::table('rent_authority_form_ib_applications', function (Blueprint $table) {
            $table->text('application_statement')->nullable();
            $table->text('undertaking_statement')->nullable();
            $table->date('applied_on')->nullable();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('rent_authority_form_ib_applications')) {
            return;
        }

        Schema::table('rent_authority_form_ib_applications', function (Blueprint $table) {
            $table->dropColumn(['application_statement', 'undertaking_statement', 'applied_on']);
        });
    }
};
