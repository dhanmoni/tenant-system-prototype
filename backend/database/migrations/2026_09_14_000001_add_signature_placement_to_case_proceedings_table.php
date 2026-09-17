<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Where on the notice the digital signature goes.
 *
 * The DSC agent used to stamp one fixed rectangle from its own config - bottom right of the page -
 * wherever the notice's text happened to end. A signature belongs directly above the name of the
 * authority it issues under, and that name moves: it follows the remarks the officer typed, and on
 * a long notice it is on page two.
 *
 * Only the renderer knows where the name landed, so it measures that when the notice is generated,
 * and the result is stored here beside `document_path`. It is frozen together with the PDF for the
 * same reason the PDF is frozen: a placement recomputed later, after the application was edited,
 * would describe a different layout from the bytes being signed.
 *
 * Null for notices generated before this change; they had no space reserved above the name, and
 * the signing flow falls back to the agent's own default.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('case_proceedings', function (Blueprint $table) {
            $table->json('signature_placement')->nullable()->after('document_generated_at');
        });
    }

    public function down(): void
    {
        Schema::table('case_proceedings', function (Blueprint $table) {
            $table->dropColumn('signature_placement');
        });
    }
};
