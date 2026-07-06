<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ValuerAppointmentApplication;
use App\Models\User;
use App\Constants\Status;
use App\Constants\Roles;
use Illuminate\Support\Str;

$citizen = User::where('role', 'user')->first();
$ra = User::where('role', Roles::RENT_AUTHORITY)->first();

if (!$citizen || !$ra) {
    echo "Citizen or Rent Authority not found in DB.\n";
    exit;
}

$app = ValuerAppointmentApplication::create([
    'application_no' => 'VA-' . date('Y') . '-' . mt_rand(1000, 9999),
    'user_id' => $citizen->id,
    'tenancy_uin' => 'UIN-TEST-001',
    'applicant_name' => 'Demo Citizen',
    'applicant_relation_type' => 'son_of',
    'applicant_relation_target_name' => 'John Doe',
    'applicant_resident_place' => 'Demo Place',
    'applicant_landlord_or_tenant' => 'landlord',
    'premises_situated_address' => 'Demo Address',
    'district' => 'Demo District',
    'signed_by' => 'Demo Citizen',
    'signature_name' => 'Demo Citizen Signature',
    'status' => Status::IN_REVIEW,
    'district_id' => $ra->district_id,
    'assigned_to_role' => Roles::RENT_AUTHORITY,
]);

echo "Created Demo Valuer Application: " . $app->application_no . "\n";
