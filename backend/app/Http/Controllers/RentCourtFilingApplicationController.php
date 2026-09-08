<?php

namespace App\Http\Controllers;

use App\Models\RentCourtFilingApplication;
use App\Http\Resources\ApplicationResource;
use App\Constants\ApplicationTypes;
use App\Constants\Declarations;
use App\Constants\Roles;
use App\Constants\Status;
use App\Services\AttestationRecorder;
use App\Support\PriorProceedings;
use App\Support\Verification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RentCourtFilingApplicationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'user') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            // Header
            'rent_court_at' => ['required', 'string', 'max:255'],
            'tenancy_uin' => ['required', 'string', 'max:64'],

            // Applicant (A)
            'applicant_name' => ['required', 'string', 'max:255'],
            'applicant_residential_address' => ['required', 'string'],

            // Respondent (B)
            'respondent_name' => ['required', 'string', 'max:255'],
            'respondent_residential_address' => ['required', 'string'],

            // Details (Details of application)
            'particulars_of_application' => ['required', 'string'],
            // Paragraph 2 is a declaration, not a question: the filer accepts the printed
            // wording rather than describing jurisdiction. Must be accepted to file.
            'jurisdiction_declaration_accepted' => ['required', 'accepted'],
            'facts_of_case' => ['required', 'string'],
            'grounds_for_relief' => ['required', 'string'],
            // Paragraph 5 is a declaration with a branch: either no such proceeding was
            // filed or is pending, or the details of each one are required.
            ...PriorProceedings::rules(),
            'relief_sought' => ['required', 'string'],
            'interim_order_sought' => ['nullable', 'string'],
            'list_of_enclosures' => ['nullable', 'string'],

            // Verification
            // The VERIFICATION clause. One sworn sentence with blanks, so the blanks are
            // validated and the sentence itself is composed server-side at submission.
            ...Verification::rules(Declarations::FORM_III_VERIFICATION),

            'signature_name' => ['required', 'string', 'max:255'],
            'signature_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        // A verification that asserts nothing of the filer's own knowledge asserts nothing.
        if (Verification::personalKnowledgeIsEmpty(Declarations::FORM_III_VERIFICATION, $data)) {
            $message = 'Mark at least one paragraph as true to your personal knowledge.';

            return response()->json([
                'message' => $message,
                'errors' => ['verification_paragraphs' => [$message]],
            ], 422);
        }

        $verification = Verification::normalise(Declarations::FORM_III_VERIFICATION, $data);

        $signaturePath = null;
        if ($request->hasFile('signature_image')) {
            $signaturePath = $request->file('signature_image')
                ->store('tenancy/signatures/rent-court-filing', 'public');
        }

        $priorProceedings = PriorProceedings::normalise($data);

        [$tenancy, $uinError] = \App\Models\TenancyApplication::resolveForServiceForm($data['tenancy_uin'], $user);
        if ($uinError) {
            return response()->json([
                'message' => $uinError,
                'errors' => ['tenancy_uin' => [$uinError]],
            ], 422);
        }

        $application = RentCourtFilingApplication::create([
            'application_no' => RentCourtFilingApplication::generateApplicationNo($tenancy->district_id),
            'user_id' => $user->id,
            'district_id' => $tenancy->district_id,
            'rent_court_at' => $data['rent_court_at'],
            'tenancy_uin' => $data['tenancy_uin'],
            'applicant_name' => $data['applicant_name'],
            'applicant_residential_address' => $data['applicant_residential_address'],
            'respondent_name' => $data['respondent_name'],
            'respondent_residential_address' => $data['respondent_residential_address'],
            'particulars_of_application' => $data['particulars_of_application'] ?? null,
            'jurisdiction_of_rent_court' => Declarations::textFor(Declarations::FORM_III_JURISDICTION),
            'facts_of_case' => $data['facts_of_case'] ?? null,
            'grounds_for_relief' => $data['grounds_for_relief'] ?? null,
            'matters_not_previously_filed_or_pending' => PriorProceedings::summarise(
                $priorProceedings,
                Declarations::textFor(Declarations::FORM_III_PRIOR_PROCEEDINGS)
            ),
            'has_prior_proceedings' => $priorProceedings !== null,
            'prior_proceedings' => $priorProceedings,
            'relief_sought' => $data['relief_sought'] ?? null,
            'interim_order_sought' => $data['interim_order_sought'] ?? null,
            // The form requires the decision in every disposed case to be enclosed, so
            // those are added to whatever the filer listed at paragraph 8.
            'list_of_enclosures' => PriorProceedings::appendEnclosures(
                $data['list_of_enclosures'] ?? null,
                $priorProceedings
            ),
            'verification_name' => $verification['name'],
            'verification_relation' => $verification['relation'],
            'verification_relative_name' => $verification['relative_name'],
            'verification_age' => $verification['age'],
            'verification_address' => $verification['address'],
            'verification_place' => $verification['place'],
            'verification_personal_knowledge_paras' => $verification['personal_knowledge_paras'],
            'verification_legal_advice_paras' => $verification['legal_advice_paras'],
            // Stamped here, not accepted from the browser: the date of verification is the
            // moment of filing, and a supplied date could be back-dated against limitation.
            'verified_on' => Carbon::now()->toDateString(),
            'verification_statement' => Verification::compose(
                Declarations::FORM_III_VERIFICATION,
                $verification
            ),
            'signature_name' => $data['signature_name'],
            'signature_image_path' => $signaturePath,
            'status' => Status::SUBMITTED,
            'assigned_to_role' => Roles::RC_ASSISTANT,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        app(AttestationRecorder::class)->record(
            $request,
            ApplicationTypes::RENT_COURT_FILING,
            $application->id,
            Declarations::FORM_III_JURISDICTION
        );

        // Only recorded where the filer made the declaration. Where they disclosed prior
        // proceedings they did not assert it, so there is nothing to attest.
        if ($priorProceedings === null) {
            app(AttestationRecorder::class)->record(
                $request,
                ApplicationTypes::RENT_COURT_FILING,
                $application->id,
                Declarations::FORM_III_PRIOR_PROCEEDINGS
            );
        }

        // The verification carries the filer's own words, so the blanks go with it. The
        // recorder composes the sentence from the Gazette template; nothing here is prose
        // that came off the wire.
        app(AttestationRecorder::class)->record(
            $request,
            ApplicationTypes::RENT_COURT_FILING,
            $application->id,
            Declarations::FORM_III_VERIFICATION,
            $verification
        );

        return response()->json([
            'message' => 'Form III submitted successfully.',
            'application' => $application,
            'submitted_at' => Carbon::now()->toDateTimeString(),
        ], 201);
    }

    public function show(Request $request, RentCourtFilingApplication $application)
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


