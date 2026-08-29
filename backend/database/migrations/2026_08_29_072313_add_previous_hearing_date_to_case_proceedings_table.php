<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPreviousHearingDateToCaseProceedingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('case_proceedings', function (Blueprint $table) {
            $table->date('previous_hearing_date')->nullable()->after('venue');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('case_proceedings', function (Blueprint $table) {
            $table->dropColumn('previous_hearing_date');
        });
    }
}
