<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->text('cancellation_reason')->nullable()->after('approval_message');
            $table->timestamp('cancelled_at')->nullable()->after('cancellation_reason');
            $table->unsignedBigInteger('cancelled_by_user_id')->nullable()->after('cancelled_at');
        });
    }

    public function down(): void
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->dropColumn(['cancellation_reason', 'cancelled_at', 'cancelled_by_user_id']);
        });
    }
};
