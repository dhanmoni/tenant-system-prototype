<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (Schema::hasTable('tenancy_applications')) {
            Schema::table('tenancy_applications', function (Blueprint $table) {
                if (!Schema::hasColumn('tenancy_applications', 'forward_remarks')) {
                    $table->text('forward_remarks')->nullable();
                }
                if (!Schema::hasColumn('tenancy_applications', 'approval_message')) {
                    $table->text('approval_message')->nullable();
                }
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('tenancy_applications')) {
            Schema::table('tenancy_applications', function (Blueprint $table) {
                if (Schema::hasColumn('tenancy_applications', 'forward_remarks')) {
                    $table->dropColumn('forward_remarks');
                }
                if (Schema::hasColumn('tenancy_applications', 'approval_message')) {
                    $table->dropColumn('approval_message');
                }
            });
        }
    }
};
