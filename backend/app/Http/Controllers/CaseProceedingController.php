<?php

namespace App\Http\Controllers;

use App\Constants\ApplicationTypes;
use App\Constants\Roles;
use App\Models\CaseProceeding;
use App\Models\UserActivityLog;
use App\Support\DocumentStore;
use App\Support\NoticeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CaseProceedingController extends Controller
{
    /** A signed PDF that comes back larger than this is not a hearing notice. */
    private const MAX_SIGNED_BYTES = 20 * 1024 * 1024;

    /**
     * Get all proceedings for a given application.
     */
    public function index(Request $request, $type, $id)
    {
        [$application, $refusal] = $this->resolveForOfficer($request, $type, $id);
        if ($refusal) {
            return $refusal;
        }

        return response()->json([
            'proceedings' => $this->proceedingsFor($type, $id),
        ]);
    }

    /**
     * Get all proceedings for a given application (Citizen).
     *
     * Signed proceedings only. A proceeding exists from the moment an assistant records it, but
     * until the issuing authority has affixed its digital signature the notice is a draft: the
     * document itself says so in terms. Publishing drafts to the party was showing them a hearing
     * date that nobody had yet issued, and an unsigned order is not an order.
     */
    public function citizenIndex(Request $request, $type, $id)
    {
        $modelClass = ApplicationTypes::modelFor((string) $type);
        if (!$modelClass) {
            return response()->json(['message' => 'Invalid application type'], 400);
        }

        $application = $modelClass::find($id);
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        if ((int) $application->user_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'proceedings' => $this->proceedingsFor($type, $id, true),
        ]);
    }

    /**
     * Store a new case proceeding/notice.
     *
     * The notice is rendered to a PDF here and frozen. It is not merely a convenience: it is the
     * document the parties are served with, it is what the digital signature will be applied to,
     * and it must not change afterwards even if the underlying application is edited. See
     * App\Support\NoticeDocument.
     */
    public function store(Request $request, $type, $id)
    {
        [$application, $refusal] = $this->resolveForOfficer($request, $type, $id);
        if ($refusal) {
            return $refusal;
        }

        $request->validate([
            'notice_type' => 'required|string|in:appearance,applicant_absent,respondent_absent,adjournment,proceeding_sheet,final_order,ex_parte',
            'hearing_date' => 'nullable|date',
            'hearing_time' => 'nullable|date_format:H:i',
            'venue' => 'nullable|string',
            'previous_hearing_date' => 'nullable|date',
            'remarks' => 'nullable|string',
            'additional_remarks' => 'nullable|string',
        ]);

        $proceeding = CaseProceeding::create([
            'application_type' => $type,
            'application_id' => $id,
            'notice_type' => $request->notice_type,
            'hearing_date' => $request->hearing_date,
            'hearing_time' => $request->hearing_time,
            'venue' => $request->venue,
            'previous_hearing_date' => $request->previous_hearing_date,
            'remarks' => $request->remarks,
            'additional_remarks' => $request->additional_remarks,
            'sent_by_user_id' => $request->user()->id,
        ]);

        $this->generateDocument($proceeding, $application);

        // TODO: Send email to the involved parties, once the notice has been signed.

        return response()->json([
            'message' => 'Proceeding added successfully',
            'proceeding' => $proceeding->fresh()->load('sentBy:id,name,role'),
        ], 201);
    }

    /**
     * The notice PDF: the signed one where it exists, otherwise the frozen draft.
     *
     * The draft is served to officers only, and carries a prominent "NOT YET SIGNED" attestation,
     * because this is also the endpoint the signing flow fetches the bytes from.
     */
    public function document(Request $request, $type, $id, $proceedingId)
    {
        [$application, $refusal] = $this->resolveForOfficer($request, $type, $id);
        if ($refusal) {
            return $refusal;
        }

        $proceeding = $this->findProceeding($type, $id, $proceedingId);
        if (!$proceeding) {
            return response()->json(['message' => 'Proceeding not found'], 404);
        }

        $path = $proceeding->signed_document_path ?: $this->ensureDocument($proceeding, $application);
        if (!$path) {
            return response()->json(['message' => 'This notice could not be rendered.'], 500);
        }

        return $this->streamDocument($proceeding, $application, $path);
    }

    /**
     * The signed notice, for the party it concerns.
     *
     * No draft fallback: if it is not signed, as far as the citizen is concerned it does not exist.
     */
    public function citizenDocument(Request $request, $type, $id, $proceedingId)
    {
        $modelClass = ApplicationTypes::modelFor((string) $type);
        if (!$modelClass) {
            return response()->json(['message' => 'Invalid application type'], 400);
        }

        $application = $modelClass::with('district')->find($id);
        if (!$application || (int) $application->user_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $proceeding = $this->findProceeding($type, $id, $proceedingId);
        if (!$proceeding || !$proceeding->signed_document_path) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return $this->streamDocument($proceeding, $application, $proceeding->signed_document_path);
    }

    /**
     * Record the digitally signed notice returned by the officer's local DSC agent.
     *
     * Signing happens entirely on the officer's machine: the agent holds the token, prompts for the
     * PIN and returns the signed bytes. Neither the PIN nor the certificate ever reaches this
     * server, and nothing here can sign on anybody's behalf - all this endpoint does is accept the
     * result and record who produced it.
     *
     * Two facts are stored because they are genuinely different. `signature_authority` is the
     * office in whose name the notice issues, derived from the application: an order of the Rent
     * Court is the Rent Court's whether the presiding officer or their assistant prepared and
     * issued it. `signed_by_user_id`, with whatever the agent reports in `signature_metadata`, is
     * who actually operated the token. Presenting either as the other would put a false statement
     * in the record.
     */
    public function signature(Request $request, $type, $id, $proceedingId)
    {
        [$application, $refusal] = $this->resolveForOfficer($request, $type, $id);
        if ($refusal) {
            return $refusal;
        }

        $proceeding = $this->findProceeding($type, $id, $proceedingId);
        if (!$proceeding) {
            return response()->json(['message' => 'Proceeding not found'], 404);
        }

        if ($proceeding->signed_document_path) {
            // Re-signing would replace a document that may already have been served. A notice that
            // has to change is a fresh proceeding, so the record shows both.
            return response()->json([
                'message' => 'This notice has already been signed. Record a new proceeding if it needs to be reissued.',
            ], 409);
        }

        $data = $request->validate([
            'signed_pdf_base64' => ['required', 'string'],
            // Whatever the agent returned alongside the PDF - certificate subject, serial, issuer,
            // agent version. Accepted as-is and never trusted for authorisation.
            'agent_response' => ['nullable', 'array'],
        ]);

        $pdf = base64_decode($data['signed_pdf_base64'], true);
        if ($pdf === false || $pdf === '') {
            return $this->rejectSignature($request, $proceeding, 'not_base64', 'The signed document could not be decoded.');
        }

        if (strlen($pdf) > self::MAX_SIGNED_BYTES) {
            return $this->rejectSignature($request, $proceeding, 'too_large', 'The signed document is too large.');
        }

        if (!str_starts_with($pdf, '%PDF-')) {
            return $this->rejectSignature($request, $proceeding, 'not_pdf', 'The signed document is not a PDF.');
        }

        if (!$this->looksSigned($pdf)) {
            // Cheap structural check, not cryptographic verification: a signed PDF carries a
            // signature dictionary with a /ByteRange. It catches the case that actually happens -
            // the unsigned draft being posted back when the token step silently failed - without
            // pretending to validate the certificate chain, which this server cannot do.
            return $this->rejectSignature(
                $request,
                $proceeding,
                'unsigned',
                'That file carries no digital signature. Check that your DSC token was detected and try again.'
            );
        }

        $proceeding->forceFill([
            'signed_document_path' => DocumentStore::putContents($pdf, 'tenancy/notices/signed'),
            'signed_at' => now(),
            'signed_by_user_id' => $request->user()->id,
            'signature_authority' => NoticeDocument::authority($proceeding, $application),
            'signature_metadata' => $this->signatureMetadata($request, $pdf),
        ])->save();

        $this->auditSignature($request, $proceeding, 'signed');

        return response()->json([
            'message' => 'Notice signed and issued.',
            'proceeding' => $proceeding->fresh()->load('sentBy:id,name,role'),
        ]);
    }

    // ---------------------------------------------------------------- internals

    /**
     * Resolve the application and confirm this officer may work on it.
     *
     * The district test is ApplicationWorkflowController::show()'s, so anything an officer can open
     * in the admin screens they can also issue and sign notices on. Before this, index() and
     * store() carried a comment saying access "ideally" ought to be checked and checked nothing:
     * the route's role gate let a Rent Court officer in one district read - and record - the
     * proceedings of every other district.
     */
    private function resolveForOfficer(Request $request, $type, $id): array
    {
        $user = $request->user();
        $modelClass = ApplicationTypes::modelFor((string) $type);
        if (!$modelClass) {
            return [null, response()->json(['message' => 'Invalid application type'], 400)];
        }

        $application = $modelClass::with('district')->find($id);
        if (!$application) {
            return [null, response()->json(['message' => 'Application not found'], 404)];
        }

        if ($user->role === Roles::VALUER) {
            return [null, response()->json(['message' => 'Forbidden'], 403)];
        }

        if ($user->role !== Roles::SUPER_ADMIN
            && $user->district_id
            && (int) $application->district_id !== (int) $user->district_id) {
            return [null, response()->json(['message' => 'Forbidden'], 403)];
        }

        return [$application, null];
    }

    private function proceedingsFor($type, $id, bool $signedOnly = false)
    {
        $query = CaseProceeding::where('application_type', $type)
            ->where('application_id', $id)
            ->with('sentBy:id,name,role');

        if ($signedOnly) {
            $query->whereNotNull('signed_document_path');
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    private function findProceeding($type, $id, $proceedingId): ?CaseProceeding
    {
        return CaseProceeding::where('application_type', $type)
            ->where('application_id', $id)
            ->find($proceedingId);
    }

    /** Render and freeze the notice. Failure is logged, not fatal: the proceeding still exists. */
    private function generateDocument(CaseProceeding $proceeding, $application): ?string
    {
        if (!NoticeDocument::supports($proceeding->notice_type)) {
            return null;
        }

        try {
            $path = DocumentStore::putContents(
                NoticeDocument::pdf($proceeding, $application, false),
                'tenancy/notices/draft'
            );
        } catch (\Throwable $e) {
            report($e);

            return null;
        }

        $proceeding->forceFill([
            'document_path' => $path,
            'document_generated_at' => now(),
        ])->save();

        return $path;
    }

    /**
     * The frozen draft, generating it if this proceeding predates the change or generation failed.
     *
     * Proceedings recorded before 8 September 2026 have no stored document at all - they only ever
     * existed as a browser render - so the first officer to open one renders it now.
     */
    private function ensureDocument(CaseProceeding $proceeding, $application): ?string
    {
        if ($proceeding->document_path && DocumentStore::exists($proceeding->document_path)) {
            return $proceeding->document_path;
        }

        return $this->generateDocument($proceeding, $application);
    }

    private function streamDocument(CaseProceeding $proceeding, $application, string $path)
    {
        $disk = DocumentStore::diskFor($path);
        if (!$disk) {
            return response()->json(['message' => 'The notice document is no longer available.'], 404);
        }

        return Storage::disk($disk)->response(
            $path,
            NoticeDocument::filename($proceeding, $application),
            [
                'Content-Type' => 'application/pdf',
                'Cache-Control' => 'private, no-store',
                'X-Content-Type-Options' => 'nosniff',
            ]
        );
    }

    /**
     * Does this PDF carry a signature dictionary?
     *
     * /ByteRange is what a PKCS#7 signature adds to describe the ranges it covers, and it is absent
     * from an unsigned document. This is a sanity check on the round trip, not verification.
     */
    private function looksSigned(string $pdf): bool
    {
        return str_contains($pdf, '/ByteRange');
    }

    /**
     * What the agent reported, plus what we can see for ourselves.
     *
     * The agent's own fields are kept whole rather than picked apart, so a later release that
     * reports more certificate detail is recorded without a migration. They are a record of what
     * the client said, never a basis for a decision here.
     */
    private function signatureMetadata(Request $request, string $pdf): array
    {
        $reported = (array) $request->input('agent_response', []);
        unset($reported['signedPdfBase64'], $reported['pdfBase64']);

        return [
            'agent' => $reported,
            'observed' => [
                'bytes' => strlen($pdf),
                'sha256' => hash('sha256', $pdf),
            ],
            'operated_by' => [
                'user_id' => $request->user()->id,
                'name' => $request->user()->name,
                'role' => $request->user()->role,
            ],
            'ip_address' => $request->ip(),
            'recorded_at' => now()->toIso8601String(),
        ];
    }

    private function rejectSignature(Request $request, CaseProceeding $proceeding, string $outcome, string $message)
    {
        $this->auditSignature($request, $proceeding, $outcome);

        return response()->json(['message' => $message], 422);
    }

    /**
     * Every attempt to sign a notice, accepted or refused.
     *
     * Rule 4(3) puts the Rent Authority under a duty to take all measures for the security of its
     * data, and section 36(2) of the Act deems these proceedings judicial. Who signed what, and who
     * tried and failed, has to be reviewable afterwards.
     */
    private function auditSignature(Request $request, CaseProceeding $proceeding, string $outcome): void
    {
        UserActivityLog::record($request, 'POST ' . $request->path(), [
            'proceeding_id' => $proceeding->id,
            'application_type' => $proceeding->application_type,
            'application_id' => $proceeding->application_id,
            'notice_type' => $proceeding->notice_type,
            'outcome' => $outcome,
        ]);
    }
}
