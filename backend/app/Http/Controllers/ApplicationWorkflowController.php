<?php

namespace App\Http\Controllers;

use App\Models\RentRevisionApplication;
use App\Http\Resources\ApplicationResource;
use App\Models\OtherChargesRevisionApplication;
use App\Models\ValuerAppointmentApplication;
use App\Models\RentCourtPossessionApplication;
use App\Models\RentCourtFilingApplication;
use App\Models\RentAuthorityFilingApplication;
use App\Models\RentCourtAppealApplication;
use App\Models\RentTribunalAppealApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Constants\Roles;
use App\Constants\Status;
use App\Constants\ApplicationTypes;


class ApplicationWorkflowController extends Controller
{
    protected function getModel($type)
    {
        return match ($type) {
            ApplicationTypes::RENT_REVISION => RentRevisionApplication::class,
            ApplicationTypes::OTHER_CHARGES_REVISION => OtherChargesRevisionApplication::class,
            ApplicationTypes::VALUER_APPOINTMENT => ValuerAppointmentApplication::class,
            ApplicationTypes::RENT_COURT_POSSESSION => RentCourtPossessionApplication::class,
            ApplicationTypes::RENT_COURT_FILING => RentCourtFilingApplication::class,
            ApplicationTypes::RENT_AUTHORITY_FILING => RentAuthorityFilingApplication::class,
            ApplicationTypes::RENT_COURT_APPEAL => RentCourtAppealApplication::class,
            ApplicationTypes::RENT_TRIBUNAL_APPEAL => RentTribunalAppealApplication::class,
            ApplicationTypes::TENANCY_CERTIFICATE => \App\Models\TenancyApplication::class,
            default => null,
        };
    }

    public function inbox(Request $request)
    {
        $user = $request->user();
        if (!$user->isAssistant()) {
            return response()->json(['message' => 'Only assistants can access the inbox'], 403);
        }

        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 15);

        $districtId = $user->district_id;
        if (!$districtId) {
            return response()->json(['message' => 'User not assigned to a district'], 403);
        }

        // Determine which types of applications this assistant handles
        $targetRole = match ($user->role) {
            Roles::RA_ASSISTANT => Roles::RENT_AUTHORITY,
            Roles::RC_ASSISTANT => Roles::RENT_COURT,
            Roles::RT_ASSISTANT => Roles::RENT_TRIBUNAL,
            default => null,
        };

        if (!$targetRole) {
            return response()->json(['message' => 'Invalid role'], 403);
        }

        // Filter types based on role
        $types = match ($targetRole) {
            Roles::RENT_AUTHORITY => [ApplicationTypes::RENT_AUTHORITY_FILING, ApplicationTypes::RENT_REVISION, ApplicationTypes::OTHER_CHARGES_REVISION, ApplicationTypes::VALUER_APPOINTMENT],
            Roles::RENT_COURT => [ApplicationTypes::RENT_COURT_FILING, ApplicationTypes::RENT_COURT_POSSESSION, ApplicationTypes::RENT_COURT_APPEAL],
            Roles::RENT_TRIBUNAL => [ApplicationTypes::RENT_TRIBUNAL_APPEAL],
            default => [],
        };

        $allApplications = [];
        foreach ($types as $type) {
            $modelClass = $this->getModel($type);
            if ($modelClass) {
                $apps = $modelClass::where('district_id', $districtId)
                    ->where('status', Status::SUBMITTED)
                    ->with(['user', 'district'])
                    ->get()
                    ->map(function ($app) use ($type) {
                        $app->form_type = $type;
                        return $app;
                    });
                $resourceArray = ApplicationResource::collection($apps)->toArray($request);
                $allApplications = array_merge($allApplications, $resourceArray);
            }
        }

        usort($allApplications, function ($a, $b) {
            $timeDiff = strtotime($b['created_at'] ?? 0) - strtotime($a['created_at'] ?? 0);
            if ($timeDiff === 0) {
                return strcmp($b['application_no'] ?? '', $a['application_no'] ?? '');
            }
            return $timeDiff;
        });

        $total = count($allApplications);
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = max(1, min($page, $lastPage));
        $offset = ($page - 1) * $perPage;
        $paginatedItems = array_slice($allApplications, $offset, $perPage);

        return response()->json([
            'applications' => $paginatedItems,
            'pagination' => [
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
            ],
        ]);
    }

    public function forward(Request $request, $type, $id)
    {
        $user = $request->user();
        if (!$user->isAssistant()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $modelClass = $this->getModel($type);
        if (!$modelClass) return response()->json(['message' => 'Invalid form type'], 400);

        $application = $modelClass::find($id);
        if (!$application) return response()->json(['message' => 'Application not found'], 404);

        if ($application->district_id !== $user->district_id) {
            return response()->json(['message' => 'Application outside district'], 403);
        }

        $targetRole = match ($user->role) {
            Roles::RA_ASSISTANT => Roles::RENT_AUTHORITY,
            Roles::RC_ASSISTANT => Roles::RENT_COURT,
            Roles::RT_ASSISTANT => Roles::RENT_TRIBUNAL,
            default => null,
        };

        $application->update([
            'status' => Status::IN_REVIEW,
            'forwarded_at' => Carbon::now(),
            'forwarded_by_user_id' => $user->id,
            'assigned_to_role' => $targetRole,
        ]);

        return response()->json(['message' => 'Application moved to review successfully', 'application' => $application]);
    }

    public function reject(Request $request, $type, $id)
    {
        $user = $request->user();
        $allowedRoles = Roles::allStaff();
        if (!in_array($user->role, $allowedRoles)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $modelClass = $this->getModel($type);
        if (!$modelClass) return response()->json(['message' => 'Invalid form type'], 400);

        $application = $modelClass::find($id);
        if (!$application) return response()->json(['message' => 'Application not found'], 404);

        if ($application->district_id !== $user->district_id) {
            return response()->json(['message' => 'Application outside district'], 403);
        }

        $application->update([
            'status' => Status::REJECTED,
            'rejected_at' => Carbon::now(),
            'rejected_by_user_id' => $user->id,
            'rejection_message' => $request->message,
            'assigned_to_role' => null,
        ]);

        return response()->json(['message' => 'Application rejected successfully', 'application' => $application]);
    }

    public function approve(Request $request, $type, $id)
    {
        $user = $request->user();
        $allowedRoles = Roles::principals();
        if (!in_array($user->role, $allowedRoles)) {
            return response()->json(['message' => 'Only principal officers can approve applications'], 403);
        }

        $modelClass = $this->getModel($type);
        if (!$modelClass) return response()->json(['message' => 'Invalid form type'], 400);

        $application = $modelClass::find($id);
        if (!$application) return response()->json(['message' => 'Application not found'], 404);

        if ($application->district_id !== $user->district_id) {
            return response()->json(['message' => 'Application outside district'], 403);
        }

        $application->update([
            'status' => Status::COMPLETED,
            'approved_at' => Carbon::now(),
            'approved_by_user_id' => $user->id,
            'assigned_to_role' => null,
        ]);

        return response()->json(['message' => 'Application approved successfully', 'application' => $application]);
    }

    public function principalInbox(Request $request)
    {
        $user = $request->user();
        $allowedRoles = Roles::principals();
        if (!in_array($user->role, $allowedRoles)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 15);

        $districtId = $user->district_id;
        $types = match ($user->role) {
            Roles::RENT_AUTHORITY => [ApplicationTypes::RENT_AUTHORITY_FILING, ApplicationTypes::RENT_REVISION, ApplicationTypes::OTHER_CHARGES_REVISION, ApplicationTypes::VALUER_APPOINTMENT],
            Roles::RENT_COURT => [ApplicationTypes::RENT_COURT_FILING, ApplicationTypes::RENT_COURT_POSSESSION, ApplicationTypes::RENT_COURT_APPEAL],
            Roles::RENT_TRIBUNAL => [ApplicationTypes::RENT_TRIBUNAL_APPEAL],
            default => [],
        };

        $allApplications = [];
        foreach ($types as $type) {
            $modelClass = $this->getModel($type);
            if ($modelClass) {
                $apps = $modelClass::where('district_id', $districtId)
                    ->where('status', Status::IN_REVIEW)
                    ->with(['user', 'forwardedBy', 'district'])
                    ->get()
                    ->map(function ($app) use ($type) {
                        $app->form_type = $type;
                        return $app;
                    });
                $resourceArray = ApplicationResource::collection($apps)->toArray($request);
                $allApplications = array_merge($allApplications, $resourceArray);
            }
        }

        usort($allApplications, function ($a, $b) {
            $timeDiff = strtotime($b['created_at'] ?? 0) - strtotime($a['created_at'] ?? 0);
            if ($timeDiff === 0) {
                return strcmp($b['application_no'] ?? '', $a['application_no'] ?? '');
            }
            return $timeDiff;
        });

        $total = count($allApplications);
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = max(1, min($page, $lastPage));
        $offset = ($page - 1) * $perPage;
        $paginatedItems = array_slice($allApplications, $offset, $perPage);

        return response()->json([
            'applications' => $paginatedItems,
            'pagination' => [
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
            ],
        ]);
    }

    public function allApplications(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, [Roles::SUPER_ADMIN, Roles::DISTRICT_ADMIN])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 15);

        $districtId = $user->district_id;
        $types = [ApplicationTypes::RENT_AUTHORITY_FILING, ApplicationTypes::RENT_REVISION, ApplicationTypes::OTHER_CHARGES_REVISION, ApplicationTypes::VALUER_APPOINTMENT, ApplicationTypes::RENT_COURT_FILING, ApplicationTypes::RENT_COURT_POSSESSION, ApplicationTypes::RENT_COURT_APPEAL, ApplicationTypes::RENT_TRIBUNAL_APPEAL, ApplicationTypes::TENANCY_CERTIFICATE];

        $allApplications = [];
        foreach ($types as $type) {
            $modelClass = $this->getModel($type);
            if ($modelClass) {
                $relations = ['district'];
                if ($type !== ApplicationTypes::TENANCY_CERTIFICATE) {
                    $relations = ['user', 'forwardedBy', 'district'];
                }
                $query = $modelClass::with($relations);
                if ($user->role === Roles::DISTRICT_ADMIN) {
                    $query->where('district_id', $districtId);
                }
                $apps = $query->get()->map(function ($app) use ($type) {
                    $app->form_type = $type;
                    return $app;
                });
                $resourceArray = ApplicationResource::collection($apps)->toArray($request);
                $allApplications = array_merge($allApplications, $resourceArray);
            }
        }

        usort($allApplications, function ($a, $b) {
            $timeDiff = strtotime($b['created_at'] ?? 0) - strtotime($a['created_at'] ?? 0);
            if ($timeDiff === 0) {
                return strcmp($b['application_no'] ?? '', $a['application_no'] ?? '');
            }
            return $timeDiff;
        });

        $total = count($allApplications);
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = max(1, min($page, $lastPage));
        $offset = ($page - 1) * $perPage;
        $paginatedItems = array_slice($allApplications, $offset, $perPage);

        return response()->json([
            'applications' => $paginatedItems,
            'pagination' => [
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
            ],
        ]);
    }

    public function show(Request $request, $type, $id)
    {
        $user = $request->user();
        $modelClass = $this->getModel($type);
        if (!$modelClass) return response()->json(['message' => 'Invalid form type'], 400);

        $application = $modelClass::with(['user', 'forwardedBy', 'district'])->find($id);
        if (!$application) return response()->json(['message' => 'Application not found'], 404);

        // Permissions: Super Admin, District Admin (same district), or designated Head/Assistant
        if (!in_array($user->role, [Roles::SUPER_ADMIN])) {
            if ($user->district_id && $application->district_id !== $user->district_id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        return response()->json(['application' => new ApplicationResource($application)]);
    }

    public function showByApplicationNo(Request $request, $applicationNo)
    {
        $user = $request->user();
        $types = [ApplicationTypes::RENT_AUTHORITY_FILING, ApplicationTypes::RENT_REVISION, ApplicationTypes::OTHER_CHARGES_REVISION, ApplicationTypes::VALUER_APPOINTMENT, ApplicationTypes::RENT_COURT_FILING, ApplicationTypes::RENT_COURT_POSSESSION, ApplicationTypes::RENT_COURT_APPEAL, ApplicationTypes::RENT_TRIBUNAL_APPEAL, ApplicationTypes::TENANCY_CERTIFICATE];

        $application = null;
        $foundType = null;

        foreach ($types as $type) {
            $modelClass = $this->getModel($type);
            if ($modelClass) {
                $relations = ['district'];
                if ($type !== ApplicationTypes::TENANCY_CERTIFICATE) {
                    $relations = ['user', 'forwardedBy', 'district'];
                }
                $application = $modelClass::with($relations)->where('application_no', $applicationNo)->first();
                if ($application) {
                    $foundType = $type;
                    break;
                }
            }
        }

        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        // Permissions check (same as in show)
        if (!in_array($user->role, [Roles::SUPER_ADMIN])) {
            if ($user->district_id && $application->district_id !== $user->district_id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        // Add form_type to the response so the frontend knows what it is
        $application->form_type = $foundType;

        return response()->json(['application' => new ApplicationResource($application)]);
    }
}
