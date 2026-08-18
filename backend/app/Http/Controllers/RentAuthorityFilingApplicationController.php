<?php

namespace App\Http\Controllers;

use App\Models\RentAuthorityFilingApplication;
use App\Http\Resources\ApplicationResource;
use App\Constants\Roles;
use App\Constants\Status;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RentAuthorityFilingApplicationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'user') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            // Header
            'tenancy_uin' => ['required', 'string', 'max:64'],

            // A. Applicant
            'applicant_name' => ['required', 'string', 'max:255'],
            'applicant_residential_address' => ['required', 'string'],

            // B. Opposite party
            'opposite_party_name' => ['required', 'string', 'max:255'],
            'opposite_party_residential_address' => ['required', 'string'],

            // Details
            'particulars_of_violation' => ['nullable', 'string'],
            'jurisdiction_of_rent_authority' => ['nullable', 'string'],
            'facts_of_case' => ['nullable', 'string'],
            'grounds_for_relief' => ['nullable', 'string'],
            'matters_not_previously_filed_or_pending' => ['nullable', 'string'],
            'relief_sought' => ['nullable', 'string'],
            'interim_order_sought' => ['nullable', 'string'],
            'list_of_enclosures' => ['nullable', 'string'],

            // Verification / signature
            'signature_name' => ['required', 'string', 'max:255'],
            'signature_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $signaturePath = null;
        if ($request->hasFile('signature_image')) {
            $signaturePath = $request->file('signature_image')
                ->store('tenancy/signatures/rent-authority-filing', 'public');
        }

        [$tenancy, $uinError] = \App\Models\TenancyApplication::resolveForServiceForm($data['tenancy_uin']);
        if ($uinError) {
            return response()->json(['message' => $uinError], 422);
        }

        $application = RentAuthorityFilingApplication::create([
            'application_no' => RentAuthorityFilingApplication::generateApplicationNo($tenancy->district_id),
            'user_id' => $user->id,
            'district_id' => $tenancy->district_id,
            'tenancy_uin' => $data['tenancy_uin'],
            'applicant_name' => $data['applicant_name'],
            'applicant_residential_address' => $data['applicant_residential_address'],
            'opposite_party_name' => $data['opposite_party_name'],
            'opposite_party_residential_address' => $data['opposite_party_residential_address'],
            'particulars_of_violation' => $data['particulars_of_violation'] ?? null,
            'jurisdiction_of_rent_authority' => $data['jurisdiction_of_rent_authority'] ?? null,
            'facts_of_case' => $data['facts_of_case'] ?? null,
            'grounds_for_relief' => $data['grounds_for_relief'] ?? null,
            'matters_not_previously_filed_or_pending' => $data['matters_not_previously_filed_or_pending'] ?? null,
            'relief_sought' => $data['relief_sought'] ?? null,
            'interim_order_sought' => $data['interim_order_sought'] ?? null,
            'list_of_enclosures' => $data['list_of_enclosures'] ?? null,
            'signature_name' => $data['signature_name'],
            'signature_image_path' => $signaturePath,
            'status' => Status::SUBMITTED,
            'assigned_to_role' => Roles::RA_ASSISTANT,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Form IV submitted successfully.',
            'application' => $application,
            'submitted_at' => Carbon::now()->toDateTimeString(),
        ], 201);
    }

    public function show(Request $request, RentAuthorityFilingApplication $application)
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


