<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\Office;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class OfficeSeeder extends Seeder
{
    public function run()
    {
        $districts = District::with('state')->get()->keyBy(fn (District $d) => $this->normalize($d->name));
        $circlesPath = database_path('seeders/data/assam_circle_offices.json');

        if (File::exists($circlesPath)) {
            $groups = json_decode(File::get($circlesPath), true) ?: [];
            foreach ($groups as $group) {
                $districtName = $group['district'] ?? null;
                $circles = $group['circles'] ?? [];
                if (!$districtName || !is_array($circles)) {
                    continue;
                }

                $district = $districts->get($this->normalize($districtName))
                    ?? $districts->first(fn (District $d) => str_contains($this->normalize($d->name), $this->normalize($districtName))
                        || str_contains($this->normalize($districtName), $this->normalize($d->name)));

                if (!$district) {
                    continue;
                }

                foreach ($circles as $circle) {
                    $circle = trim((string) $circle);
                    if ($circle === '') {
                        continue;
                    }

                    $officeName = $this->circleOfficeName($circle);
                    Office::firstOrCreate(
                        [
                            'name' => $officeName,
                            'district_id' => $district->id,
                        ],
                        [
                            'state_id' => $district->state_id,
                            'address' => $circle . ' Circle Office, ' . $district->name . ', ' . ($district->state->name ?? 'Assam'),
                        ]
                    );
                }
            }
        }

        // Ensure every district still has at least one office (fallback for unmatched names).
        foreach (District::with('state')->get() as $district) {
            if (Office::where('district_id', $district->id)->exists()) {
                continue;
            }

            Office::firstOrCreate(
                [
                    'name' => 'Office - ' . $district->name,
                    'district_id' => $district->id,
                ],
                [
                    'state_id' => $district->state_id,
                    'address' => 'Sample Address, ' . $district->name . ', ' . ($district->state->name ?? 'Assam'),
                ]
            );
        }

        // Move apps still on generic "Office - {District}" onto circle offices so map counts work.
        $this->reassignGenericOfficeApplications();
    }

    private function reassignGenericOfficeApplications(): void
    {
        if (!class_exists(\App\Models\TenancyApplication::class)) {
            return;
        }

        foreach (District::query()->get() as $district) {
            $generic = Office::query()
                ->where('district_id', $district->id)
                ->where(function ($q) use ($district) {
                    $q->where('name', 'Office - ' . $district->name)
                        ->orWhere('name', 'like', 'Office -%');
                })
                ->get();

            $circleOffices = Office::query()
                ->where('district_id', $district->id)
                ->where('name', 'like', '%Circle Office')
                ->orderBy('id')
                ->get();

            if ($generic->isEmpty() || $circleOffices->isEmpty()) {
                continue;
            }

            $genericIds = $generic->pluck('id');
            $apps = \App\Models\TenancyApplication::query()
                ->where('district_id', $district->id)
                ->whereIn('office_id', $genericIds)
                ->orderBy('id')
                ->get(['id', 'office_id']);

            foreach ($apps as $index => $app) {
                $target = $circleOffices[$index % $circleOffices->count()];
                $app->office_id = $target->id;
                $app->save();
            }
        }
    }

    private function circleOfficeName(string $circle): string
    {
        $base = trim(preg_replace('/\bcircle\b/i', '', $circle) ?? $circle);
        $base = trim(preg_replace('/\s+/', ' ', $base) ?? $base);

        return ($base !== '' ? $base : $circle) . ' Circle Office';
    }

    private function normalize(?string $name): string
    {
        $value = strtolower((string) $name);
        $value = preg_replace('/[^a-z0-9]+/', ' ', $value) ?? $value;

        return trim(preg_replace('/\s+/', ' ', $value) ?? $value);
    }
}
