<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $tables = [
        'rent_revision_applications',
        'other_charges_revision_applications',
        'valuer_appointment_applications',
        'rent_court_possession_applications',
        'rent_court_filing_applications',
        'rent_authority_filing_applications',
        'rent_court_appeal_applications',
        'rent_tribunal_appeal_applications',
        'tenancy_applications',
    ];

    public function up()
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                if (!Schema::hasColumn($table->getTable(), 'approved_at')) {
                    $table->timestamp('approved_at')->nullable();
                }
                if (!Schema::hasColumn($table->getTable(), 'approved_by_user_id')) {
                    $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                }
            });
        }
    }

    public function down()
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                if (Schema::hasColumn($table->getTable(), 'approved_by_user_id')) {
                    $table->dropForeign([$tableName . '_approved_by_user_id_foreign']);
                    $table->dropColumn('approved_by_user_id');
                }
                if (Schema::hasColumn($table->getTable(), 'approved_at')) {
                    $table->dropColumn('approved_at');
                }
            });
        }
    }
};
