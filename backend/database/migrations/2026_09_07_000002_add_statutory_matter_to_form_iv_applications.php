<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Rule 11(1) routes four different proceedings through Form IV - Act ss. 10, 14, 15 and 20 - but the
 * printed form never asks which one is invoked. The inquiry that follows differs completely between
 * them, so the section is captured as a closed choice.
 *
 * Two of the four carry a statutory list of their own:
 *  - s. 15 repairs: the Second Schedule splits liability between landlord (Part A) and tenant
 *    (Part B), so the items in dispute are stored as Schedule codes.
 *  - s. 20 essential services: the Explanation to s. 20 enumerates what counts as essential. It
 *    says "includes", so the list is illustrative and an "other" entry with free text is allowed.
 *
 * Additive and nullable: filings submitted before this migration remain readable.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rent_authority_form_6_applications', function (Blueprint $table) {
            $table->string('statutory_matter', 32)->nullable()->after('opposite_party_residential_address');
            $table->json('repair_items')->nullable()->after('statutory_matter');
            $table->json('essential_services')->nullable()->after('repair_items');
            $table->string('essential_service_other', 255)->nullable()->after('essential_services');
        });
    }

    public function down(): void
    {
        Schema::table('rent_authority_form_6_applications', function (Blueprint $table) {
            $table->dropColumn([
                'statutory_matter',
                'repair_items',
                'essential_services',
                'essential_service_other',
            ]);
        });
    }
};
