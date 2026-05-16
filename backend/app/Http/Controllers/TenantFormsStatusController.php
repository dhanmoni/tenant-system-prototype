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
        $perPage = 10;

        $applicationNo = $request->input('application_no');
        $uid = $request->input('uid');

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = strtolower((string) $request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSort = ['created_at', 'application_no', 'uid', 'status'];
        if (!in_array($sortBy, $allowedSort, true)) {
            $sortBy = 'created_at';
        }

        $tenancyMax = 200;
        $formsMax = 200;

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
                'created_at',
                'status',
                'current_with',
                'initiator_role',
                'initiator_completed',
                'second_party_completed',
                'uid',
                'landlord_phone',
                'tenant_phone',
            ]);

        $items = [];
        foreach ($tenancyApps as $app) {
            $items[] = [
                'id' => $app->id,
                'source_type' => 'tenancy',
                'row_key' => 'tenancy-' . $app->id,
                'application_no' => $app->application_no,
                'uid' => $app->uid ?? '-',
                'created_at' => optional($app->created_at)->toDateTimeString(),
                'status' => $app->status,
                'application_type' => $app->application_type ?: 'Tenancy Certificate',
                'current_with' => $app->current_with ?? '-',
                'initiator_role' => $app->initiator_role ?? null,
                'initiator_completed' => (bool) $app->initiator_completed,
                'second_party_completed' => (bool) $app->second_party_completed,
                'ref_code' => $app->ref_code ?? null,
                'landlord_phone' => $app->landlord_phone ?? null,
                'tenant_phone' => $app->tenant_phone ?? null,
            ];
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
                ->get(['id', 'application_no', 'created_at', 'status', 'tenancy_uin']);

            foreach ($records as $record) {
                $items[] = [
                    'id' => $record->id,
                    'source_type' => 'form',
                    'form_key' => $key,
                    'row_key' => 'form-' . $key . '-' . $record->id,
                    'application_no' => $record->application_no,
                    'uid' => $record->tenancy_uin ?? '-',
                    'created_at' => optional($record->created_at)->toDateTimeString(),
                    'status' => $record->status,
                    'application_type' => $meta['label'],
                    'current_with' => '-',
                    'initiator_role' => null,
                    // Frontend uses tenancy completion logic; these are just safe defaults.
                    'initiator_completed' => true,
                    'second_party_completed' => true,
                ];
            }
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

        \Log::info('TenantFormsStatusController response data: ' . json_encode($pageItems));
        return response()->json([
            'data' => $pageItems,
            'current_page' => $page,
            'last_page' => $lastPage,
            'total' => $total,
        ]);
    }
}


