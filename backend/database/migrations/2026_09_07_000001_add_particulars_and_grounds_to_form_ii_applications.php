<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Form II (rule 7) was missing two things the printed form asks for:
 *
 *  - "1. Particulars of application", the first item under DETAILS OF APPLICATION.
 *  - The grounds listed as (i), (ii), (iii) in the opening recital. These are not free text: the
 *    recital reads "In accordance with sub-section (2) of section 21 or section 22 of the Act",
 *    and section 21(2) sets out a closed list of eight clauses, (a) to (h). They are stored as a
 *    statutory basis plus clause codes so the selection stays machine-readable.
 *
 * Additive and nullable, so filings submitted before this migration remain readable.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rent_court_form_4_applications', function (Blueprint $table) {
            $table->text('particulars_of_application')->nullable()->after('tenant_name');
            $table->string('statutory_basis', 32)->nullable()->after('particulars_of_application');
            $table->json('eviction_grounds')->nullable()->after('statutory_basis');
        });
    }

    public function down(): void
    {
        Schema::table('rent_court_form_4_applications', function (Blueprint $table) {
            $table->dropColumn(['particulars_of_application', 'statutory_basis', 'eviction_grounds']);
        });
    }
};
