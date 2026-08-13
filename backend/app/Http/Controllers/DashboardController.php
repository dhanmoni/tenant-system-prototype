<?php

namespace App\Http\Controllers;

use App\Constants\Roles;
use App\Services\DashboardStatsService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardStatsService $dashboardStats
    ) {
    }

    /**
     * Public transparency totals (no personal data). Cached briefly.
     */
    public function publicStats()
    {
        $stats = cache()->remember('public_portal_stats', 60, fn () => $this->dashboardStats->publicPortalStats());

        return response()->json($stats);
    }

    /**
     * Dashboard statistics for system admin.
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== Roles::SUPER_ADMIN) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($this->dashboardStats->superAdminStats());
    }

    /**
     * District application counts for the Assam map, optionally filtered by created_at range.
     * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD (omit both for all-time).
     * Super admin: all districts. District admin: own district only.
     */
    public function districtBreakdown(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $onlyDistrictId = null;
        if ($user->role === Roles::SUPER_ADMIN) {
            $onlyDistrictId = null;
        } elseif ($user->role === Roles::DISTRICT_ADMIN) {
            if (!$user->district_id) {
                return response()->json([
                    'message' => 'Your account is not assigned to a district. Contact the system administrator.',
                ], 422);
            }
            $onlyDistrictId = (int) $user->district_id;
        } else {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $from = $request->query('from');
        $to = $request->query('to');
        if (($from && !is_string($from)) || ($to && !is_string($to))) {
            return response()->json(['message' => 'Invalid date range'], 422);
        }
        if ($from && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) {
            return response()->json(['message' => 'Invalid from date'], 422);
        }
        if ($to && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)) {
            return response()->json(['message' => 'Invalid to date'], 422);
        }

        $breakdown = $this->dashboardStats->districtBreakdown(
            $onlyDistrictId,
            null,
            $from ?: null,
            $to ?: null
        );

        return response()->json([
            'from' => $from ?: null,
            'to' => $to ?: null,
            'district_breakdown' => $breakdown,
            'total_applications' => array_sum(array_column($breakdown, 'total_applications')),
            'tenancy_applications' => array_sum(array_column($breakdown, 'tenancy_applications')),
            'service_applications' => array_sum(array_column($breakdown, 'service_applications')),
        ]);
    }

    /**
     * Dashboard statistics for officials and district administrators.
     */
    public function staffStats(Request $request)
    {
        $user = $request->user()->load('district');
        if (!$user || $user->role === Roles::USER) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!$user->district_id && $user->role !== Roles::SUPER_ADMIN) {
            return response()->json([
                'message' => 'Your account is not assigned to a district. Contact the system administrator.',
            ], 422);
        }

        return response()->json($this->dashboardStats->staffStats($user));
    }
}
