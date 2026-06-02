<?php

namespace App\Traits;

use App\Models\District;
use Illuminate\Support\Facades\DB;

trait GeneratesApplicationNo
{
    /**
     * Generate a standardized application number.
     * Format: APP-<DISTRICT><YEAR>-<NUMBER>
     * Example: APP-KAM2026-000001
     */
    public static function generateApplicationNo($districtId)
    {
        $district = District::find($districtId);
        $districtCode = $district ? ($district->code ?: strtoupper(substr($district->name, 0, 3))) : 'GEN';
        $year = date('Y');
        $prefix = "APP-{$districtCode}{$year}";

        // We need to find the latest number for THIS specific district and year across ALL application types?
        // Or per type? The user said "standardized applicationNo structure fixed, dont want different format for each type".
        // If it's across all types, we need a shared table or a global sequence.
        // However, usually it's per table but with same format.
        // Let's assume it's per table for now, but following the format.
        
        $latest = self::where('application_no', 'like', $prefix . '-%')
            ->orderByDesc('application_no')
            ->lockForUpdate()
            ->first();

        $next = 1;
        if ($latest) {
            $parts = explode('-', $latest->application_no);
            $seq = (int) end($parts);
            $next = $seq + 1;
        }

        return $prefix . '-' . str_pad((string) $next, 6, '0', STR_PAD_LEFT);
    }
}
