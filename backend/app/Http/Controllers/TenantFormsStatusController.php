<?php

namespace App\Http\Controllers;

use App\Models\TenancyApplication;
use App\Models\RentRevisionApplication;
use App\Models\OtherChargesRevisionApplication;
use App\Models\ValuerAppointmentApplication;
use App\Models\RentCourtPossessionApplication;
use App\Models\RentCourtFilingApplication;
use App\Models\RentAuthorityFilingApplication;
use App\Models\RentCourtAppealApplication;
use App\Models\RentTribunalAppealApplication;
use Illuminate\Http\Request;
use App\Constants\ApplicationTypes;
use App\Constants\Status;
use Carbon\Carbon;

class TenantFormsStatusController extends Controller
{
    public function my(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // This endpoint is only used by the tenant user status page.
        if (($user->role ?? null) !== 'user') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $page = (int) $request->input('page', 1);
        $page = max(1, $page);
        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(1, min(100, $perPage));

        $applicationNo = $request->input('application_no');
        $uid = $request->input('uid');
        $typeFilter = strtolower((string) $request->input('type', 'all'));
        $statusFilter = strtolower((string) $request->input('status_filter', 'all'));

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = strtolower((string) $request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSort = ['created_at', 'application_no', 'uid', 'status'];
        if (!in_array($sortBy, $allowedSort, true)) {
            $sortBy = 'created_at';
        }

        $tenancyMax = 200;
        $formsMax = 200;

        $items = [];
        
        if (in_array($typeFilter, ['all', 'tenancy'])) {
            // Tenancy certificate applications
            $tenancyQuery = TenancyApplication::query()
                ->where(function ($q) use ($user) {
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

            if (!empty($applicationNo)) {
                $tenancyQuery->where('application_no', 'like', '%' . $applicationNo . '%');
            }

            if (!empty($uid)) {
                $tenancyQuery->where('uid', 'like', '%' . $uid . '%');
            }

            $tenancyApps = $tenancyQuery
                ->orderByDesc('created_at')
                ->limit($tenancyMax)
                ->get([
                    'id',
                    'application_no',
                    'ref_code',
                    'application_type',
                    'apply_type',
                    'created_at',
                    'updated_at',
                    'status',
                    'current_with',
                    'initiator_role',
                    'initiator_completed',
                    'second_party_completed',
                    'uid',
                    'wizard_step',
                    'movement_history',
                    'landlord_phone',
                    'tenant_phone',
                ]);

            foreach ($tenancyApps as $app) {
                $items[] = [
                    'id' => $app->id,
                    'source_type' => 'tenancy',
                    'row_key' => 'tenancy-' . $app->id,
                    'application_no' => $app->application_no,
                    'uid' => $app->uid ?? '-',
                    'created_at' => optional($app->created_at)->toDateTimeString(),
                    'updated_at' => optional($app->updated_at)->toDateTimeString(),
                    'status' => $app->status,
                    'application_type' => $app->application_type ?: 'Tenancy Certificate',
                    'apply_type' => $app->apply_type ?? null,
                    'current_with' => $app->current_with ?: ($app->assigned_to_role ?? '-'),
                    'assigned_to_role' => $app->assigned_to_role ?? null,
                    'forwarded_at' => optional($app->forwarded_at)->toDateTimeString(),
                    'approved_at' => optional($app->approved_at)->toDateTimeString(),
                    'rejected_at' => optional($app->rejected_at)->toDateTimeString(),
                    'rejection_message' => $app->rejection_message ?? null,
                    'approval_message' => $app->approval_message ?? null,
                    'forward_remarks' => $app->forward_remarks ?? null,
                    'initiator_role' => $app->initiator_role ?? null,
                    'initiator_completed' => (bool) $app->initiator_completed,
                    'second_party_completed' => (bool) $app->second_party_completed,
                    'wizard_step' => $app->wizard_step ?? null,
                    'movement_history' => $app->movement_history ?? [],
                    'ref_code' => $app->ref_code ?? null,
                    'landlord_phone' => $app->landlord_phone ?? null,
                    'tenant_phone' => $app->tenant_phone ?? null,
                ];
            }
        }

        // Other Assam Tenancy Rules draft forms (user only)
        $formTables = [
            ApplicationTypes::RENT_REVISION => [
                'model' => RentRevisionApplication::class,
                'label' => 'Form-I: Rent revision / fixation of rent',
            ],
            ApplicationTypes::OTHER_CHARGES_REVISION => [
                'model' => OtherChargesRevisionApplication::class,
                'label' => 'Form-I-A: Revision of other charges',
            ],
            ApplicationTypes::VALUER_APPOINTMENT => [
                'model' => ValuerAppointmentApplication::class,
                'label' => 'Form-I-B: Valuer appointment',
            ],
            ApplicationTypes::RENT_COURT_POSSESSION => [
                'model' => RentCourtPossessionApplication::class,
                'label' => 'Form-II: Before the Rent Court for recovery of possession',
            ],
            ApplicationTypes::RENT_COURT_FILING => [
                'model' => RentCourtFilingApplication::class,
                'label' => 'Form-III: Filed before the Rent Court',
            ],
            ApplicationTypes::RENT_AUTHORITY_FILING => [
                'model' => RentAuthorityFilingApplication::class,
                'label' => 'Form-IV: Filed before the Rent Authority',
            ],
            ApplicationTypes::RENT_COURT_APPEAL => [
                'model' => RentCourtAppealApplication::class,
                'label' => 'Form-V: Appeal before the Rent Court',
            ],
            ApplicationTypes::RENT_TRIBUNAL_APPEAL => [
                'model' => RentTribunalAppealApplication::class,
                'label' => 'Form-VI: Appeal before the Rent Tribunal',
            ],
        ];

        if (in_array($typeFilter, ['all', 'service'])) {
            foreach ($formTables as $key => $meta) {
                /** @var \Illuminate\Database\Eloquent\Model $model */
                $model = $meta['model'];

                $query = $model::query()
                    ->where('user_id', $user->id);

                if (!empty($applicationNo)) {
                    $query->where('application_no', 'like', '%' . $applicationNo . '%');
                }

                $records = $query
                    ->orderByDesc('created_at')
                    ->limit($formsMax)
                    ->get([
                        'id',
                        'application_no',
                        'created_at',
                        'updated_at',
                        'status',
                        'tenancy_uin',
                        'assigned_to_role',
                        'forwarded_at',
                        'approved_at',
                        'rejected_at',
                        'rejection_message',
                        'approval_message',
                    ]);

                foreach ($records as $record) {
                    $items[] = [
                        'id' => $record->id,
                        'source_type' => 'form',
                        'form_key' => $key,
                        'form_type' => $key,
                        'row_key' => 'form-' . $key . '-' . $record->id,
                        'application_no' => $record->application_no,
                        'uid' => $record->tenancy_uin ?? '-',
                        'created_at' => optional($record->created_at)->toDateTimeString(),
                        'updated_at' => optional($record->updated_at)->toDateTimeString(),
                        'status' => $record->status,
                        'application_type' => $meta['label'],
                        'current_with' => $record->assigned_to_role ?? '-',
                        'assigned_to_role' => $record->assigned_to_role ?? null,
                        'forwarded_at' => optional($record->forwarded_at)->toDateTimeString(),
                        'approved_at' => optional($record->approved_at)->toDateTimeString(),
                        'rejected_at' => optional($record->rejected_at)->toDateTimeString(),
                        'rejection_message' => $record->rejection_message ?? null,
                        'approval_message' => $record->approval_message ?? null,
                        'initiator_role' => null,
                        // Frontend uses tenancy completion logic; these are just safe defaults.
                        'initiator_completed' => true,
                        'second_party_completed' => true,
                    ];
                }
            }
        }

        if ($statusFilter !== '' && $statusFilter !== 'all') {
            $items = array_values(array_filter(
                $items,
                fn ($i) => $this->matchesStatusFilter($i['status'] ?? null, $statusFilter)
            ));
        }

        // Apply unified sorting across the merged list.
        usort($items, function ($a, $b) use ($sortBy, $sortOrder) {
            $dir = $sortOrder === 'asc' ? 1 : -1;

            switch ($sortBy) {
                case 'application_no':
                    return $dir * strcasecmp((string) ($a['application_no'] ?? ''), (string) ($b['application_no'] ?? ''));
                case 'uid':
                    return $dir * strcasecmp((string) ($a['uid'] ?? ''), (string) ($b['uid'] ?? ''));
                case 'status':
                    return $dir * strcasecmp((string) ($a['status'] ?? ''), (string) ($b['status'] ?? ''));
                case 'created_at':
                default:
                    $ta = !empty($a['created_at']) ? strtotime($a['created_at']) : 0;
                    $tb = !empty($b['created_at']) ? strtotime($b['created_at']) : 0;
                    return $dir * ($ta <=> $tb);
            }
        });

        $total = count($items);
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min($page, $lastPage);
        $offset = ($page - 1) * $perPage;

        $pageItems = array_slice($items, $offset, $perPage);

        return response()->json([
            'data' => $pageItems,
            'current_page' => $page,
            'last_page' => $lastPage,
            'total' => $total,
        ]);
    }

    private function matchesStatusFilter(?string $status, string $filter): bool
    {
        $normalized = strtoupper(trim((string) $status));
        $filter = strtolower(trim($filter));

        return match ($filter) {
            'draft' => $normalized === 'DRAFT',
            'partial' => $normalized === 'PARTIAL',
            'submitted' => in_array($normalized, ['SUBMITTED', 'UNDER_PROCESS'], true),
            'in_review' => $normalized === 'IN_REVIEW',
            'approved' => in_array($normalized, ['APPROVED', 'COMPLETED'], true),
            'rejected' => $normalized === 'REJECTED',
            'withdrawn' => $normalized === 'WITHDRAWN',
            'pending' => in_array($normalized, ['PENDING', 'DRAFT', 'PARTIAL'], true),
            default => true,
        };
    }

    public function withdraw(Request $request, string $type, string $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $modelClass = match ($type) {
            ApplicationTypes::TENANCY_CERTIFICATE => TenancyApplication::class,
            ApplicationTypes::RENT_REVISION => RentRevisionApplication::class,
            ApplicationTypes::OTHER_CHARGES_REVISION => OtherChargesRevisionApplication::class,
            ApplicationTypes::VALUER_APPOINTMENT => ValuerAppointmentApplication::class,
            ApplicationTypes::RENT_COURT_POSSESSION => RentCourtPossessionApplication::class,
            ApplicationTypes::RENT_COURT_FILING => RentCourtFilingApplication::class,
            ApplicationTypes::RENT_AUTHORITY_FILING => RentAuthorityFilingApplication::class,
            ApplicationTypes::RENT_COURT_APPEAL => RentCourtAppealApplication::class,
            ApplicationTypes::RENT_TRIBUNAL_APPEAL => RentTribunalAppealApplication::class,
            default => null,
        };

        if (!$modelClass) {
            return response()->json(['message' => 'Invalid form type'], 400);
        }

        $application = $modelClass::find($id);
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        // Check ownership
        if ($type === ApplicationTypes::TENANCY_CERTIFICATE) {
            if ($application->user_id != $user->id && $application->landlord_user_id != $user->id && $application->tenant_user_id != $user->id && $application->landlord_phone !== $user->phone && $application->tenant_phone !== $user->phone) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        } else {
            if ($application->user_id != $user->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        if ($application->status !== Status::SUBMITTED) {
            return response()->json(['message' => 'Application cannot be withdrawn at this stage.'], 409);
        }

        $movement = $application->movement_history ?? [];
        $movement[] = [
            'status' => Status::WITHDRAWN,
            'current_with' => null,
            'moved_at' => Carbon::now()->toDateTimeString(),
            'action' => 'Application withdrawn by user.',
        ];

        $application->update([
            'status' => Status::WITHDRAWN,
            'movement_history' => $movement,
            'assigned_to_role' => null,
            'current_with' => null,
        ]);

        return response()->json(['message' => 'Application withdrawn successfully', 'application' => $application]);
    }
}


