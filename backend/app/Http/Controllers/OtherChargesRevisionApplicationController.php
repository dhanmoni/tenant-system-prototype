<?php

namespace App\Http\Controllers;

use App\Models\OtherChargesRevisionApplication;
use App\Http\Resources\ApplicationResource;
use App\Constants\Roles;
use App\Constants\Status;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OtherChargesRevisionApplicationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'user') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'tenancy_uin' => ['required', 'string', 'max:64'],
            'tenancy_agreement_document_no' => ['nullable', 'string', 'max:255'],

            'landlord_name' => ['required', 'string', 'max:255'],
            'landlord_address' => ['required', 'string'],
            'tenant_name' => ['required', 'string', 'max:255'],
            'tenant_address' => ['required', 'string'],

            'manager_name' => ['nullable', 'string', 'max:255'],
            'manager_address' => ['nullable', 'string'],

            'rented_premises_description' => ['required', 'string'],

            'existing_other_charges_details' => ['required', 'string'],
            'proposed_other_charges_details' => ['required', 'string'],
            'reason_for_other_charges_revision' => ['required', 'string'],

            'signed_by' => ['nullable', 'string', 'in:landlord,tenant,Landlord,Tenant,LANDLORD,TENANT'],
            'signature_name' => ['required', 'string', 'max:255'],
            'signature_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $signaturePath = null;
        if ($request->hasFile('signature_image')) {
            $signaturePath = $request->file('signature_image')->store('tenancy/signatures/other-charges-revision', 'public');
        }

        $tenancy = \App\Models\TenancyApplication::where('uid', $data['tenancy_uin'])->first();
        if (!$tenancy) {
            return response()->json(['message' => 'Invalid Tenancy UID'], 422);
        }

        $application = OtherChargesRevisionApplication::create([
            'application_no' => OtherChargesRevisionApplication::generateApplicationNo($tenancy->district_id),
            'user_id' => $user->id,
            'district_id' => $tenancy->district_id,
            'tenancy_uin' => $data['tenancy_uin'],
            'tenancy_agreement_document_no' => $data['tenancy_agreement_document_no'] ?? null,
            'landlord_name' => $data['landlord_name'],
            'landlord_address' => $data['landlord_address'],
            'tenant_name' => $data['tenant_name'],
            'tenant_address' => $data['tenant_address'],
            'manager_name' => $data['manager_name'] ?? null,
            'manager_address' => $data['manager_address'] ?? null,
            'rented_premises_description' => $data['rented_premises_description'],
            'existing_other_charges_details' => $data['existing_other_charges_details'],
            'proposed_other_charges_details' => $data['proposed_other_charges_details'],
            'reason_for_other_charges_revision' => $data['reason_for_other_charges_revision'],
            'signed_by' => $data['signed_by'] ?? null,
            'signature_name' => $data['signature_name'],
            'signature_image_path' => $signaturePath,
            'status' => Status::SUBMITTED,
            'assigned_to_role' => Roles::RA_ASSISTANT,
        ]);

        return response()->json([
            'message' => 'Form-I-A (Other charges revision/fixation) submitted successfully.',
            'application' => $application,
            'submitted_at' => Carbon::now()->toDateTimeString(),
        ], 201);
    }

    public function show(Request $request, OtherChargesRevisionApplication $application)
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


