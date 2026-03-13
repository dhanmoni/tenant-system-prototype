<?php

namespace App\Http\Controllers;

use App\Models\Designation;
use App\Models\District;
use App\Models\Office;
use App\Models\Role;
use App\Models\State;
use App\Models\TenancyApplication;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Dashboard statistics for system admin (counts only).
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'system_admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $applicationsByStatus = TenancyApplication::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return response()->json([
            'states_count' => State::count(),
            'districts_count' => District::count(),
            'offices_count' => Office::count(),
            'users_count' => User::count(),
            'roles_count' => Role::count(),
            'designations_count' => Designation::count(),
            'applications_count' => TenancyApplication::count(),
            'applications_by_status' => $applicationsByStatus,
        ]);
    }

    /**
     * Dashboard statistics for staff (counts + applications scoped by user/office).
     */
    public function staffStats(Request $request)
    {
        $user = $request->user();
        $staffRoles = ['director', 'assistant_director', 'district_head', 'district_assistant'];
        if (!$user || !in_array($user->role, $staffRoles, true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $appQuery = TenancyApplication::query();
        if ($user->profile_type === 'landlord') {
            $appQuery->where('landlord_email', $user->email);
        } elseif ($user->profile_type === 'tenant') {
            $appQuery->where('tenant_email', $user->email);
        } else {
            $appQuery->where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
                if (!empty($user->office_id)) {
                    $q->orWhere('office_id', $user->office_id);
                }
            });
        }

        $applicationsByStatus = (clone $appQuery)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return response()->json([
            'states_count' => State::count(),
            'districts_count' => District::count(),
            'users_count' => User::count(),
            'applications_count' => (clone $appQuery)->count(),
            'applications_by_status' => $applicationsByStatus,
        ]);
    }
}
