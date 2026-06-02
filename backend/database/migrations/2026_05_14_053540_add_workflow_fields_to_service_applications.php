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
                if (!Schema::hasColumn($table->getTable(), 'district_id')) {
                    $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
                }
                $table->timestamp('forwarded_at')->nullable();
                $table->foreignId('forwarded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('rejected_at')->nullable();
                $table->foreignId('rejected_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->text('rejection_message')->nullable();
                $table->string('assigned_to_role')->nullable();
            });
        }
    }

    public function down()
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign([$tableName . '_district_id_foreign']);
                $table->dropForeign([$tableName . '_forwarded_by_user_id_foreign']);
                $table->dropForeign([$tableName . '_rejected_by_user_id_foreign']);
                $table->dropColumn([
                    'district_id',
                    'forwarded_at',
                    'forwarded_by_user_id',
                    'rejected_at',
                    'rejected_by_user_id',
                    'rejection_message',
                    'assigned_to_role'
                ]);
            });
        }
    }
};
