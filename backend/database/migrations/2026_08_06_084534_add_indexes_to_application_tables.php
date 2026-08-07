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
        'tenancy_applications',
    ];

    public function up()
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->index('status');
                $table->index('created_at');
                // district_id might have a foreign key constraint, but explicit indexing guarantees it's indexed
                $table->index('district_id');
            });
        }
    }

    public function down()
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->dropIndex([$tableName . '_status_index']);
                $table->dropIndex([$tableName . '_created_at_index']);
                $table->dropIndex([$tableName . '_district_id_index']);
            });
        }
    }
};
