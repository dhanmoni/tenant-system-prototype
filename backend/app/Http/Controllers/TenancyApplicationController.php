<?php

namespace App\Http\Controllers;

use App\Models\TenancyApplication;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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

        $tenancyApplication->load('office');

        return response()->json(['application' => $tenancyApplication]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'registration_date' => ['required', 'date'],
            'office_id' => ['nullable', 'integer', 'exists:offices,id'],
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

        $application = DB::transaction(function () use ($data, $request) {
            $now = Carbon::now();
            $prefix = 'APP-TC-' . $now->format('Ym');

            $latest = TenancyApplication::where('application_no', 'like', $prefix . '-%')
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

            $status = 'Under process';
            $currentWith = 'Rent Authority';
            $movement = [[
                'status' => $status,
                'current_with' => $currentWith,
                'moved_at' => $now->toDateTimeString(),
            ]];

            return TenancyApplication::create(array_merge($data, $paths, [
                'application_no' => $applicationNo,
                'user_id' => $request->user() ? $request->user()->id : null,
                'application_type' => 'Tenancy Certificate',
                'status' => $status,
                'current_with' => $currentWith,
                'movement_history' => $movement,
            ]));
        });

        return response()->json([
            'id' => $application->id,
            'application_no' => $application->application_no,
            'submitted_at' => $application->created_at->toDateTimeString(),
            'application' => $application,
        ], 201);
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
            'registration_date' => ['required', 'date'],
            'office_id' => ['nullable', 'integer', 'exists:offices,id'],
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

        if ($user->profile_type === 'landlord') {
            $query->where('landlord_email', $user->email);
        } elseif ($user->profile_type === 'tenant') {
            $query->where('tenant_email', $user->email);
        } else {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
                if (!empty($user->office_id)) {
                    $q->orWhere('office_id', $user->office_id);
                }
            });
        }

        $applications = $query->orderByDesc('created_at')->paginate(10, [
            'id',
            'application_no',
            'application_type',
            'created_at',
            'status',
            'current_with',
            'movement_history',
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

            // If FPDI is available, append all agreement PDF pages after the application details pages.
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
        if ($user->profile_type === 'landlord') {
            return $application->landlord_email === $user->email;
        }
        if ($user->profile_type === 'tenant') {
            return $application->tenant_email === $user->email;
        }

        if ($application->user_id === $user->id) {
            return true;
        }

        return !empty($user->office_id) && (int) $application->office_id === (int) $user->office_id;
    }
}
