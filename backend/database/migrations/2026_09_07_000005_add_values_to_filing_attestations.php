<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The blanks a filer filled in a sworn declaration.
 *
 * Paragraphs 2 and 5 of Forms II to VI are accepted whole: the filer adds nothing, so a text
 * snapshot alone reproduces what was sworn. The VERIFICATION clause is not like that. It is a
 * sentence with blanks - name, relation, age, residence, and which paragraphs are true of the
 * filer's own knowledge as against on legal advice - and those words are the filer's own.
 *
 * text_snapshot therefore holds the completed sentence, composed server-side by
 * App\Support\Verification. This column holds the same blanks structured, so a filing can be
 * queried and re-rendered without parsing prose back out of the sentence.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('filing_attestations', function (Blueprint $table) {
            $table->json('values')->nullable()->after('provision_refs');
        });
    }

    public function down(): void
    {
        Schema::table('filing_attestations', function (Blueprint $table) {
            $table->dropColumn('values');
        });
    }
};
