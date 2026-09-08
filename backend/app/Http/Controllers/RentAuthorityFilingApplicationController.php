<?php

namespace App\Http\Controllers;

use App\Models\RentAuthorityFilingApplication;
use App\Http\Resources\ApplicationResource;
use App\Constants\RentAuthorityMatters;
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

            // Rule 11(1) routes Act ss. 10, 14, 15 and 20 through this one form. The section is
            // captured because the inquiry that follows differs completely between them.
            'statutory_matter' => ['required', 'string', 'in:' . implode(',', RentAuthorityMatters::all())],

            // s. 15 only: Second Schedule items in dispute.
            'repair_items' => ['array', 'required_if:statutory_matter,' . RentAuthorityMatters::SECTION_15],
            'repair_items.*' => ['string', 'in:' . implode(',', RentAuthorityMatters::repairItemCodes())],

            // s. 20 only: the services withheld. The Explanation to s. 20 says "includes", so the
            // list is illustrative and "other" carries free text.
            'essential_services' => ['array', 'required_if:statutory_matter,' . RentAuthorityMatters::SECTION_20],
            'essential_services.*' => ['string', 'in:' . implode(',', RentAuthorityMatters::essentialServiceCodes())],
            'essential_service_other' => ['nullable', 'string', 'max:255'],

            // Details
            'particulars_of_violation' => ['required', 'string'],
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

            // Verification / signature
            // The VERIFICATION clause. One sworn sentence with blanks, so the blanks are
            // validated and the sentence itself is composed server-side at submission.
            ...Verification::rules(Declarations::FORM_IV_VERIFICATION),

            'signature_name' => ['required', 'string', 'max:255'],
            'signature_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        // A verification that asserts nothing of the filer's own knowledge asserts nothing.
        if (Verification::personalKnowledgeIsEmpty(Declarations::FORM_IV_VERIFICATION, $data)) {
            $message = 'Mark at least one paragraph as true to your personal knowledge.';

            return response()->json([
                'message' => $message,
                'errors' => ['verification_paragraphs' => [$message]],
            ], 422);
        }

        $verification = Verification::normalise(Declarations::FORM_IV_VERIFICATION, $data);

        $signaturePath = null;
        if ($request->hasFile('signature_image')) {
            $signaturePath = $request->file('signature_image')
                ->store('tenancy/signatures/rent-authority-filing', 'public');
        }

        // Keep only the sub-list that belongs to the section chosen, so a switch in the form does
        // not leave a stale selection behind on the record.
        $isRepairs = $data['statutory_matter'] === RentAuthorityMatters::SECTION_15;
        $isServices = $data['statutory_matter'] === RentAuthorityMatters::SECTION_20;

        $repairItems = $isRepairs ? array_values(array_unique($data['repair_items'] ?? [])) : null;
        $essentialServices = $isServices ? array_values(array_unique($data['essential_services'] ?? [])) : null;
        $essentialServiceOther = null;
        if ($isServices && in_array(RentAuthorityMatters::SERVICE_OTHER, $essentialServices ?? [], true)) {
            $essentialServiceOther = trim((string) ($data['essential_service_other'] ?? ''));
            if ($essentialServiceOther === '') {
                return response()->json([
                    'message' => 'Describe the other essential service that has been withheld.',
                    'errors' => ['essential_service_other' => ['Describe the other essential service that has been withheld.']],
                ], 422);
            }
        }

        $priorProceedings = PriorProceedings::normalise($data);

        [$tenancy, $uinError] = \App\Models\TenancyApplication::resolveForServiceForm($data['tenancy_uin'], $user);
        if ($uinError) {
            return response()->json([
                'message' => $uinError,
                'errors' => ['tenancy_uin' => [$uinError]],
            ], 422);
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
            'statutory_matter' => $data['statutory_matter'],
            'repair_items' => $repairItems,
            'essential_services' => $essentialServices,
            'essential_service_other' => $essentialServiceOther,
            'particulars_of_violation' => $data['particulars_of_violation'] ?? null,
            'jurisdiction_of_rent_authority' => Declarations::textFor(Declarations::FORM_IV_JURISDICTION),
            'facts_of_case' => $data['facts_of_case'] ?? null,
            'grounds_for_relief' => $data['grounds_for_relief'] ?? null,
            'matters_not_previously_filed_or_pending' => PriorProceedings::summarise(
                $priorProceedings,
                Declarations::textFor(Declarations::FORM_IV_PRIOR_PROCEEDINGS)
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
                Declarations::FORM_IV_VERIFICATION,
                $verification
            ),
            'signature_name' => $data['signature_name'],
            'signature_image_path' => $signaturePath,
            'status' => Status::SUBMITTED,
            'assigned_to_role' => Roles::RA_ASSISTANT,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        app(AttestationRecorder::class)->record(
            $request,
            ApplicationTypes::RENT_AUTHORITY_FILING,
            $application->id,
            Declarations::FORM_IV_JURISDICTION
        );

        // Only recorded where the filer made the declaration. Where they disclosed prior
        // proceedings they did not assert it, so there is nothing to attest.
        if ($priorProceedings === null) {
            app(AttestationRecorder::class)->record(
                $request,
                ApplicationTypes::RENT_AUTHORITY_FILING,
                $application->id,
                Declarations::FORM_IV_PRIOR_PROCEEDINGS
            );
        }

        // The verification carries the filer's own words, so the blanks go with it. The
        // recorder composes the sentence from the Gazette template; nothing here is prose
        // that came off the wire.
        app(AttestationRecorder::class)->record(
            $request,
            ApplicationTypes::RENT_AUTHORITY_FILING,
            $application->id,
            Declarations::FORM_IV_VERIFICATION,
            $verification
        );

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


