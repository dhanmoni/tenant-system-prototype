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
use Illuminate\Support\Facades\DB;

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
            \App\Models\TenancyApplication::class => ApplicationTypes::TENANCY_CERTIFICATE,
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
            Roles::VALUER => [ValuerAppointmentApplication::class],
            default => $this->allServiceModels(),
        };
    }

    public function countServiceApplications(?int $districtId = null, ?array $modelClasses = null): int
    {
        return $this->getCombinedServiceQuery($districtId, $modelClasses, ['id'])->count();
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
     * Helper to construct a single UNION ALL query for service applications.
     */
    protected function getCombinedServiceQuery(
        ?int $districtId, 
        ?array $modelClasses, 
        array $columns = ['status', 'district_id'],
        ?string $extraWhereSql = null,
        array $extraWhereBindings = []
    ): \Illuminate\Database\Query\Builder
    {
        $models = $modelClasses ?? $this->allServiceModels();
        if (empty($models)) {
            // Return an empty query builder if no models
            return DB::table(TenancyApplication::query()->getModel()->getTable())->whereRaw('1 = 0');
        }

        $selects = [];
        $bindings = [];

        foreach ($models as $modelClass) {
            $model = new $modelClass;
            $table = $model->getTable();
            
            $cols = [];
            foreach ($columns as $col) {
                if ($col === 'form_type') {
                    $formType = $this->applicationTypeForModel($modelClass);
                    $cols[] = "? as form_type";
                    $bindings[] = $formType;
                } elseif ($col === 'created_at_date') {
                    $dateExpr = DB::connection()->getDriverName() === 'pgsql'
                        ? 'created_at::date'
                        : 'DATE(created_at)';
                    $cols[] = "$dateExpr as created_at_date";
                } else {
                    $cols[] = $col;
                }
            }
            
            $selectSql = implode(', ', $cols);
            $query = "SELECT $selectSql FROM $table WHERE status != ?";
            $bindings[] = Status::DRAFT;
            
            if ($districtId) {
                $query .= " AND district_id = ?";
                $bindings[] = $districtId;
            }
            
            if ($extraWhereSql) {
                $query .= " AND $extraWhereSql";
                $bindings = array_merge($bindings, $extraWhereBindings);
            }
            
            $selects[] = $query;
        }

        $unionSql = implode(' UNION ALL ', $selects);
        
        // Return a query builder wrapping the union
        return DB::query()
            ->fromSub($unionSql, 'combined')
            ->setBindings($bindings);
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

        $trackedStatuses = [Status::SUBMITTED, Status::IN_REVIEW, Status::REJECTED, Status::COMPLETED];

        $counts = $this->getCombinedServiceQuery($districtId, $modelClasses, ['status'])
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        foreach ($counts as $status => $count) {
            if (in_array($status, $trackedStatuses, true)) {
                $breakdown[$status] += (int) $count;
            } else {
                $breakdown['OTHER'] += (int) $count;
            }
        }

        return $breakdown;
    }

    /**
     * @param  class-string[]|null  $modelClasses
     */
    public function countServiceByStatus(string $status, ?int $districtId = null, ?array $modelClasses = null): int
    {
        return $this->getCombinedServiceQuery(
            $districtId, 
            $modelClasses, 
            ['id'],
            'status = ?',
            [$status]
        )->count();
    }

    /**
     * @param  class-string[]  $modelClasses
     * @return array<int, array<string, mixed>>
     */
    public function recentServiceApplications(array $modelClasses, ?int $districtId, int $limit = 6): array
    {
        if (empty($modelClasses)) {
            return [];
        }
        
        $records = $this->getCombinedServiceQuery($districtId, $modelClasses, ['application_no', 'status', 'form_type', 'user_id', 'created_at'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        $userIds = $records->pluck('user_id')->filter()->unique();
        $users = User::whereIn('id', $userIds)->pluck('name', 'id');

        return $records->map(function ($app) use ($users) {
            return [
                'application_no' => $app->application_no,
                'status' => $app->status,
                'application_type' => $app->form_type,
                'applicant_name' => $users->get($app->user_id),
                'created_at' => \Carbon\Carbon::parse($app->created_at)->toIso8601String(),
            ];
        })->all();
    }

    /**
     * District oversight — recent UIN + service applications for dashboard table.
     *
     * @return array<int, array<string, mixed>>
     */
    public function districtApplicationsFeed(?int $districtId, int $limit = 120): array
    {
        $items = collect();

        $tenancyQuery = TenancyApplication::query()
            ->where('status', '!=', Status::DRAFT)
            ->latest();
        if ($districtId) {
            $tenancyQuery->where('district_id', $districtId);
        }
        
        foreach ($tenancyQuery->limit($limit)->get() as $app) {
            $items->push([
                'application_no' => $app->application_no,
                'status' => $app->status,
                'application_type' => ApplicationTypes::TENANCY_CERTIFICATE,
                'category' => 'uin',
                'applicant_name' => $app->landlord_name ?: $app->tenant_name ?: $app->manager_name,
                'created_at' => $app->created_at?->toIso8601String(),
            ]);
        }

        $serviceRecords = $this->getCombinedServiceQuery($districtId, $this->allServiceModels(), ['application_no', 'status', 'form_type', 'user_id', 'created_at'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        $userIds = $serviceRecords->pluck('user_id')->filter()->unique();
        $users = User::whereIn('id', $userIds)->pluck('name', 'id');

        foreach ($serviceRecords as $app) {
            $items->push([
                'application_no' => $app->application_no,
                'status' => $app->status,
                'application_type' => $app->form_type,
                'category' => 'form',
                'applicant_name' => $users->get($app->user_id),
                'created_at' => \Carbon\Carbon::parse($app->created_at)->toIso8601String(),
            ]);
        }

        return $items
            ->sortByDesc('created_at')
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * Daily submission counts for calendar (last N days, inclusive of today).
     *
     * @return array<int, array{date: string, total: int, uin: int, forms: int}>
     */
    public function dailyApplicationActivity(?int $districtId, int $days = 42): array
    {
        $days = max(7, min($days, 90));
        $start = now()->startOfDay()->subDays($days - 1);
        $end = now()->endOfDay();

        $buckets = [];
        for ($i = 0; $i < $days; $i++) {
            $key = $start->copy()->addDays($i)->format('Y-m-d');
            $buckets[$key] = ['date' => $key, 'total' => 0, 'uin' => 0, 'forms' => 0];
        }

        $dateExpr = DB::connection()->getDriverName() === 'pgsql'
            ? 'created_at::date'
            : 'DATE(created_at)';

        $tenancyQuery = TenancyApplication::query()
            ->selectRaw("{$dateExpr} as day, COUNT(*) as cnt")
            ->where('status', '!=', Status::DRAFT)
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('day');
        if ($districtId) {
            $tenancyQuery->where('district_id', $districtId);
        }
        foreach ($tenancyQuery->get() as $row) {
            $key = (string) $row->day;
            if (isset($buckets[$key])) {
                $buckets[$key]['uin'] = (int) $row->cnt;
                $buckets[$key]['total'] += (int) $row->cnt;
            }
        }

        $counts = $this->getCombinedServiceQuery(
            $districtId, 
            $this->allServiceModels(), 
            ['created_at_date'],
            'created_at BETWEEN ? AND ?',
            [$start, $end]
        )
            ->selectRaw('created_at_date as day, count(*) as cnt')
            ->groupBy('day')
            ->get();

        foreach ($counts as $row) {
            $key = (string) $row->day;
            if (isset($buckets[$key])) {
                $buckets[$key]['forms'] += (int) $row->cnt;
                $buckets[$key]['total'] += (int) $row->cnt;
            }
        }

        return array_values($buckets);
    }

    public function countApplicationsSubmittedOnDate(?int $districtId, string $date): int
    {
        $start = \Carbon\Carbon::parse($date)->startOfDay();
        $end = \Carbon\Carbon::parse($date)->endOfDay();
        $total = 0;

        $tenancyQuery = TenancyApplication::query()
            ->where('status', '!=', Status::DRAFT)
            ->whereBetween('created_at', [$start, $end]);
        if ($districtId) {
            $tenancyQuery->where('district_id', $districtId);
        }
        $total += $tenancyQuery->count();

        $serviceCount = $this->getCombinedServiceQuery(
            $districtId, 
            $this->allServiceModels(), 
            ['id'],
            'created_at BETWEEN ? AND ?',
            [$start, $end]
        )->count();
        $total += $serviceCount;

        return $total;
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
        $query = District::query()->with('state:id,name')->withCount(['users', 'offices'])->orderBy('name');
        if ($onlyDistrictId) {
            $query->where('id', $onlyDistrictId);
        }

        $circleCatalog = $this->assamCircleCatalog();
        $modelsToCount = $modelClasses ?? $this->allServiceModels();

        $districtTenancyCounts = TenancyApplication::query()
            ->selectRaw('district_id, count(*) as count')
            ->where('status', '!=', Status::DRAFT)
            ->when($onlyDistrictId, fn ($q) => $q->where('district_id', $onlyDistrictId))
            ->groupBy('district_id')
            ->pluck('count', 'district_id');

        $districtServiceCounts = $this->getCombinedServiceQuery($onlyDistrictId, $modelsToCount, ['district_id'])
            ->selectRaw('district_id, count(*) as count')
            ->groupBy('district_id')
            ->pluck('count', 'district_id');

        return $query->get()->map(function (District $district) use (
            $districtTenancyCounts,
            $districtServiceCounts,
            $circleCatalog,
            $modelClasses
        ) {
            $tenancy = $districtTenancyCounts->get($district->id, 0);
            $service = $districtServiceCounts->get($district->id, 0);

            return [
                'id' => $district->id,
                'name' => $district->name,
                'code' => $district->code,
                'state_id' => $district->state_id,
                'state_name' => $district->state?->name,
                'tenancy_applications' => $tenancy,
                'service_applications' => $service,
                'total_applications' => $tenancy + $service,
                'users_count' => $district->users_count ?? 0,
                'offices_count' => $district->offices_count ?? 0,
                'subdivisions' => $this->subdivisionBreakdownForDistrict(
                    $district,
                    $circleCatalog,
                    $modelClasses
                ),
            ];
        })->values()->all();
    }

    /**
     * Application counts per circle / sub-division (via circle office).
     * UIN apps use office_id directly. Service forms are attributed through
     * tenancy_uin → tenancy application → office_id when a match exists.
     *
     * @param  array<string, array<int, string>>|null  $circleCatalog
     * @param  class-string[]|null  $modelClasses
     * @return array<int, array<string, mixed>>
     */
    public function subdivisionBreakdownForDistrict(
        District $district,
        ?array $circleCatalog = null,
        ?array $modelClasses = null
    ): array {
        $circleCatalog ??= $this->assamCircleCatalog();
        $circleNames = $circleCatalog[$this->normalizeNameKey($district->name)]
            ?? $this->findCirclesForDistrictName($district->name, $circleCatalog);

        $offices = Office::query()
            ->where('district_id', $district->id)
            ->orderBy('name')
            ->get(['id', 'name', 'district_id']);

        $tenancyByOffice = TenancyApplication::query()
            ->select('office_id', DB::raw('COUNT(*) as aggregate'))
            ->where('district_id', $district->id)
            ->where('status', '!=', Status::DRAFT)
            ->whereNotNull('office_id')
            ->groupBy('office_id')
            ->pluck('aggregate', 'office_id');

        $serviceByOffice = $this->serviceApplicationsByOffice($district->id, $modelClasses);

        $buildRow = function (?Office $office, string $name) use ($tenancyByOffice, $serviceByOffice) {
            $tenancy = $office ? (int) ($tenancyByOffice[$office->id] ?? 0) : 0;
            $service = $office ? (int) ($serviceByOffice[$office->id] ?? 0) : 0;

            return [
                'name' => $name,
                'office_id' => $office?->id,
                'office_name' => $office?->name,
                'tenancy_applications' => $tenancy,
                'service_applications' => $service,
                'total_applications' => $tenancy + $service,
            ];
        };

        if ($circleNames === []) {
            return $offices->map(function (Office $office) use ($buildRow) {
                return $buildRow($office, $this->displayCircleNameFromOffice($office->name));
            })->values()->all();
        }

        $usedOfficeIds = [];
        $rows = [];
        foreach ($circleNames as $circleName) {
            $office = $this->matchOfficeToCircle($offices, $circleName, $usedOfficeIds);
            if ($office) {
                $usedOfficeIds[$office->id] = true;
            }
            $rows[] = $buildRow($office, $circleName);
        }

        return $rows;
    }

    /**
     * Count non-draft service forms per circle office, via linked tenancy UIN.
     *
     * @param  class-string[]|null  $modelClasses
     * @return array<int, int> office_id => count
     */
    private function serviceApplicationsByOffice(?int $districtId, ?array $modelClasses = null): array
    {
        $uinToOffice = TenancyApplication::query()
            ->when($districtId, fn ($q) => $q->where('district_id', $districtId))
            ->whereNotNull('uid')
            ->whereNotNull('office_id')
            ->where('status', '!=', Status::DRAFT)
            ->pluck('office_id', 'uid');

        if ($uinToOffice->isEmpty()) {
            return [];
        }

        $counts = [];
        foreach ($modelClasses ?? $this->allServiceModels() as $modelClass) {
            $query = $modelClass::query()
                ->where('status', '!=', Status::DRAFT)
                ->whereNotNull('tenancy_uin');
            if ($districtId) {
                $query->where('district_id', $districtId);
            }

            foreach ($query->pluck('tenancy_uin') as $uin) {
                $officeId = $uinToOffice[$uin] ?? null;
                if (!$officeId) {
                    continue;
                }
                $counts[$officeId] = ($counts[$officeId] ?? 0) + 1;
            }
        }

        return $counts;
    }

    /**
     * @return array<string, array<int, string>> keyed by normalized district name
     */
    private function assamCircleCatalog(): array
    {
        static $catalog = null;
        if (is_array($catalog)) {
            return $catalog;
        }

        $path = database_path('seeders/data/assam_circle_offices.json');
        $catalog = [];
        if (!is_file($path)) {
            return $catalog;
        }

        $groups = json_decode((string) file_get_contents($path), true) ?: [];
        foreach ($groups as $group) {
            $district = $group['district'] ?? null;
            $circles = $group['circles'] ?? null;
            if (!$district || !is_array($circles)) {
                continue;
            }
            $catalog[$this->normalizeNameKey($district)] = array_values(array_filter(array_map('strval', $circles)));
        }

        return $catalog;
    }

    /**
     * @param  array<string, array<int, string>>  $circleCatalog
     * @return array<int, string>
     */
    private function findCirclesForDistrictName(string $districtName, array $circleCatalog): array
    {
        $focus = $this->normalizeNameKey($districtName);
        foreach ($circleCatalog as $key => $circles) {
            if ($key === $focus || str_contains($key, $focus) || str_contains($focus, $key)) {
                return $circles;
            }
            if (str_contains($focus, 'kamrup rural') && $key === 'kamrup') {
                return $circles;
            }
            if (str_contains($focus, 'south salmara') && str_contains($key, 'salmara')) {
                return $circles;
            }
        }

        return [];
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Office>  $offices
     * @param  array<int, bool>  $usedOfficeIds
     */
    private function matchOfficeToCircle($offices, string $circleName, array $usedOfficeIds): ?Office
    {
        $circleKey = $this->normalizeCircleKey($circleName);
        $best = null;
        $bestScore = 0;

        foreach ($offices as $office) {
            if (isset($usedOfficeIds[$office->id])) {
                continue;
            }
            $officeKey = $this->normalizeCircleKey($office->name);
            if ($officeKey === '' || $circleKey === '') {
                continue;
            }
            $score = 0;
            if ($officeKey === $circleKey) {
                $score = 3;
            } elseif (str_contains($officeKey, $circleKey) || str_contains($circleKey, $officeKey)) {
                $score = 2;
            }
            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $office;
            }
        }

        return $bestScore > 0 ? $best : null;
    }

    private function displayCircleNameFromOffice(string $officeName): string
    {
        $name = trim(preg_replace('/\b(circle\s+office|office)\b/i', '', $officeName) ?? $officeName);
        $name = trim(preg_replace('/\s+/', ' ', $name) ?? $name);
        $name = preg_replace('/^-\s*/', '', $name) ?? $name;

        return $name !== '' ? $name : $officeName;
    }

    private function normalizeNameKey(?string $name): string
    {
        $value = strtolower((string) $name);
        $value = str_replace(['–', '—'], '-', $value);
        $value = preg_replace('/[^a-z0-9]+/', ' ', $value) ?? $value;

        return trim(preg_replace('/\s+/', ' ', $value) ?? $value);
    }

    private function normalizeCircleKey(?string $name): string
    {
        $value = $this->normalizeNameKey($name);
        $value = preg_replace('/\b(circle|office|co|pt)\b/', ' ', $value) ?? $value;

        return trim(preg_replace('/\s+/', ' ', $value) ?? $value);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function statesOverview(?array $districtsBreakdown = null): array
    {
        $districts = collect($districtsBreakdown ?? $this->districtBreakdown());

        return State::query()
            ->withCount('districts')
            ->orderBy('name')
            ->get()
            ->map(function (State $state) use ($districts) {
                $stateDistricts = $districts->where('state_id', $state->id);
                
                $tenancy = $stateDistricts->sum('tenancy_applications');
                $service = $stateDistricts->sum('service_applications');
                $users = $stateDistricts->sum('users_count');
                
                return [
                    'id' => $state->id,
                    'name' => $state->name,
                    'districts_count' => $state->districts_count,
                    'tenancy_applications' => $tenancy,
                    'service_applications' => $service,
                    'total_applications' => $tenancy + $service,
                    'users_count' => $users,
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
        $counts = $this->getCombinedServiceQuery($districtId, $modelClasses, ['form_type'])
            ->selectRaw('form_type, count(*) as count')
            ->groupBy('form_type')
            ->pluck('count', 'form_type');

        $items = [];
        foreach ($counts as $formKey => $count) {
            if ((int)$count === 0) continue;
            
            // Map form_type to label by instantiating or matching
            $label = match ($formKey) {
                ApplicationTypes::RENT_REVISION => 'Form I — Rent revision',
                ApplicationTypes::OTHER_CHARGES_REVISION => 'Form I-A — Other charges revision',
                ApplicationTypes::VALUER_APPOINTMENT => 'Form I-B — Valuer appointment',
                ApplicationTypes::RENT_COURT_POSSESSION => 'Form II — Recovery of possession',
                ApplicationTypes::RENT_COURT_FILING => 'Form III — Application to Rent Court',
                ApplicationTypes::RENT_AUTHORITY_FILING => 'Form IV — Application to Rent Authority',
                ApplicationTypes::RENT_COURT_APPEAL => 'Form V — Appeal to Rent Court',
                ApplicationTypes::RENT_TRIBUNAL_APPEAL => 'Form VI — Appeal to Rent Tribunal',
                ApplicationTypes::TENANCY_CERTIFICATE => 'UIN / Tenancy Certificate',
                default => 'Unknown Form'
            };

            $items[] = [
                'form_key' => $formKey,
                'label' => $label,
                'count' => (int) $count,
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

        $districtBreakdown = $this->districtBreakdown();

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
            'district_breakdown' => $districtBreakdown,
            'states_overview' => $this->statesOverview($districtBreakdown),
            'recent_applications' => collect($this->recentTenancyApplications(null, 4))
                ->merge($this->recentServiceApplications($allModels, null, 4))
                ->sortByDesc('created_at')
                ->take(6)
                ->values()
                ->all(),
            'daily_activity' => $this->dailyApplicationActivity(null, 42),
            'applications_feed' => $this->districtApplicationsFeed(null, 120),
            'submitted_today' => $this->countApplicationsSubmittedOnDate(
                null,
                now()->format('Y-m-d')
            ),
        ];
    }

    public function staffStats(User $user): array
    {
        $districtId = $user->district_id;
        $scopedModels = $this->modelsForUser($user);
        $serviceCount = $this->countServiceApplications($districtId, $scopedModels);
        $tenancyCount = $this->countTenancyApplications($districtId);
        $includeTenancyInTotals = in_array($user->role, [Roles::DISTRICT_ADMIN, Roles::SUPER_ADMIN, Roles::RENT_AUTHORITY, Roles::RA_ASSISTANT], true);

        $applicationsCount = $serviceCount + ($includeTenancyInTotals ? $tenancyCount : 0);
        
        $applicationsByCategory = [
            ['label' => 'Assam Tenancy Forms', 'count' => $serviceCount],
        ];
        if ($includeTenancyInTotals) {
            array_unshift($applicationsByCategory, ['label' => 'UIN / Tenancy', 'count' => $tenancyCount]);
        }
        
        $statusBreakdown = $this->serviceStatusBreakdown($districtId, $scopedModels);
        if ($includeTenancyInTotals) {
            $tenancyBreakdown = $this->serviceStatusBreakdown($districtId, [\App\Models\TenancyApplication::class]);
            foreach ($tenancyBreakdown as $status => $count) {
                $statusBreakdown[$status] = ($statusBreakdown[$status] ?? 0) + $count;
            }
        }

        $stats = [
            'district_name' => $user->district?->name,
            'districts_count' => $districtId ? 1 : 0,
            'users_count' => $districtId
                ? User::where('district_id', $districtId)->count()
                : 0,
            'tenancy_applications' => $includeTenancyInTotals ? $tenancyCount : 0,
            'service_applications' => $serviceCount,
            'applications_count' => $applicationsCount,
            'applications_by_status' => $statusBreakdown,
            'applications_by_category' => $applicationsByCategory,
            'pending_review' => 0,
            'in_review' => 0,
            'recent_applications' => [],
        ];

        if ($user->isAssistant()) {
            $pendingService = $this->countServiceByStatus(Status::SUBMITTED, $districtId, $scopedModels);
            $pendingTenancy = $includeTenancyInTotals ? $this->countServiceByStatus(Status::SUBMITTED, $districtId, [\App\Models\TenancyApplication::class]) : 0;
            $stats['pending_review'] = $pendingService + $pendingTenancy;
            
            $recentService = $this->recentServiceApplications($scopedModels, $districtId, 6);
            if ($includeTenancyInTotals) {
                $recentTenancy = $this->recentTenancyApplications($districtId, 4);
                $stats['recent_applications'] = collect($recentTenancy)
                    ->merge($recentService)
                    ->sortByDesc('created_at')
                    ->take(6)
                    ->values()
                    ->all();
            } else {
                $stats['recent_applications'] = $recentService;
            }
        } elseif ($user->role === Roles::VALUER) {
            $assignedQuery = ValuerAppointmentApplication::query()
                ->where('assigned_valuer_id', $user->id);
            if ($districtId) {
                $assignedQuery->where('district_id', $districtId);
            }

            $stats['pending_review'] = (clone $assignedQuery)
                ->where('status', Status::VALUER_ASSIGNED)
                ->count();
            $stats['reports_submitted'] = (clone $assignedQuery)
                ->where('status', Status::VALUER_REPORT_SUBMITTED)
                ->count();
            $stats['in_review'] = $stats['reports_submitted'];
            $stats['valuer_completed'] = (clone $assignedQuery)
                ->whereIn('status', [Status::COMPLETED, Status::APPROVED])
                ->count();
            $stats['service_applications'] = (clone $assignedQuery)
                ->where('status', '!=', Status::DRAFT)
                ->count();
            $stats['applications_count'] = $stats['service_applications'];
            $stats['applications_by_status'] = [
                Status::VALUER_ASSIGNED => $stats['pending_review'],
                Status::VALUER_REPORT_SUBMITTED => $stats['reports_submitted'],
                Status::COMPLETED => $stats['valuer_completed'],
                Status::REJECTED => (clone $assignedQuery)->where('status', Status::REJECTED)->count(),
                'OTHER' => 0,
            ];
            $stats['recent_applications'] = ValuerAppointmentApplication::query()
                ->with('user')
                ->where('assigned_valuer_id', $user->id)
                ->when($districtId, fn ($q) => $q->where('district_id', $districtId))
                ->where('status', '!=', Status::DRAFT)
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn ($app) => [
                    'application_no' => $app->application_no,
                    'status' => $app->status,
                    'application_type' => ApplicationTypes::VALUER_APPOINTMENT,
                    'applicant_name' => $app->applicant_name ?: $app->user?->name,
                    'created_at' => $app->created_at?->toIso8601String(),
                ])
                ->all();
            $stats['form_type_breakdown'] = [[
                'form_key' => ApplicationTypes::VALUER_APPOINTMENT,
                'label' => 'Form I-B — Valuer appointment',
                'count' => $stats['service_applications'],
            ]];
        } elseif (in_array($user->role, Roles::principals(), true)) {
            $inReviewService = $this->countServiceByStatus(Status::IN_REVIEW, $districtId, $scopedModels);
            $inReviewTenancy = $includeTenancyInTotals ? $this->countServiceByStatus(Status::IN_REVIEW, $districtId, [\App\Models\TenancyApplication::class]) : 0;
            $stats['in_review'] = $inReviewService + $inReviewTenancy;
            
            $recentService = $this->recentServiceApplications($scopedModels, $districtId, 6);
            if ($includeTenancyInTotals) {
                $recentTenancy = $this->recentTenancyApplications($districtId, 4);
                $stats['recent_applications'] = collect($recentTenancy)
                    ->merge($recentService)
                    ->sortByDesc('created_at')
                    ->take(6)
                    ->values()
                    ->all();
            } else {
                $stats['recent_applications'] = $recentService;
            }
        } elseif ($user->role === Roles::DISTRICT_ADMIN) {
            $stats['pending_review'] = $this->countServiceByStatus(Status::SUBMITTED, $districtId);
            $stats['in_review'] = $this->countServiceByStatus(Status::IN_REVIEW, $districtId);
            $stats['recent_applications'] = collect($this->recentTenancyApplications($districtId, 4))
                ->merge($this->recentServiceApplications($this->allServiceModels(), $districtId, 4))
                ->sortByDesc('created_at')
                ->take(6)
                ->values()
                ->all();
            $stats['daily_activity'] = $this->dailyApplicationActivity($districtId, 42);
            $stats['applications_feed'] = $this->districtApplicationsFeed($districtId, 120);
            $stats['submitted_today'] = $this->countApplicationsSubmittedOnDate(
                $districtId,
                now()->format('Y-m-d')
            );
        }

        if ($user->role !== Roles::VALUER) {
            $stats['form_type_breakdown'] = $this->formTypeBreakdown(
                $districtId,
                $scopedModels
            );
        }
        $stats['district_breakdown'] = $this->districtBreakdown(
            $districtId,
            $user->role === Roles::DISTRICT_ADMIN ? null : $scopedModels
        );
        if ($user->role === Roles::DISTRICT_ADMIN || $user->role === Roles::SUPER_ADMIN) {
            $stats['states_overview'] = $this->statesOverview($stats['district_breakdown']);
        }

        return $stats;
    }
}
