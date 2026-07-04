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

    // Oldest first (created_at ASC), tie-broken by application_no so the order is stable
    // and identical between the list endpoints and the sequential-processing guard.
    protected static function compareFifo($a, $b)
    {
        $timeDiff = strtotime($a['created_at'] ?? 0) - strtotime($b['created_at'] ?? 0);
        if ($timeDiff === 0) {
            return strcmp($a['application_no'] ?? '', $b['application_no'] ?? '');
        }
        return $timeDiff;
    }

    // Service-form types handled by an assistant or principal of a given office.
    protected function getQueueTypesForUser($user)
    {
        return match ($user->role) {
            Roles::RA_ASSISTANT, Roles::RENT_AUTHORITY => [ApplicationTypes::RENT_AUTHORITY_FILING, ApplicationTypes::RENT_REVISION, ApplicationTypes::OTHER_CHARGES_REVISION, ApplicationTypes::VALUER_APPOINTMENT],
            Roles::RC_ASSISTANT, Roles::RENT_COURT => [ApplicationTypes::RENT_COURT_FILING, ApplicationTypes::RENT_COURT_POSSESSION, ApplicationTypes::RENT_COURT_APPEAL],
            Roles::RT_ASSISTANT, Roles::RENT_TRIBUNAL => [ApplicationTypes::RENT_TRIBUNAL_APPEAL],
            default => [],
        };
    }

    // Returns the single oldest pending application (FIFO head) for this officer's
    // district + queue, or null when the queue is empty.
    protected function getOldestPending($user, $status)
    {
        $types = $this->getQueueTypesForUser($user);
        $districtId = $user->district_id;
        $candidates = [];
        foreach ($types as $type) {
            $modelClass = $this->getModel($type);
            if (!$modelClass) continue;
            $app = $modelClass::where('district_id', $districtId)
                ->where('status', $status)
                ->orderBy('created_at', 'asc')
                ->orderBy('application_no', 'asc')
                ->first();
            if ($app) {
                $candidates[] = [
                    'type' => $type,
                    'id' => $app->id,
                    'created_at' => (string) $app->created_at,
                    'application_no' => $app->application_no,
                ];
            }
        }
        if (empty($candidates)) {
            return null;
        }
        usort($candidates, [self::class, 'compareFifo']);
        return $candidates[0];
    }

    // FIFO lock: an action is only allowed on the head of the queue.
    protected function isQueueHead($user, $status, $type, $id)
    {
        $oldest = $this->getOldestPending($user, $status);
        return $oldest && $oldest['type'] === $type && (int) $oldest['id'] === (int) $id;
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

        // FIFO: oldest submitted application first, so officers clear the queue in order.
        usort($allApplications, [self::class, 'compareFifo']);

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

        // FIFO: assistants must clear the oldest submitted application before the next.
        if (!$this->isQueueHead($user, Status::SUBMITTED, $type, $id)) {
            return response()->json([
                'message' => 'Please process the oldest pending application in the queue first.',
            ], 409);
        }

        $data = $request->validate([
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

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
            'forward_remarks' => $data['remarks'] ?? null,
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

        // FIFO: assistants/principals must act on the head of their queue first.
        // Admins (who can reject anything) are not subject to the queue lock.
        $isQueueRole = $user->isAssistant() || in_array($user->role, Roles::principals());
        if ($isQueueRole) {
            $pendingStatus = $user->isAssistant() ? Status::SUBMITTED : Status::IN_REVIEW;
            if (!$this->isQueueHead($user, $pendingStatus, $type, $id)) {
                return response()->json([
                    'message' => 'Please process the oldest pending application in the queue first.',
                ], 409);
            }
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

        // FIFO: principals must approve the oldest in-review application before the next.
        if (!$this->isQueueHead($user, Status::IN_REVIEW, $type, $id)) {
            return response()->json([
                'message' => 'Please process the oldest pending application in the queue first.',
            ], 409);
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

        // FIFO: oldest application awaiting review first.
        usort($allApplications, [self::class, 'compareFifo']);

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
        $search = trim((string) $request->input('search', ''));
        $statusFilter = $request->input('status');
        $formTypeFilter = $request->input('form_type');
        $districtFilter = $request->input('district_id');

        $districtId = $user->district_id;
        $types = ApplicationTypes::serviceForms();
        if ($formTypeFilter && in_array($formTypeFilter, $types, true)) {
            $types = [$formTypeFilter];
        }

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
                } elseif ($districtFilter) {
                    $query->where('district_id', (int) $districtFilter);
                }
                if ($statusFilter) {
                    $query->where('status', $statusFilter);
                }
                if ($search !== '') {
                    $query->where('application_no', 'like', '%' . $search . '%');
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

    public function update(Request $request, $type, $id)
    {
        $user = $request->user();
        if ($user->role !== Roles::SUPER_ADMIN) {
            return response()->json(['message' => 'Only super admins can edit applications'], 403);
        }

        $modelClass = $this->getModel($type);
        if (!$modelClass) {
            return response()->json(['message' => 'Invalid form type'], 400);
        }

        $application = $modelClass::find($id);
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        $protected = [
            'id',
            'application_no',
            'user_id',
            'status',
            'district_id',
            'forwarded_at',
            'forwarded_by_user_id',
            'rejected_at',
            'rejected_by_user_id',
            'rejection_message',
            'approved_at',
            'approved_by_user_id',
            'assigned_to_role',
            'ref_code',
            'wizard_step',
            'current_with',
            'initiator_role',
            'initiator_completed',
            'second_party_completed',
            'landlord_user_id',
            'tenant_user_id',
            'office_id',
            'village_ward_id',
            'application_type',
            'movement_history',
        ];

        $editable = array_values(array_filter(
            array_diff($application->getFillable(), $protected),
            fn (string $key) => !preg_match('/path|image|pdf|uin|_uid$/i', $key) && $key !== 'uid'
        ));

        $data = $request->only($editable);
        $application->update($data);

        $relations = ['district'];
        if ($type !== ApplicationTypes::TENANCY_CERTIFICATE) {
            $relations = ['user', 'forwardedBy', 'district'];
        }
        $application->load($relations);
        $application->form_type = $type;

        return response()->json([
            'message' => 'Application updated successfully',
            'application' => new ApplicationResource($application),
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

    public function superadminMove(Request $request, $type, $id)
    {
        $user = $request->user();
        if ($user->role !== Roles::SUPER_ADMIN) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'assigned_to_role' => 'nullable|string',
            'status' => 'required|string',
        ]);

        $modelClass = $this->getModel($type);
        if (!$modelClass) return response()->json(['message' => 'Invalid form type'], 400);

        $application = $modelClass::find($id);
        if (!$application) return response()->json(['message' => 'Application not found'], 404);

        // Determine the valid assistant/principal pair for this form type
        $validTransitions = $this->getValidTransitions($type);
        if (!$validTransitions) {
            return response()->json(['message' => 'No valid workflow defined for this form type'], 400);
        }

        $targetRole = $request->assigned_to_role;
        $targetStatus = $request->status;

        // Validate the role+status combination
        $validCombinations = [
            ['role' => $validTransitions['assistant'], 'status' => Status::SUBMITTED],
            ['role' => $validTransitions['principal'], 'status' => Status::IN_REVIEW],
        ];

        $isValid = false;
        foreach ($validCombinations as $combo) {
            if ($combo['role'] === $targetRole && $combo['status'] === $targetStatus) {
                $isValid = true;
                break;
            }
        }

        if (!$isValid) {
            return response()->json([
                'message' => 'Invalid transition. This application can only move between '
                    . $validTransitions['assistant'] . ' (Submitted) and '
                    . $validTransitions['principal'] . ' (In Review).',
            ], 422);
        }

        $application->update([
            'assigned_to_role' => $targetRole,
            'status' => $targetStatus,
        ]);

        return response()->json(['message' => 'Application updated successfully', 'application' => $application]);
    }

    /**
     * Return the valid assistant/principal role pair for a given form type.
     */
    protected function getValidTransitions(string $type): ?array
    {
        // Rent Authority forms
        $raTypes = [
            ApplicationTypes::RENT_REVISION,
            ApplicationTypes::OTHER_CHARGES_REVISION,
            ApplicationTypes::VALUER_APPOINTMENT,
            ApplicationTypes::RENT_AUTHORITY_FILING,
        ];

        // Rent Court forms
        $rcTypes = [
            ApplicationTypes::RENT_COURT_POSSESSION,
            ApplicationTypes::RENT_COURT_FILING,
            ApplicationTypes::RENT_COURT_APPEAL,
        ];

        // Rent Tribunal forms
        $rtTypes = [
            ApplicationTypes::RENT_TRIBUNAL_APPEAL,
        ];

        if (in_array($type, $raTypes)) {
            return ['assistant' => Roles::RA_ASSISTANT, 'principal' => Roles::RENT_AUTHORITY];
        }

        if (in_array($type, $rcTypes)) {
            return ['assistant' => Roles::RC_ASSISTANT, 'principal' => Roles::RENT_COURT];
        }

        if (in_array($type, $rtTypes)) {
            return ['assistant' => Roles::RT_ASSISTANT, 'principal' => Roles::RENT_TRIBUNAL];
        }

        return null;
    }
}
