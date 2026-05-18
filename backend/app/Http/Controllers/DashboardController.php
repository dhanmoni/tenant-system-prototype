<?php

namespace App\Http\Controllers;

use App\Models\Designation;
use App\Models\District;
use App\Models\Office;
use App\Models\Role;
use App\Models\State;
use App\Models\TenancyApplication;
use App\Models\User;
use App\Constants\Roles;
use App\Constants\Status;
use App\Models\RentRevisionApplication;
use App\Models\OtherChargesRevisionApplication;
use App\Models\ValuerAppointmentApplication;
use App\Models\RentCourtPossessionApplication;
use App\Models\RentCourtFilingApplication;
use App\Models\RentAuthorityFilingApplication;
use App\Models\RentCourtAppealApplication;
use App\Models\RentTribunalAppealApplication;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Dashboard statistics for system admin (counts only).
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== Roles::SUPER_ADMIN) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'districts_count' => District::count(),
            'users_count' => User::count(),
            'tenancy_applications' => TenancyApplication::count(),
            'service_applications' => 
                RentRevisionApplication::count() +
                OtherChargesRevisionApplication::count() +
                ValuerAppointmentApplication::count() +
                RentCourtPossessionApplication::count() +
                RentCourtFilingApplication::count() +
                RentAuthorityFilingApplication::count() +
                RentCourtAppealApplication::count() +
                RentTribunalAppealApplication::count(),
        ]);
    }

    public function staffStats(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role === Roles::USER) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $districtId = $user->district_id;
        
        $stats = [
            'users_in_district' => User::where('district_id', $districtId)->count(),
        ];

        if ($user->role === Roles::DISTRICT_ADMIN) {
            $stats['total_applications_district'] = TenancyApplication::where('district_id', $districtId)->count();
        }

        // Add pending review count for assistants
        if ($user->isAssistant()) {
            $targetRole = match ($user->role) {
                Roles::RA_ASSISTANT => Roles::RENT_AUTHORITY,
                Roles::RC_ASSISTANT => Roles::RENT_COURT,
                Roles::RT_ASSISTANT => Roles::RENT_TRIBUNAL,
                default => null,
            };

            $types = match ($targetRole) {
                Roles::RENT_AUTHORITY => [RentAuthorityFilingApplication::class, RentRevisionApplication::class, OtherChargesRevisionApplication::class, ValuerAppointmentApplication::class],
                Roles::RENT_COURT => [RentCourtFilingApplication::class, RentCourtPossessionApplication::class, RentCourtAppealApplication::class],
                Roles::RENT_TRIBUNAL => [RentTribunalAppealApplication::class],
                default => [],
            };

            $pending = 0;
            foreach ($types as $modelClass) {
                $pending += $modelClass::where('district_id', $districtId)->where('status', Status::SUBMITTED)->count();
            }
            $stats['pending_review'] = $pending;
        }

        return response()->json($stats);
    }
}
