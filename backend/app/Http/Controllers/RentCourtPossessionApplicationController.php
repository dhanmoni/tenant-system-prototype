<?php

namespace App\Http\Controllers;

use App\Models\RentCourtPossessionApplication;
use App\Http\Resources\ApplicationResource;
use App\Constants\Roles;
use App\Constants\Status;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RentCourtPossessionApplicationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'user') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'before_rent_court' => ['required', 'string', 'max:255'],

            'applicant_name' => ['required', 'string', 'max:255'],
            'applicant_residential_address' => ['required', 'string'],

            'tenancy_uin' => ['required', 'string', 'max:64'],
            'tenant_name' => ['nullable', 'string', 'max:255'],

            'jurisdiction_statement' => ['nullable', 'string'],
            'facts_of_case' => ['nullable', 'string'],
            'grounds_for_relief' => ['nullable', 'string'],
            'matters_not_previously_filed' => ['nullable', 'string'],
            'relief_sought' => ['nullable', 'string'],
            'interim_order_sought' => ['nullable', 'string'],
            'enclosures_list' => ['nullable', 'string'],

            'signature_name' => ['required', 'string', 'max:255'],
            'signature_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $signaturePath = null;
        if ($request->hasFile('signature_image')) {
            $signaturePath = $request->file('signature_image')->store('tenancy/signatures/rent-court-possession', 'public');
        }

        $tenancy = \App\Models\TenancyApplication::where('uid', $data['tenancy_uin'])->first();
        if (!$tenancy) {
            return response()->json(['message' => 'Invalid Tenancy UID'], 422);
        }

        $application = RentCourtPossessionApplication::create([
            'application_no' => RentCourtPossessionApplication::generateApplicationNo($tenancy->district_id),
            'user_id' => $user->id,
            'district_id' => $tenancy->district_id,
            'before_rent_court' => $data['before_rent_court'],
            'applicant_name' => $data['applicant_name'],
            'applicant_residential_address' => $data['applicant_residential_address'],
            'tenancy_uin' => $data['tenancy_uin'],
            'tenant_name' => $data['tenant_name'] ?? null,
            'jurisdiction_statement' => $data['jurisdiction_statement'] ?? null,
            'facts_of_case' => $data['facts_of_case'] ?? null,
            'grounds_for_relief' => $data['grounds_for_relief'] ?? null,
            'matters_not_previously_filed' => $data['matters_not_previously_filed'] ?? null,
            'relief_sought' => $data['relief_sought'] ?? null,
            'interim_order_sought' => $data['interim_order_sought'] ?? null,
            'enclosures_list' => $data['enclosures_list'] ?? null,
            'signature_name' => $data['signature_name'],
            'signature_image_path' => $signaturePath,
            'status' => Status::SUBMITTED,
            'assigned_to_role' => Roles::RC_ASSISTANT,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Form II submitted successfully.',
            'application' => $application,
            'submitted_at' => Carbon::now()->toDateTimeString(),
        ], 201);
    }

    public function show(Request $request, RentCourtPossessionApplication $application)
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


