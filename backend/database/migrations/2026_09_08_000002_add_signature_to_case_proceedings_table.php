<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The notice document, and the digital signature applied to it.
 *
 * Until now a notice existed only as a React component rendered in the officer's browser and
 * "printed" by swapping document.body.innerHTML. Nothing was stored, so there was no artifact to
 * sign, and two officers opening the same proceeding a month apart could see different text if the
 * underlying application had been edited in between.
 *
 * `document_path` fixes that: the notice is rendered to a PDF once, when the proceeding is created,
 * and that file is what the parties are served with and what gets signed. It is frozen for the same
 * reason filing_attestations snapshots declaration text - what was issued has to stay
 * reconstructible even if the application record changes afterwards.
 *
 * On the signature columns, one distinction matters and is easy to lose. A notice is an act of the
 * forum: an order of the Rent Court is the Rent Court's whether the head or their assistant
 * prepared and issued it, which is why `signature_authority` snapshots the office rather than a
 * person. But a digital signature is cryptographic, and it belongs to whichever certificate was on
 * the token in the machine. Those are two different facts and both are recorded:
 * `signed_by_user_id` is the portal account that operated the signing, and `signature_metadata`
 * holds whatever the DSC agent reported about the certificate actually used. If a head's token was
 * used, the record shows that; if an assistant signed with their own certificate under the office's
 * authority, the record shows that too, rather than quietly presenting one as the other.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('case_proceedings', function (Blueprint $table) {
            // The generated notice, on the private documents disk. Never a public address.
            $table->string('document_path')->nullable()->after('sent_by_user_id');
            $table->timestamp('document_generated_at')->nullable()->after('document_path');

            // The same document with a DSC applied, returned by the officer's local agent.
            $table->string('signed_document_path')->nullable()->after('document_generated_at');
            $table->timestamp('signed_at')->nullable()->after('signed_document_path');

            // The account that operated the signing - head or assistant.
            $table->unsignedBigInteger('signed_by_user_id')->nullable()->after('signed_at');

            // The office in whose authority the notice issues, snapshotted as it was printed.
            $table->string('signature_authority')->nullable()->after('signed_by_user_id');

            // Everything the agent reported apart from the PDF itself: certificate subject, serial,
            // issuer, reason, agent version. Stored whole rather than picked apart, so a later
            // agent release that reports more does not need a migration to be recorded.
            $table->json('signature_metadata')->nullable()->after('signature_authority');

            $table->index('signed_at');
        });
    }

    public function down(): void
    {
        Schema::table('case_proceedings', function (Blueprint $table) {
            $table->dropIndex(['signed_at']);
            $table->dropColumn([
                'document_path',
                'document_generated_at',
                'signed_document_path',
                'signed_at',
                'signed_by_user_id',
                'signature_authority',
                'signature_metadata',
            ]);
        });
    }
};
