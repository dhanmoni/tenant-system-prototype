<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sworn declarations made on a service form.
 *
 * Several paragraphs of Forms II to VI are not questions: the parenthetical text under the label is
 * itself the answer, and the filer is asserting it. Paragraph 2, "Jurisdiction of the Rent
 * Court / Rent Authority / Rent Tribunal", is the clearest case.
 *
 * A bare boolean is not enough to hold such a declaration. Under section 36(2) of the Act,
 * proceedings before the Rent Court and Rent Tribunal are deemed judicial proceedings within the
 * meaning of sections 193 and 228, and for the purpose of section 196, of the Indian Penal Code, so
 * what a filer actually asserted has to remain reconstructible years later, even if the wording of
 * the declaration is amended in the meantime.
 *
 * Every row therefore carries a verbatim snapshot of the text as it was displayed and accepted,
 * alongside who accepted it, when, and from where.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('filing_attestations', function (Blueprint $table) {
            $table->id();

            // Slug from App\Constants\ApplicationTypes plus the row id, matching the convention
            // already used by case_proceedings.
            $table->string('application_type');
            $table->unsignedBigInteger('application_id');

            // Which declaration this is, e.g. "form_ii.para_2_jurisdiction".
            $table->string('field_id');

            // The paragraph as printed in the Schedule to the Rules, and the provisions the
            // declaration rests on, so an old filing can be rendered exactly as it was accepted.
            $table->text('text_snapshot');
            $table->json('provision_refs')->nullable();

            $table->boolean('accepted')->default(true);
            $table->timestamp('accepted_at');
            $table->unsignedBigInteger('accepted_by_user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();

            $table->timestamps();

            $table->index(['application_type', 'application_id']);
            $table->index('field_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('filing_attestations');
    }
};
