<?php

namespace App\Http\Controllers;

use App\Models\RentTribunalAppealApplication;
use App\Http\Resources\ApplicationResource;
use App\Constants\Roles;
use App\Constants\Status;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RentTribunalAppealApplicationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'user') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            // Header
            'rent_tribunal_at' => ['required', 'string', 'max:255'],
            'tenancy_uin' => ['required', 'string', 'max:64'],

            // Appellant
            'appellant_name' => ['required', 'string', 'max:255'],
            'appellant_residential_address' => ['required', 'string'],

            // Respondent
            'respondent_name' => ['required', 'string', 'max:255'],
            'respondent_residential_address' => ['required', 'string'],

            // Details
            'order_particulars_against_which_appeal_made' => ['nullable', 'string'],
            'jurisdiction_of_rent_tribunal' => ['nullable', 'string'],
            'limitation' => ['nullable', 'string'],
            'memorandum_of_appeal' => ['nullable', 'string'],
            'matters_not_previously_filed_or_pending' => ['nullable', 'string'],

            // Reliefs + enclosures
            'relief_sought' => ['nullable', 'string'],
            'interim_order_sought' => ['nullable', 'string'],
            'list_of_enclosures' => ['nullable', 'string'],

            // Verification
            'signature_name' => ['required', 'string', 'max:255'],
            'signature_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $signaturePath = null;
        if ($request->hasFile('signature_image')) {
            $signaturePath = $request->file('signature_image')
                ->store('tenancy/signatures/rent-tribunal-appeal', 'public');
        }

        $tenancy = \App\Models\TenancyApplication::where('uid', $data['tenancy_uin'])->first();
        if (!$tenancy) {
            return response()->json(['message' => 'Invalid Tenancy UID'], 422);
        }

        $application = RentTribunalAppealApplication::create([
            'application_no' => RentTribunalAppealApplication::generateApplicationNo($tenancy->district_id),
            'user_id' => $user->id,
            'district_id' => $tenancy->district_id,
            'rent_tribunal_at' => $data['rent_tribunal_at'],
            'tenancy_uin' => $data['tenancy_uin'],
            'appellant_name' => $data['appellant_name'],
            'appellant_residential_address' => $data['appellant_residential_address'],
            'respondent_name' => $data['respondent_name'],
            'respondent_residential_address' => $data['respondent_residential_address'],
            'order_particulars_against_which_appeal_made' => $data['order_particulars_against_which_appeal_made'] ?? null,
            'jurisdiction_of_rent_tribunal' => $data['jurisdiction_of_rent_tribunal'] ?? null,
            'limitation' => $data['limitation'] ?? null,
            'memorandum_of_appeal' => $data['memorandum_of_appeal'] ?? null,
            'matters_not_previously_filed_or_pending' => $data['matters_not_previously_filed_or_pending'] ?? null,
            'relief_sought' => $data['relief_sought'] ?? null,
            'interim_order_sought' => $data['interim_order_sought'] ?? null,
            'list_of_enclosures' => $data['list_of_enclosures'] ?? null,
            'signature_name' => $data['signature_name'],
            'signature_image_path' => $signaturePath,
            'status' => Status::SUBMITTED,
            'assigned_to_role' => Roles::RT_ASSISTANT,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Form VI submitted successfully.',
            'application' => $application,
            'submitted_at' => Carbon::now()->toDateTimeString(),
        ], 201);
    }

    public function show(Request $request, RentTribunalAppealApplication $application)
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


