<?php

namespace App\Http\Controllers;

use App\Models\ValuerAppointmentApplication;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ValuerAppointmentApplicationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'tenant owner') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'rent_authority_uid' => ['required', 'string', 'max:64'],

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

        $application = ValuerAppointmentApplication::create([
            'application_no' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'rent_authority_uid' => $data['rent_authority_uid'],

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
            'status' => 'SUBMITTED',
        ]);

        return response()->json([
            'message' => 'Form-I-B (Valuer appointment) submitted successfully.',
            'application' => $application,
            'submitted_at' => Carbon::now()->toDateTimeString(),
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'tenant owner') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $application = ValuerAppointmentApplication::where('user_id', $user->id)->findOrFail($id);

        return response()->json([
            'application' => $application,
        ]);
    }
}

