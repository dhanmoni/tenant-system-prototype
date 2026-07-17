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

        // We need to find the latest number for THIS specific district and year across ALL service application types.
        $tables = [
            'rent_authority_form_i_applications',
            'rent_authority_form_ia_applications',
            'rent_authority_form_ib_applications',
            'rent_court_form_4_applications',
            'rent_court_form_5_applications',
            'rent_authority_form_6_applications',
            'rent_court_form_7_applications',
            'rent_tribunal_form_8_applications'
        ];

        $maxSeq = 0;

        foreach ($tables as $table) {
            $latest = DB::table($table)
                ->where('application_no', 'like', $prefix . '-%')
                ->orderByDesc('application_no')
                ->first(['application_no']);

            if ($latest && $latest->application_no) {
                $parts = explode('-', $latest->application_no);
                $seq = (int) end($parts);
                if ($seq > $maxSeq) {
                    $maxSeq = $seq;
                }
            }
        }

        $next = $maxSeq + 1;

        return $prefix . '-' . str_pad((string) $next, 6, '0', STR_PAD_LEFT);
    }
}
