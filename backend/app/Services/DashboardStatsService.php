<?php

namespace App\Services;

use App\Constants\ApplicationTypes;
use App\Constants\Roles;
use App\Constants\Status;
use App\Models\Designation;
use App\Models\District;
use App\Models\Office;
use App\Models\OtherChargesRevisionApplication;
use App\Models\RentAuthorityFilingApplication;
use App\Models\RentCourtAppealApplication;
use App\Models\RentCourtFilingApplication;
use App\Models\RentCourtPossessionApplication;
use App\Models\RentRevisionApplication;
use App\Models\RentTribunalAppealApplication;
use App\Models\Role;
use App\Models\State;
use App\Models\TenancyApplication;
use App\Models\User;
use App\Models\ValuerAppointmentApplication;

class DashboardStatsService
{
    /** @return class-string[] */
    public function allServiceModels(): array
    {
        return [
            RentRevisionApplication::class,
            OtherChargesRevisionApplication::class,
            ValuerAppointmentApplication::class,
            RentCourtPossessionApplication::class,
            RentCourtFilingApplication::class,
            RentAuthorityFilingApplication::class,
            RentCourtAppealApplication::class,
            RentTribunalAppealApplication::class,
        ];
    }

    /** @param  class-string  $modelClass */
    public function applicationTypeForModel(string $modelClass): string
    {
        return match ($modelClass) {
            RentRevisionApplication::class => ApplicationTypes::RENT_REVISION,
            OtherChargesRevisionApplication::class => ApplicationTypes::OTHER_CHARGES_REVISION,
            ValuerAppointmentApplication::class => ApplicationTypes::VALUER_APPOINTMENT,
            RentCourtPossessionApplication::class => ApplicationTypes::RENT_COURT_POSSESSION,
            RentCourtFilingApplication::class => ApplicationTypes::RENT_COURT_FILING,
            RentAuthorityFilingApplication::class => ApplicationTypes::RENT_AUTHORITY_FILING,
            RentCourtAppealApplication::class => ApplicationTypes::RENT_COURT_APPEAL,
            RentTribunalAppealApplication::class => ApplicationTypes::RENT_TRIBUNAL_APPEAL,
            default => 'service_application',
        };
    }

    /** @return class-string[] */
    public function modelsForRentAuthority(): array
    {
        return [
            RentAuthorityFilingApplication::class,
            RentRevisionApplication::class,
            OtherChargesRevisionApplication::class,
            ValuerAppointmentApplication::class,
        ];
    }

    /** @return class-string[] */
    public function modelsForRentCourt(): array
    {
        return [
            RentCourtFilingApplication::class,
            RentCourtPossessionApplication::class,
            RentCourtAppealApplication::class,
        ];
    }

    /** @return class-string[] */
    public function modelsForRentTribunal(): array
    {
        return [RentTribunalAppealApplication::class];
    }

    /** @return class-string[] */
    public function modelsForUser(User $user): array
    {
        return match ($user->role) {
            Roles::RA_ASSISTANT, Roles::RENT_AUTHORITY => $this->modelsForRentAuthority(),
            Roles::RC_ASSISTANT, Roles::RENT_COURT => $this->modelsForRentCourt(),
            Roles::RT_ASSISTANT, Roles::RENT_TRIBUNAL => $this->modelsForRentTribunal(),
            default => $this->allServiceModels(),
        };
    }

    public function countServiceApplications(?int $districtId = null, ?array $modelClasses = null): int
    {
        $total = 0;
        foreach ($modelClasses ?? $this->allServiceModels() as $modelClass) {
            $query = $modelClass::query()->where('status', '!=', Status::DRAFT);
            if ($districtId) {
                $query->where('district_id', $districtId);
            }
            $total += $query->count();
        }

        return $total;
    }

    public function countTenancyApplications(?int $districtId = null): int
    {
        $query = TenancyApplication::query()->where('status', '!=', Status::DRAFT);
        if ($districtId) {
            $query->where('district_id', $districtId);
        }

        return $query->count();
    }

  /**
     * @param  class-string[]|null  $modelClasses
     * @return array<string, int>
     */
    public function serviceStatusBreakdown(?int $districtId = null, ?array $modelClasses = null): array
    {
        $breakdown = [
            Status::SUBMITTED => 0,
            Status::IN_REVIEW => 0,
            Status::REJECTED => 0,
            Status::COMPLETED => 0,
            'OTHER' => 0,
        ];

        foreach ($modelClasses ?? $this->allServiceModels() as $modelClass) {
            $base = $modelClass::query();
            if ($districtId) {
                $base->where('district_id', $districtId);
            }

            foreach ([Status::SUBMITTED, Status::IN_REVIEW, Status::REJECTED, Status::COMPLETED] as $status) {
                $breakdown[$status] += (clone $base)->where('status', $status)->count();
            }

            $breakdown['OTHER'] += (clone $base)
                ->whereNotIn('status', [Status::SUBMITTED, Status::IN_REVIEW, Status::REJECTED, Status::COMPLETED, Status::DRAFT])
                ->count();
        }

        return $breakdown;
    }

    /**
     * @param  class-string[]|null  $modelClasses
     */
    public function countServiceByStatus(string $status, ?int $districtId = null, ?array $modelClasses = null): int
    {
        $total = 0;
        foreach ($modelClasses ?? $this->allServiceModels() as $modelClass) {
            $query = $modelClass::query()->where('status', $status);
            if ($districtId) {
                $query->where('district_id', $districtId);
            }
            $total += $query->count();
        }

        return $total;
    }

    /**
     * @param  class-string[]  $modelClasses
     * @return array<int, array<string, mixed>>
     */
    public function recentServiceApplications(array $modelClasses, ?int $districtId, int $limit = 6): array
    {
        $items = collect();

        foreach ($modelClasses as $modelClass) {
            $query = $modelClass::query()->with('user')->where('status', '!=', Status::DRAFT)->latest();
            if ($districtId) {
                $query->where('district_id', $districtId);
            }

            foreach ($query->limit($limit)->get() as $app) {
                $items->push([
                    'application_no' => $app->application_no,
                    'status' => $app->status,
                    'application_type' => $this->applicationTypeForModel($modelClass),
                    'applicant_name' => $app->user?->name,
                    'created_at' => $app->created_at?->toIso8601String(),
                ]);
            }
        }

        return $items
            ->sortByDesc('created_at')
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function recentTenancyApplications(?int $districtId, int $limit = 6): array
    {
        $query = TenancyApplication::query()->where('status', '!=', Status::DRAFT)->latest();
        if ($districtId) {
            $query->where('district_id', $districtId);
        }

        return $query->limit($limit)->get()->map(fn ($app) => [
            'application_no' => $app->application_no,
            'status' => $app->status,
            'application_type' => ApplicationTypes::TENANCY_CERTIFICATE,
            'applicant_name' => $app->landlord_name ?: $app->tenant_name ?: $app->manager_name,
            'created_at' => $app->created_at?->toIso8601String(),
        ])->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function districtBreakdown(?int $onlyDistrictId = null, ?array $modelClasses = null): array
    {
        $query = District::query()->with('state:id,name')->orderBy('name');
        if ($onlyDistrictId) {
            $query->where('id', $onlyDistrictId);
        }

        return $query->get()->map(function (District $district) use ($modelClasses) {
            $service = $this->countServiceApplications($district->id, $modelClasses);
            $tenancy = $this->countTenancyApplications($district->id);

            return [
                'id' => $district->id,
                'name' => $district->name,
                'code' => $district->code,
                'state_id' => $district->state_id,
                'state_name' => $district->state?->name,
                'tenancy_applications' => $tenancy,
                'service_applications' => $service,
                'total_applications' => $tenancy + $service,
                'users_count' => User::where('district_id', $district->id)->count(),
                'offices_count' => Office::where('district_id', $district->id)->count(),
            ];
        })->values()->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function statesOverview(): array
    {
        return State::query()
            ->withCount('districts')
            ->orderBy('name')
            ->get()
            ->map(function (State $state) {
                $districtIds = District::where('state_id', $state->id)->pluck('id');
                $tenancy = TenancyApplication::whereIn('district_id', $districtIds)->where('status', '!=', Status::DRAFT)->count();
                $service = 0;
                foreach ($this->allServiceModels() as $modelClass) {
                    $service += $modelClass::query()->whereIn('district_id', $districtIds)->where('status', '!=', Status::DRAFT)->count();
                }

                return [
                    'id' => $state->id,
                    'name' => $state->name,
                    'districts_count' => $state->districts_count,
                    'tenancy_applications' => $tenancy,
                    'service_applications' => $service,
                    'total_applications' => $tenancy + $service,
                    'users_count' => User::whereIn('district_id', $districtIds)->count(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  class-string[]  $modelClasses
     * @return array<int, array<string, mixed>>
     */
    public function formTypeBreakdown(?int $districtId = null, array $modelClasses = []): array
    {
        $items = [];
        foreach ($modelClasses as $modelClass) {
            $query = $modelClass::query()->where('status', '!=', Status::DRAFT);
            if ($districtId) {
                $query->where('district_id', $districtId);
            }
            $count = $query->count();
            if ($count === 0) {
                continue;
            }
            $items[] = [
                'form_key' => $this->applicationTypeForModel($modelClass),
                'label' => $this->formLabelForModel($modelClass),
                'count' => $count,
            ];
        }

        usort($items, fn ($a, $b) => $b['count'] <=> $a['count']);

        return $items;
    }

    /** @param  class-string  $modelClass */
    private function formLabelForModel(string $modelClass): string
    {
        return match ($modelClass) {
            RentRevisionApplication::class => 'Form I — Rent revision',
            OtherChargesRevisionApplication::class => 'Form I-A — Other charges',
            ValuerAppointmentApplication::class => 'Form I-B — Valuer appointment',
            RentAuthorityFilingApplication::class => 'Form IV — RA filing',
            RentCourtPossessionApplication::class => 'Form II — Possession',
            RentCourtFilingApplication::class => 'Form III — RC filing',
            RentCourtAppealApplication::class => 'Form V — RC appeal',
            RentTribunalAppealApplication::class => 'Form VI — RT appeal',
            default => 'Service form',
        };
    }

    public function superAdminStats(): array
    {
        $serviceCount = $this->countServiceApplications();
        $tenancyCount = $this->countTenancyApplications();
        $statusBreakdown = $this->serviceStatusBreakdown();
        $allModels = $this->allServiceModels();

        return [
            'districts_count' => District::count(),
            'states_count' => State::count(),
            'offices_count' => Office::count(),
            'users_count' => User::count(),
            'roles_count' => Role::count(),
            'designations_count' => Designation::count(),
            'tenancy_applications' => $tenancyCount,
            'service_applications' => $serviceCount,
            'applications_count' => $tenancyCount + $serviceCount,
            'applications_by_status' => $statusBreakdown,
            'applications_by_category' => [
                ['label' => 'UIN / Tenancy', 'count' => $tenancyCount],
                ['label' => 'Assam Tenancy Forms', 'count' => $serviceCount],
            ],
            'pending_review' => $this->countServiceByStatus(Status::SUBMITTED),
            'in_review' => $this->countServiceByStatus(Status::IN_REVIEW),
            'form_type_breakdown' => $this->formTypeBreakdown(null, $allModels),
            'district_breakdown' => $this->districtBreakdown(),
            'states_overview' => $this->statesOverview(),
            'recent_applications' => collect($this->recentTenancyApplications(null, 4))
                ->merge($this->recentServiceApplications($allModels, null, 4))
                ->sortByDesc('created_at')
                ->take(6)
                ->values()
                ->all(),
        ];
    }

    public function staffStats(User $user): array
    {
        $districtId = $user->district_id;
        $scopedModels = $this->modelsForUser($user);
        $serviceCount = $this->countServiceApplications($districtId, $scopedModels);
        $tenancyCount = $this->countTenancyApplications($districtId);
        $includeTenancyInTotals = in_array($user->role, [Roles::DISTRICT_ADMIN, Roles::SUPER_ADMIN], true);

        $applicationsCount = $serviceCount + ($includeTenancyInTotals ? $tenancyCount : 0);

        $stats = [
            'district_name' => $user->district?->name,
            'districts_count' => $districtId ? 1 : 0,
            'users_count' => $districtId
                ? User::where('district_id', $districtId)->count()
                : 0,
            'tenancy_applications' => $tenancyCount,
            'service_applications' => $serviceCount,
            'applications_count' => $applicationsCount,
            'applications_by_status' => $this->serviceStatusBreakdown($districtId, $scopedModels),
            'applications_by_category' => [
                ['label' => 'UIN / Tenancy', 'count' => $tenancyCount],
                ['label' => 'Assam Tenancy Forms', 'count' => $serviceCount],
            ],
            'pending_review' => 0,
            'in_review' => 0,
            'recent_applications' => [],
        ];

        if ($user->isAssistant()) {
            $stats['pending_review'] = $this->countServiceByStatus(
                Status::SUBMITTED,
                $districtId,
                $scopedModels
            );
            $stats['recent_applications'] = $this->recentServiceApplications($scopedModels, $districtId, 6);
        } elseif (in_array($user->role, Roles::principals(), true)) {
            $stats['in_review'] = $this->countServiceByStatus(
                Status::IN_REVIEW,
                $districtId,
                $scopedModels
            );
            $stats['recent_applications'] = $this->recentServiceApplications($scopedModels, $districtId, 6);
        } elseif ($user->role === Roles::DISTRICT_ADMIN) {
            $stats['pending_review'] = $this->countServiceByStatus(Status::SUBMITTED, $districtId);
            $stats['in_review'] = $this->countServiceByStatus(Status::IN_REVIEW, $districtId);
            $stats['recent_applications'] = collect($this->recentTenancyApplications($districtId, 4))
                ->merge($this->recentServiceApplications($this->allServiceModels(), $districtId, 4))
                ->sortByDesc('created_at')
                ->take(6)
                ->values()
                ->all();
        }

        $stats['form_type_breakdown'] = $this->formTypeBreakdown(
            $districtId,
            $scopedModels
        );
        $stats['district_breakdown'] = $this->districtBreakdown(
            $districtId,
            $user->role === Roles::DISTRICT_ADMIN ? null : $scopedModels
        );
        if ($user->role === Roles::DISTRICT_ADMIN || $user->role === Roles::SUPER_ADMIN) {
            $stats['states_overview'] = $this->statesOverview();
        }

        return $stats;
    }
}
