<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->string('ref_code', 64)->nullable()->unique()->after('application_no');
            $table->string('initiator_role', 16)->nullable()->after('user_id');
            $table->boolean('initiator_completed')->default(false)->after('initiator_role');
            $table->boolean('second_party_completed')->default(false)->after('initiator_completed');
            $table->foreignId('landlord_user_id')->nullable()->after('second_party_completed')->constrained('users')->nullOnDelete();
            $table->foreignId('tenant_user_id')->nullable()->after('landlord_user_id')->constrained('users')->nullOnDelete();
            $table->foreignId('village_ward_id')->nullable()->after('office_id')->constrained('village_wards')->nullOnDelete();
            $table->string('uid', 64)->nullable()->unique()->after('tenant_signature_path');
        });
    }

    public function down()
    {
        Schema::table('tenancy_applications', function (Blueprint $table) {
            $table->dropForeign(['landlord_user_id']);
            $table->dropForeign(['tenant_user_id']);
            $table->dropForeign(['village_ward_id']);
            $table->dropColumn([
                'ref_code',
                'initiator_role',
                'initiator_completed',
                'second_party_completed',
                'landlord_user_id',
                'tenant_user_id',
                'village_ward_id',
                'uid',
            ]);
        });
    }
};
