<?php

namespace App\Http\Controllers;

use App\Models\RentCourtPossessionApplication;
use App\Http\Resources\ApplicationResource;
use App\Constants\EvictionGrounds;
use App\Constants\ApplicationTypes;
use App\Constants\Declarations;
use App\Constants\Roles;
use App\Constants\Status;
use App\Services\AttestationRecorder;
use App\Support\PriorProceedings;
use App\Support\Verification;
use Carbon\Carbon;
use App\Support\DocumentStore;
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
            'tenant_name' => ['required', 'string', 'max:255'],

            // Form II recital. Section 21(2) allows "one or more of the following grounds" and
            // lists eight clauses, so the selection is a closed set rather than free text. Section
            // 22 (legal heirs of a deceased landlord) has no sub-grounds.
            'particulars_of_application' => ['required', 'string'],
            'statutory_basis' => ['required', 'string', 'in:' . implode(',', EvictionGrounds::bases())],
            'eviction_grounds' => [
                'array',
                'required_if:statutory_basis,' . EvictionGrounds::BASIS_SECTION_21_2,
            ],
            'eviction_grounds.*' => ['string', 'in:' . implode(',', EvictionGrounds::clauses())],

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
            'enclosures_list' => ['nullable', 'string'],

            // The VERIFICATION clause. One sworn sentence with blanks, so the blanks are
            // validated and the sentence itself is composed server-side at submission.
            ...Verification::rules(Declarations::FORM_II_VERIFICATION),

            'signature_name' => ['required', 'string', 'max:255'],
            'signature_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        // A verification that asserts nothing of the filer's own knowledge asserts nothing.
        if (Verification::personalKnowledgeIsEmpty(Declarations::FORM_II_VERIFICATION, $data)) {
            $message = 'Mark at least one paragraph as true to your personal knowledge.';

            return response()->json([
                'message' => $message,
                'errors' => ['verification_paragraphs' => [$message]],
            ], 422);
        }

        $verification = Verification::normalise(Declarations::FORM_II_VERIFICATION, $data);

        $signaturePath = null;
        if ($request->hasFile('signature_image')) {
            $signaturePath = DocumentStore::store($request->file('signature_image'), 'tenancy/signatures/rent-court-possession');
        }

        // Section 22 is a single basis with no clause list; drop any clauses posted alongside it.
        $groundsForBasis = $data['statutory_basis'] === EvictionGrounds::BASIS_SECTION_21_2
            ? array_values(array_unique($data['eviction_grounds'] ?? []))
            : null;

        $priorProceedings = PriorProceedings::normalise($data);

        [$tenancy, $uinError] = \App\Models\TenancyApplication::resolveForServiceForm($data['tenancy_uin'], $user);
        if ($uinError) {
            return response()->json([
                'message' => $uinError,
                'errors' => ['tenancy_uin' => [$uinError]],
            ], 422);
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
            'particulars_of_application' => $data['particulars_of_application'] ?? null,
            'statutory_basis' => $data['statutory_basis'],
            'eviction_grounds' => $groundsForBasis,
            'jurisdiction_statement' => Declarations::textFor(Declarations::FORM_II_JURISDICTION),
            'facts_of_case' => $data['facts_of_case'] ?? null,
            'grounds_for_relief' => $data['grounds_for_relief'] ?? null,
            'matters_not_previously_filed' => PriorProceedings::summarise(
                $priorProceedings,
                Declarations::textFor(Declarations::FORM_II_PRIOR_PROCEEDINGS)
            ),
            'has_prior_proceedings' => $priorProceedings !== null,
            'prior_proceedings' => $priorProceedings,
            'relief_sought' => $data['relief_sought'] ?? null,
            'interim_order_sought' => $data['interim_order_sought'] ?? null,
            // The form requires the decision in every disposed case to be enclosed, so
            // those are added to whatever the filer listed at paragraph 8.
            'enclosures_list' => PriorProceedings::appendEnclosures(
                $data['enclosures_list'] ?? null,
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
                Declarations::FORM_II_VERIFICATION,
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
            ApplicationTypes::RENT_COURT_POSSESSION,
            $application->id,
            Declarations::FORM_II_JURISDICTION
        );

        // Only recorded where the filer made the declaration. Where they disclosed prior
        // proceedings they did not assert it, so there is nothing to attest.
        if ($priorProceedings === null) {
            app(AttestationRecorder::class)->record(
                $request,
                ApplicationTypes::RENT_COURT_POSSESSION,
                $application->id,
                Declarations::FORM_II_PRIOR_PROCEEDINGS
            );
        }

        // The verification carries the filer's own words, so the blanks go with it. The
        // recorder composes the sentence from the Gazette template; nothing here is prose
        // that came off the wire.
        app(AttestationRecorder::class)->record(
            $request,
            ApplicationTypes::RENT_COURT_POSSESSION,
            $application->id,
            Declarations::FORM_II_VERIFICATION,
            $verification
        );

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

        if ($application->user_id != $user->id) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return response()->json([
            'application' => new ApplicationResource($application),
        ]);
    }
}


