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
