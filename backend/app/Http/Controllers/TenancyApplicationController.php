<?php

namespace App\Http\Controllers;

use App\Models\Office;
use App\Models\TenancyApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class TenancyApplicationController extends Controller
{
    public function show(Request $request, TenancyApplication $tenancyApplication)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!$this->userCanAccess($user, $tenancyApplication)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $tenancyApplication->load('office', 'villageWard');

        return response()->json(['application' => $tenancyApplication]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $request->validate([
            'registration_date' => ['required', 'date', 'before_or_equal:today'],
            'office_id' => ['nullable', 'integer', 'exists:offices,id'],
            'village_ward_id' => ['required', 'integer', 'exists:village_wards,id'],
            'apply_type' => ['required', 'string', 'max:32'],
            'initiator_role' => ['required', 'string', 'in:LANDLORD,TENANT'],
            'landlord_name' => ['required', 'string', 'max:255'],
            'landlord_address' => ['nullable', 'string'],
            'landlord_email' => ['required', 'email'],
            'landlord_phone' => ['required', 'string', 'max:30'],
            'landlord_pan' => ['nullable', 'string', 'max:30'],
            'manager_name' => ['nullable', 'string', 'max:255'],
            'manager_address' => ['nullable', 'string'],
            'manager_email' => ['nullable', 'string', 'max:255'],
            'manager_phone' => ['nullable', 'string', 'max:30'],
            'manager_pan' => ['nullable', 'string', 'max:30'],
            'tenant_name' => ['required', 'string', 'max:255'],
            'tenant_address' => ['nullable', 'string'],
            'tenant_email' => ['required', 'email'],
            'tenant_phone' => ['required', 'string', 'max:30'],
            'tenant_pan' => ['nullable', 'string', 'max:30'],
            'tenant_previous_tenancy' => ['nullable', 'string'],
            'property_possession_date' => ['required', 'date'],
            'property_rent_payable' => ['required', 'numeric', 'min:0'],
            'property_premises_description' => ['required', 'string'],
            'property_furniture_description' => ['nullable', 'string'],
            'property_charge_electricity' => ['nullable', 'string', 'max:255'],
            'property_charge_water' => ['nullable', 'string', 'max:255'],
            'property_charge_furnishing' => ['nullable', 'string', 'max:255'],
            'property_charge_other_services' => ['nullable', 'string', 'max:255'],
            'property_tenancy_duration' => ['required', 'string', 'max:255'],
            'agreement_pdf' => ['nullable', 'file', 'mimes:pdf'],
            'landlord_photo' => ['nullable', 'image'],
            'landlord_signature' => ['nullable', 'image'],
            'tenant_photo' => ['nullable', 'image'],
            'tenant_signature' => ['nullable', 'image'],
            'landlord_photo_path' => ['nullable', 'string', 'max:255'],
            'tenant_photo_path' => ['nullable', 'string', 'max:255'],
        ]);

        // Government criteria: registration must be within 3 months
        $regDate = Carbon::parse($data['registration_date']);
        $monthsDiff = Carbon::now()->diffInMonths($regDate, false);
        if ($monthsDiff > 3) {
            throw ValidationException::withMessages([
                'registration_date' => ['The tenancy agreement registration date must be within the last 3 months.'],
            ]);
        }

        // Generate deterministic ref code
        $refCode = TenancyApplication::generateRefCode(
            $data['landlord_phone'],
            $data['tenant_phone'],
            $data['registration_date'],
            $data['village_ward_id']
        );

        // Check for existing application with same ref code
        $existing = TenancyApplication::where('ref_code', $refCode)->first();
        if ($existing) {
            return response()->json([
                'conflict' => true,
                'message' => 'An application with the same details already exists.',
                'ref_code' => $refCode,
                'existing_application' => [
                    'id' => $existing->id,
                    'application_no' => $existing->application_no,
                    'status' => $existing->status,
                    'initiator_role' => $existing->initiator_role,
                    'initiator_completed' => $existing->initiator_completed,
                    'second_party_completed' => $existing->second_party_completed,
                ],
            ], 409);
        }

        $initiatorRole = $data['initiator_role'];

        $application = DB::transaction(function () use ($data, $request, $user, $refCode, $initiatorRole) {
            $now = Carbon::now();
            $prefix = 'APP-' . $now->format('Ym');

            $latest = TenancyApplication::where('application_no', 'like', $prefix . '-%')
                ->whereRaw("application_no ~ '^[A-Z]+-[0-9]{6}-[0-9]+$'")
                ->orderByDesc('application_no')
                ->lockForUpdate()
                ->first();

            $next = 1;
            if ($latest) {
                $parts = explode('-', $latest->application_no);
                $seq = (int) end($parts);
                $next = $seq + 1;
            }
            $applicationNo = $prefix . '-' . str_pad((string) $next, 6, '0', STR_PAD_LEFT);

            $paths = [
                'agreement_pdf_path' => $this->storeUpload($request, 'agreement_pdf', 'tenancy/agreements'),
                'landlord_photo_path' => $this->storeUpload($request, 'landlord_photo', 'tenancy/photos')
                    ?: ($data['landlord_photo_path'] ?? null),
                'landlord_signature_path' => $this->storeUpload($request, 'landlord_signature', 'tenancy/signatures'),
                'tenant_photo_path' => $this->storeUpload($request, 'tenant_photo', 'tenancy/photos')
                    ?: ($data['tenant_photo_path'] ?? null),
                'tenant_signature_path' => $this->storeUpload($request, 'tenant_signature', 'tenancy/signatures'),
            ];

            $movement = [[
                'status' => 'PARTIAL',
                'current_with' => null,
                'moved_at' => $now->toDateTimeString(),
            ]];

            return TenancyApplication::create(array_merge($data, $paths, [
                'application_no' => $applicationNo,
                'ref_code' => $refCode,
                'user_id' => $user->id,
                'initiator_role' => $initiatorRole,
                'initiator_completed' => true,
                'second_party_completed' => false,
                'landlord_user_id' => $initiatorRole === 'LANDLORD' ? $user->id : null,
                'tenant_user_id' => $initiatorRole === 'TENANT' ? $user->id : null,
                'application_type' => 'Tenancy Certificate',
                'status' => 'PARTIAL',
                'current_with' => null,
                'movement_history' => $movement,
            ]));
        });

        $frontendUrl = config('app.frontend_url', $request->getSchemeAndHttpHost());
        $joinLink = $frontendUrl . '/join?refCode=' . $application->ref_code;

        return response()->json([
            'id' => $application->id,
            'application_no' => $application->application_no,
            'ref_code' => $application->ref_code,
            'join_link' => $joinLink,
            'submitted_at' => $application->created_at->toDateTimeString(),
            'application' => $application,
        ], 201);
    }

    /**
     * Lookup an application by reference code (for second party join flow).
     */
    public function lookupByRefCode(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'ref_code' => ['required', 'string', 'max:64'],
        ]);

        $application = TenancyApplication::where('ref_code', $request->input('ref_code'))
            ->with('office', 'villageWard')
            ->first();

        if (!$application) {
            return response()->json(['message' => 'No application found with this reference code.'], 404);
        }

        // Determine the role needed for second party
        $secondPartyRole = $application->initiator_role === 'LANDLORD' ? 'TENANT' : 'LANDLORD';

        // Check if already completed
        if ($application->second_party_completed) {
            return response()->json([
                'message' => 'This application has already been completed by both parties.',
                'status' => $application->status,
            ], 400);
        }

        // Check if user is trying to join as same role
        $userRole = strtoupper($user->profile_type ?? '');
        if ($userRole === $application->initiator_role) {
            return response()->json([
                'message' => 'You cannot join as the same role as the initiator. A ' . $secondPartyRole . ' is needed.',
            ], 403);
        }

        return response()->json([
            'application' => [
                'id' => $application->id,
                'application_no' => $application->application_no,
                'ref_code' => $application->ref_code,
                'status' => $application->status,
                'initiator_role' => $application->initiator_role,
                'second_party_role' => $secondPartyRole,
                'registration_date' => $application->registration_date,
                'office' => $application->office,
                'village_ward' => $application->villageWard,
                'landlord_name' => $application->landlord_name,
                'landlord_phone' => $application->landlord_phone,
                'landlord_email' => $application->landlord_email,
                'landlord_address' => $application->landlord_address,
                'landlord_pan' => $application->landlord_pan,
                'tenant_name' => $application->tenant_name,
                'tenant_phone' => $application->tenant_phone,
                'tenant_email' => $application->tenant_email,
                'tenant_address' => $application->tenant_address,
                'tenant_pan' => $application->tenant_pan,
                'property_premises_description' => $application->property_premises_description,
                'property_rent_payable' => $application->property_rent_payable,
                'property_tenancy_duration' => $application->property_tenancy_duration,
                'property_possession_date' => $application->property_possession_date,
                'apply_type' => $application->apply_type,
                'initiator_completed' => $application->initiator_completed,
                'second_party_completed' => $application->second_party_completed,
            ],
        ]);
    }

    /**
     * Second party joins an existing application via ref code.
     */
    public function joinApplication(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $request->validate([
            'ref_code' => ['required', 'string', 'max:64'],
            // Second party details (role-specific)
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'email' => ['required', 'email'],
            'phone' => ['required', 'string', 'max:30'],
            'pan' => ['required', 'string', 'max:30'],
            'previous_tenancy' => ['nullable', 'string'],
            'photo' => ['nullable', 'image'],
            'signature' => ['nullable', 'image'],
            'photo_path' => ['nullable', 'string', 'max:255'],
        ]);

        $application = TenancyApplication::where('ref_code', $data['ref_code'])->first();

        if (!$application) {
            return response()->json(['message' => 'No application found with this reference code.'], 404);
        }

        if ($application->second_party_completed) {
            return response()->json(['message' => 'This application has already been completed by both parties.'], 400);
        }

        $secondPartyRole = $application->initiator_role === 'LANDLORD' ? 'TENANT' : 'LANDLORD';
        $userRole = strtoupper($user->profile_type ?? '');

        if ($userRole === $application->initiator_role) {
            return response()->json([
                'message' => 'You cannot join as the same role as the initiator.',
            ], 403);
        }

        $now = Carbon::now();

        // Upload documents
        $photoPath = $this->storeUpload($request, 'photo', 'tenancy/photos')
            ?: ($data['photo_path'] ?? null);
        $signaturePath = $this->storeUpload($request, 'signature', 'tenancy/signatures');

        // Update fields based on role
        $updateData = [];
        if ($secondPartyRole === 'TENANT') {
            $updateData = [
                'tenant_user_id' => $user->id,
                'tenant_name' => $data['name'],
                'tenant_address' => $data['address'],
                'tenant_email' => $data['email'],
                'tenant_phone' => $data['phone'],
                'tenant_pan' => $data['pan'],
                'tenant_previous_tenancy' => $data['previous_tenancy'] ?? null,
                'tenant_photo_path' => $photoPath,
                'tenant_signature_path' => $signaturePath,
            ];
        } else {
            $updateData = [
                'landlord_user_id' => $user->id,
                'landlord_name' => $data['name'],
                'landlord_address' => $data['address'],
                'landlord_email' => $data['email'],
                'landlord_phone' => $data['phone'],
                'landlord_pan' => $data['pan'],
                'landlord_photo_path' => $photoPath,
                'landlord_signature_path' => $signaturePath,
            ];
        }

        $updateData['second_party_completed'] = true;

        $transactionResult = DB::transaction(function () use ($application, $updateData, $secondPartyRole, $now) {
            $uid = null;
            $status = 'PARTIAL';
            if ($application->initiator_completed) {
                // Pass the villageWard to get the correct state code for the UID
                $uid = TenancyApplication::generateUid($application->villageWard);
                $status = 'COMPLETED';
                $updateData['uid'] = $uid;
                $updateData['status'] = $status;
                $updateData['current_with'] = 'Rent Authority';
            }

            $movement = $application->movement_history ?? [];
            $movement[] = [
                'status' => $status,
                'current_with' => $status === 'COMPLETED' ? 'Rent Authority' : null,
                'moved_at' => $now->toDateTimeString(),
                'action' => 'Second party (' . $secondPartyRole . ') joined',
            ];
            $updateData['movement_history'] = $movement;

            $application->update($updateData);

            return [
                'uid' => $uid,
                'status' => $status,
            ];
        });

        $uid = $transactionResult['uid'];
        $status = $transactionResult['status'];

        return response()->json([
            'message' => $status === 'COMPLETED'
                ? 'Application completed successfully. Both parties have submitted their details.'
                : 'Your details have been submitted. Waiting for the other party.',
            'application_no' => $application->application_no,
            'ref_code' => $application->ref_code,
            'uid' => $uid,
            'status' => $status,
        ]);
    }

    /**
     * Check if a ref code already exists (for merge detection).
     */
    public function checkRefCode(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'landlord_phone' => ['required', 'string', 'max:30'],
            'tenant_phone' => ['required', 'string', 'max:30'],
            'registration_date' => ['required', 'date'],
            'village_ward_id' => ['required', 'integer', 'exists:village_wards,id'],
        ]);

        $refCode = TenancyApplication::generateRefCode(
            $request->input('landlord_phone'),
            $request->input('tenant_phone'),
            $request->input('registration_date'),
            $request->input('village_ward_id')
        );

        $existing = TenancyApplication::where('ref_code', $refCode)->first();

        if ($existing) {
            return response()->json([
                'exists' => true,
                'ref_code' => $refCode,
                'application_summary' => [
                    'id' => $existing->id,
                    'application_no' => $existing->application_no,
                    'status' => $existing->status,
                    'initiator_role' => $existing->initiator_role,
                    'initiator_completed' => $existing->initiator_completed,
                    'second_party_completed' => $existing->second_party_completed,
                    'landlord_name' => $existing->landlord_name,
                    'tenant_name' => $existing->tenant_name,
                ],
            ]);
        }

        return response()->json([
            'exists' => false,
            'ref_code' => $refCode,
        ]);
    }

    public function update(Request $request, TenancyApplication $tenancyApplication)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!$this->userCanAccess($user, $tenancyApplication)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (strtolower($tenancyApplication->status) !== 'reverted') {
            return response()->json(['message' => 'Only reverted applications can be updated.'], 403);
        }

        $data = $request->validate([
            'registration_date' => ['required', 'date', 'before_or_equal:today'],
            'office_id' => ['nullable', 'integer', 'exists:offices,id'],
            'village_ward_id' => ['nullable', 'integer', 'exists:village_wards,id'],
            'apply_type' => ['required', 'string', 'max:32'],
            'landlord_name' => ['required', 'string', 'max:255'],
            'landlord_address' => ['required', 'string'],
            'landlord_email' => ['required', 'email'],
            'landlord_phone' => ['required', 'string', 'max:30'],
            'landlord_pan' => ['required', 'string', 'max:30'],
            'manager_name' => ['nullable', 'string', 'max:255'],
            'manager_address' => ['nullable', 'string'],
            'manager_email' => ['nullable', 'string', 'max:255'],
            'manager_phone' => ['nullable', 'string', 'max:30'],
            'manager_pan' => ['nullable', 'string', 'max:30'],
            'tenant_name' => ['required', 'string', 'max:255'],
            'tenant_address' => ['required', 'string'],
            'tenant_email' => ['required', 'email'],
            'tenant_phone' => ['required', 'string', 'max:30'],
            'tenant_pan' => ['required', 'string', 'max:30'],
            'tenant_previous_tenancy' => ['nullable', 'string'],
            'property_possession_date' => ['required', 'date'],
            'property_rent_payable' => ['required', 'numeric', 'min:0'],
            'property_premises_description' => ['required', 'string'],
            'property_furniture_description' => ['nullable', 'string'],
            'property_charge_electricity' => ['nullable', 'string', 'max:255'],
            'property_charge_water' => ['nullable', 'string', 'max:255'],
            'property_charge_furnishing' => ['nullable', 'string', 'max:255'],
            'property_charge_other_services' => ['nullable', 'string', 'max:255'],
            'property_tenancy_duration' => ['required', 'string', 'max:255'],
            'agreement_pdf' => ['nullable', 'file', 'mimes:pdf'],
            'landlord_photo' => ['nullable', 'image'],
            'landlord_signature' => ['nullable', 'image'],
            'tenant_photo' => ['nullable', 'image'],
            'tenant_signature' => ['nullable', 'image'],
            'landlord_photo_path' => ['nullable', 'string', 'max:255'],
            'tenant_photo_path' => ['nullable', 'string', 'max:255'],
        ]);

        $now = Carbon::now();
        $status = 'Under process';
        $currentWith = 'Rent Authority';
        $movement = $tenancyApplication->movement_history ?? [];
        $movement[] = [
            'status' => $status,
            'current_with' => $currentWith,
            'moved_at' => $now->toDateTimeString(),
        ];

        $paths = [
            'agreement_pdf_path' => $this->storeUpload($request, 'agreement_pdf', 'tenancy/agreements') ?: $tenancyApplication->agreement_pdf_path,
            'landlord_photo_path' => $this->storeUpload($request, 'landlord_photo', 'tenancy/photos')
                ?: ($data['landlord_photo_path'] ?? $tenancyApplication->landlord_photo_path),
            'landlord_signature_path' => $this->storeUpload($request, 'landlord_signature', 'tenancy/signatures') ?: $tenancyApplication->landlord_signature_path,
            'tenant_photo_path' => $this->storeUpload($request, 'tenant_photo', 'tenancy/photos')
                ?: ($data['tenant_photo_path'] ?? $tenancyApplication->tenant_photo_path),
            'tenant_signature_path' => $this->storeUpload($request, 'tenant_signature', 'tenancy/signatures') ?: $tenancyApplication->tenant_signature_path,
        ];

        $tenancyApplication->update(array_merge($data, $paths, [
            'status' => $status,
            'current_with' => $currentWith,
            'movement_history' => $movement,
        ]));

        return response()->json([
            'id' => $tenancyApplication->id,
            'application_no' => $tenancyApplication->application_no,
            'submitted_at' => $tenancyApplication->updated_at->toDateTimeString(),
            'application' => $tenancyApplication,
        ]);
    }

    public function myApplications(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $query = TenancyApplication::query();

        if ($user->profile_type === 'landlord' || $user->profile_type === 'tenant' || $user->role === 'tenant owner') {
            $query->where(function ($q) use ($user) {
                $q->where('landlord_user_id', $user->id)
                  ->orWhere('tenant_user_id', $user->id)
                  ->orWhere('user_id', $user->id)
                  ->orWhere('landlord_phone', $user->phone)
                  ->orWhere('tenant_phone', $user->phone);

                if ($user->email) {
                    $q->orWhere('landlord_email', $user->email)
                      ->orWhere('tenant_email', $user->email);
                }
            });
        } else {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
                if (!empty($user->office_id)) {
                    $q->orWhere('office_id', $user->office_id);
                }
                $staffRoles = [User::ROLE_DIRECTOR, User::ROLE_ASSISTANT_DIRECTOR, User::ROLE_DISTRICT_HEAD, User::ROLE_DISTRICT_ASSISTANT];
                if (in_array($user->role, $staffRoles, true) && !empty($user->district_id)) {
                    $officeIds = Office::where('district_id', $user->district_id)->pluck('id')->toArray();
                    if (!empty($officeIds)) {
                        $q->orWhereIn('office_id', $officeIds);
                    }
                }
            });
        }
 
         if ($request->filled('application_no')) {
             $query->where('application_no', 'like', '%' . $request->input('application_no') . '%');
         }
 
        if ($request->filled('uid')) {
            $query->where('uid', 'like', '%' . $request->input('uid') . '%');
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $allowedSort = ['created_at', 'application_no', 'uid', 'status'];
        if (!in_array($sortBy, $allowedSort, true)) $sortBy = 'created_at';
        if (!in_array(strtolower($sortOrder), ['asc', 'desc'], true)) $sortOrder = 'desc';

        $applications = $query->orderBy($sortBy, $sortOrder)->paginate(10, [
            'id',
            'application_no',
            'ref_code',
            'application_type',
            'created_at',
            'status',
            'current_with',
            'movement_history',
            'initiator_role',
            'initiator_completed',
            'second_party_completed',
            'uid',
            'landlord_user_id',
            'tenant_user_id',
        ]);

        return response()->json($applications);
    }

    public function receipt(Request $request, TenancyApplication $tenancyApplication)
    {
        $tenancyApplication->load('office');
        $html = view('tenancy.receipt', [
            'application' => $tenancyApplication,
            'print' => $request->boolean('print'),
        ])->render();

        if ($request->query('format') === 'pdf' && class_exists('Dompdf\\Dompdf')) {
            $dompdf = new \Dompdf\Dompdf();
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4');
            $dompdf->render();
            $disposition = $request->boolean('download') ? 'attachment' : 'inline';
            return response($dompdf->output(), 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', $disposition . '; filename="receipt-' . $tenancyApplication->application_no . '.pdf"');
        }

        return response($html, 200)->header('Content-Type', 'text/html');
    }

    public function applicationDetails(Request $request, TenancyApplication $tenancyApplication)
    {
        $tenancyApplication->load('office');
        $html = view('tenancy.application-details', [
            'application' => $tenancyApplication,
            'print' => $request->boolean('print'),
        ])->render();

        if ($request->query('format') === 'pdf' && class_exists('Dompdf\\Dompdf')) {
            $dompdf = new \Dompdf\Dompdf();
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4');
            $dompdf->render();
            $applicationPdf = $dompdf->output();
            $pdfOutput = $applicationPdf;

            $agreementPath = $this->getAgreementPdfPath($tenancyApplication);
            if ($agreementPath && class_exists('\\setasign\\Fpdi\\Fpdi')) {
                $mergedOutput = $this->mergePdfFiles($applicationPdf, $agreementPath);
                if ($mergedOutput) {
                    $pdfOutput = $mergedOutput;
                }
            }

            $disposition = $request->boolean('download') ? 'attachment' : 'inline';
            return response($pdfOutput, 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', $disposition . '; filename="application-' . $tenancyApplication->application_no . '.pdf"');
        }

        return response($html, 200)->header('Content-Type', 'text/html');
    }

    private function storeUpload(Request $request, string $key, string $path): ?string
    {
        if (!$request->hasFile($key)) {
            return null;
        }

        return $request->file($key)->store($path, 'public');
    }

    private function getAgreementPdfPath(TenancyApplication $application): ?string
    {
        if (empty($application->agreement_pdf_path)) {
            return null;
        }

        try {
            $path = Storage::disk('public')->path($application->agreement_pdf_path);
            if (!is_file($path)) {
                return null;
            }

            $extension = strtolower((string) pathinfo($path, PATHINFO_EXTENSION));
            return $extension === 'pdf' ? $path : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function mergePdfFiles(string $primaryPdfContents, string $agreementPdfPath): ?string
    {
        $tempPrimaryPath = tempnam(sys_get_temp_dir(), 'tenancy-app-');
        if ($tempPrimaryPath === false) {
            return null;
        }

        try {
            file_put_contents($tempPrimaryPath, $primaryPdfContents);

            $pdf = new \setasign\Fpdi\Fpdi();
            foreach ([$tempPrimaryPath, $agreementPdfPath] as $pdfPath) {
                $pageCount = $pdf->setSourceFile($pdfPath);
                for ($page = 1; $page <= $pageCount; $page++) {
                    $template = $pdf->importPage($page);
                    $size = $pdf->getTemplateSize($template);
                    $orientation = ($size['width'] > $size['height']) ? 'L' : 'P';
                    $pdf->AddPage($orientation, [$size['width'], $size['height']]);
                    $pdf->useTemplate($template);
                }
            }

            return $pdf->Output('S');
        } catch (\Throwable $e) {
            return null;
        } finally {
            if (is_file($tempPrimaryPath)) {
                @unlink($tempPrimaryPath);
            }
        }
    }

    private function userCanAccess($user, TenancyApplication $application): bool
    {
        // Check landlord/tenant user ID match
        if ($application->landlord_user_id && (int) $application->landlord_user_id === (int) $user->id) {
            return true;
        }
        if ($application->tenant_user_id && (int) $application->tenant_user_id === (int) $user->id) {
            return true;
        }

        if ($application->landlord_phone === $user->phone || $application->tenant_phone === $user->phone) {
            return true;
        }

        if ($user->email && ($application->landlord_email === $user->email || $application->tenant_email === $user->email)) {
            return true;
        }

        if ($application->user_id === $user->id) {
            return true;
        }

        if (!empty($user->office_id) && (int) $application->office_id === (int) $user->office_id) {
            return true;
        }

        $staffRoles = [User::ROLE_DIRECTOR, User::ROLE_ASSISTANT_DIRECTOR, User::ROLE_DISTRICT_HEAD, User::ROLE_DISTRICT_ASSISTANT];
        if (in_array($user->role, $staffRoles, true) && !empty($user->district_id) && !empty($application->office_id)) {
            $office = Office::find($application->office_id);
            return $office && (int) $office->district_id === (int) $user->district_id;
        }

        return false;
    }
}
