<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $tables = [
        'rent_authority_form_i_applications',
        'rent_authority_form_ia_applications',
        'rent_authority_form_ib_applications',
        'rent_court_form_4_applications',
        'rent_court_form_5_applications',
        'rent_authority_form_6_applications',
        'rent_court_form_7_applications',
        'rent_tribunal_form_8_applications',
    ];

    public function up()
    {
        foreach ($this->tables as $tableName) {
            if (Schema::hasTable($tableName) && !Schema::hasColumn($tableName, 'forward_remarks')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->text('forward_remarks')->nullable();
                });
            }
        }
    }

    public function down()
    {
        foreach ($this->tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'forward_remarks')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropColumn('forward_remarks');
                });
            }
        }
    }
};
