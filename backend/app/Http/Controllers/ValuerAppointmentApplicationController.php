<?php

namespace App\Http\Controllers;

use App\Models\ValuerAppointmentApplication;
use App\Http\Resources\ApplicationResource;
use App\Constants\Roles;
use App\Constants\Status;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ValuerAppointmentApplicationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'user') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'tenancy_uin' => ['required', 'string', 'max:64'],

            // Form-I-B body fields
            'applicant_name' => ['required', 'string', 'max:255'],
            'applicant_relation_type' => ['required', 'string', 'max:50', 'in:Son,Daughter,Wife,son,daughter,wife'],
            'applicant_relation_target_name' => ['required', 'string', 'max:255'],
            'applicant_resident_place' => ['required', 'string', 'max:255'],

            'applicant_landlord_or_tenant' => ['required', 'string', 'in:landlord,tenant,Landlord,Tenant'],
            'premises_situated_address' => ['required', 'string'],
            'district' => ['required', 'string', 'max:255'],

            'signed_by' => ['nullable', 'string', 'in:landlord,tenant,Landlord,Tenant,LANDLORD,TENANT'],
            'signature_name' => ['required', 'string', 'max:255'],
            'signature_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $signaturePath = null;
        if ($request->hasFile('signature_image')) {
            $signaturePath = $request->file('signature_image')->store('tenancy/signatures/valuer-appointment', 'public');
        }

        $tenancy = \App\Models\TenancyApplication::where('uid', $data['tenancy_uin'])->first();
        if (!$tenancy) {
            return response()->json(['message' => 'Invalid Tenancy UID'], 422);
        }

        $application = ValuerAppointmentApplication::create([
            'application_no' => ValuerAppointmentApplication::generateApplicationNo($tenancy->district_id),
            'user_id' => $user->id,
            'district_id' => $tenancy->district_id,
            'tenancy_uin' => $data['tenancy_uin'],
            'applicant_name' => $data['applicant_name'],
            'applicant_relation_type' => $data['applicant_relation_type'],
            'applicant_relation_target_name' => $data['applicant_relation_target_name'],
            'applicant_resident_place' => $data['applicant_resident_place'],
            'applicant_landlord_or_tenant' => $data['applicant_landlord_or_tenant'],
            'premises_situated_address' => $data['premises_situated_address'],
            'district' => $data['district'],
            'signed_by' => $data['signed_by'] ?? null,
            'signature_name' => $data['signature_name'],
            'signature_image_path' => $signaturePath,
            'status' => Status::SUBMITTED,
            'assigned_to_role' => Roles::RA_ASSISTANT,
        ]);

        return response()->json([
            'message' => 'Form-I-B (Valuer appointment) submitted successfully.',
            'application' => $application,
            'submitted_at' => Carbon::now()->toDateTimeString(),
        ], 201);
    }

    public function show(Request $request, ValuerAppointmentApplication $application)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'user') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($application->user_id !== $user->id) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return response()->json([
            'application' => new ApplicationResource($application),
        ]);
    }
}


