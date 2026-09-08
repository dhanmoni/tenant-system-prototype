<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The documents filed with a service form.
 *
 * Until now "List of enclosures" was a prose textarea and the only file any of the eight forms
 * would accept was a signature image. A filing could therefore say "1. Certified copy of the order
 * of the Rent Court" and be accepted with nothing attached at all - the form asserting a document
 * that does not exist.
 *
 * That is not merely untidy. Rule 13(3) of the Assam Tenancy Rules, 2025 requires each Memorandum
 * of appeal to the Rent Tribunal to be "accompanied by the certified copy of the order of the Rent
 * Court appealed against", and section 37(1) of the Act says the appeal is preferred "along with a
 * certified copy of such order" - so on Form VI the document is a condition of the appeal, not a
 * courtesy. Paragraph 5 of Forms II to VI likewise requires, where a prior proceeding has been
 * disposed of, "the decisions of such cases to be enclosed". Elsewhere section 35(1)(a) and rule
 * 11(1) say "documents, if any", and those stay optional.
 *
 * Rows are polymorphic on application_type + application_id, the convention already used by
 * case_proceedings and filing_attestations.
 *
 * The file itself is never in this table. `file_path` addresses the private documents disk through
 * App\Support\DocumentStore, so an enclosure is served the same way as every other uploaded file:
 * a signed, expiring URL, never a public address.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('filing_enclosures', function (Blueprint $table) {
            $table->id();

            $table->string('application_type');
            $table->unsignedBigInteger('application_id');

            // What the document is. A slug from App\Constants\Enclosures where the Rules name the
            // document ("form_vi.certified_order"), or "other" for anything the filer adds.
            $table->string('kind')->default('other');

            // What it is called on this filing. For a prescribed enclosure this is a snapshot of
            // the label as it was shown, for the same reason filing_attestations snapshots the
            // declaration text: what the filer was told they were attaching must stay
            // reconstructible if the wording is later amended.
            $table->string('label');

            // Which provision calls for it, e.g. ["rules.13(3)", "act.37(1)"]. Null for "other".
            $table->json('provision_refs')->nullable();

            // Where paragraph 5 requires the decision in a disposed case, this points at the entry
            // in prior_proceedings that the document answers, so the two cannot drift apart.
            $table->unsignedInteger('prior_proceeding_index')->nullable();

            // Relative path on the documents disk. Not a URL, and not addressable on its own.
            // Named for the *_path convention every other file column in this schema follows.
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type', 128)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();

            $table->unsignedBigInteger('uploaded_by_user_id')->nullable();
            $table->timestamp('uploaded_at');

            $table->timestamps();

            $table->index(['application_type', 'application_id']);
            $table->index('kind');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('filing_enclosures');
    }
};
