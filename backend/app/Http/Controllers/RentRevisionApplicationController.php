<?php

namespace App\Http\Controllers;

use App\Models\RentRevisionApplication;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RentRevisionApplicationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'user') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'rent_authority_uid' => ['required', 'string', 'max:64'],
            'tenancy_agreement_document_no' => ['nullable', 'string', 'max:255'],

            'landlord_name' => ['required', 'string', 'max:255'],
            'landlord_address' => ['required', 'string'],
            'tenant_name' => ['required', 'string', 'max:255'],
            'tenant_address' => ['required', 'string'],

            'manager_name' => ['nullable', 'string', 'max:255'],
            'manager_address' => ['nullable', 'string'],

            'rented_premises_description' => ['required', 'string'],

            'present_monthly_rent' => ['required', 'numeric', 'min:0'],
            'proposed_monthly_rent' => ['required', 'numeric', 'min:0'],
            'reason_for_rent_revision' => ['required', 'string'],

            'signed_by' => ['nullable', 'string', 'in:landlord,tenant,Landlord,Tenant,LANDLORD,TENANT'],
            'signature_name' => ['required', 'string', 'max:255'],
            'signature_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ], [
            'signature_image.image' => 'Signature must be an image file.',
        ]);

        $signaturePath = null;
        if ($request->hasFile('signature_image')) {
            $signaturePath = $request->file('signature_image')->store('tenancy/signatures/rent-revision', 'public');
        }

        $application = RentRevisionApplication::create([
            'application_no' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'rent_authority_uid' => $data['rent_authority_uid'],
            'tenancy_agreement_document_no' => $data['tenancy_agreement_document_no'] ?? null,
            'landlord_name' => $data['landlord_name'],
            'landlord_address' => $data['landlord_address'],
            'tenant_name' => $data['tenant_name'],
            'tenant_address' => $data['tenant_address'],
            'manager_name' => $data['manager_name'] ?? null,
            'manager_address' => $data['manager_address'] ?? null,
            'rented_premises_description' => $data['rented_premises_description'],
            'present_monthly_rent' => $data['present_monthly_rent'],
            'proposed_monthly_rent' => $data['proposed_monthly_rent'],
            'reason_for_rent_revision' => $data['reason_for_rent_revision'],
            'signed_by' => $data['signed_by'] ?? null,
            'signature_name' => $data['signature_name'],
            'signature_image_path' => $signaturePath,
            'status' => 'SUBMITTED',
        ]);

        return response()->json([
            'message' => 'Form-I (Rent revision/fixation) submitted successfully.',
            'application' => $application,
            'submitted_at' => Carbon::now()->toDateTimeString(),
        ], 201);
    }

    public function show(Request $request, RentRevisionApplication $application)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'user') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($application->user_id !== $user->id) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return response()->json([
            'application' => $application,
        ]);
    }
}


