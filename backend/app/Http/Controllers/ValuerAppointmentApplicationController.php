<?php

namespace App\Http\Controllers;

use App\Models\ValuerAppointmentApplication;
use App\Http\Resources\ApplicationResource;
use App\Constants\ApplicationTypes;
use App\Constants\Declarations;
use App\Constants\Roles;
use App\Constants\Status;
use Carbon\Carbon;
use App\Support\DocumentStore;
use Illuminate\Http\Request;
use App\Services\AttestationRecorder;
use App\Support\ValuerApplication;
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
            'applicant_relation_type' => [
                'required',
                'string',
                'in:' . implode(',', ValuerApplication::RELATIONS),
            ],
            'applicant_relation_target_name' => ['required', 'string', 'max:255'],
            'applicant_resident_place' => ['required', 'string', 'max:255'],

            'applicant_landlord_or_tenant' => [
                'required',
                'string',
                'in:' . implode(',', ValuerApplication::CAPACITIES),
            ],
            'premises_situated_address' => ['required', 'string'],
            'district' => ['required', 'string', 'max:255'],

            'signed_by' => ['required', 'string', 'in:landlord,tenant'],
            'signature_name' => ['required', 'string', 'max:255'],
            'signature_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $signaturePath = null;
        if ($request->hasFile('signature_image')) {
            $signaturePath = DocumentStore::store($request->file('signature_image'), 'tenancy/signatures/valuer-appointment');
        }

        [$tenancy, $uinError] = \App\Models\TenancyApplication::resolveForServiceForm($data['tenancy_uin'], $user);
        if ($uinError) {
            return response()->json([
                'message' => $uinError,
                'errors' => ['tenancy_uin' => [$uinError]],
            ], 422);
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
            // The two sentences as made, composed from the Gazette templates. Never off the wire.
            'application_statement' => ValuerApplication::compose($data),
            'undertaking_statement' => Declarations::textFor(Declarations::FORM_IB_UNDERTAKING),
            'applied_on' => Carbon::now()->toDateString(),
            'signed_by' => $data['signed_by'] ?? null,
            'signature_name' => $data['signature_name'],
            'signature_image_path' => $signaturePath,
            'status' => Status::SUBMITTED,
            'assigned_to_role' => Roles::RA_ASSISTANT,
        ]);

        // Form I-B carries no numbered paragraphs and no VERIFICATION clause, but both of its
        // sentences are things the applicant asserts, so both are recorded. The undertaking is what
        // rule 5(4) charges the valuer's fee against.
        app(AttestationRecorder::class)->record(
            $request,
            ApplicationTypes::VALUER_APPOINTMENT,
            $application->id,
            Declarations::FORM_IB_APPLICATION,
            ValuerApplication::blanks($data)
        );

        app(AttestationRecorder::class)->record(
            $request,
            ApplicationTypes::VALUER_APPOINTMENT,
            $application->id,
            Declarations::FORM_IB_UNDERTAKING
        );

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

        if ($application->user_id != $user->id) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return response()->json([
            'application' => new ApplicationResource($application),
        ]);
    }
}


