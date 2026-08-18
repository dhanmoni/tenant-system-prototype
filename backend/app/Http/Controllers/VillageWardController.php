<?php

namespace App\Http\Controllers;

use App\Models\VillageWard;
use Illuminate\Http\Request;

class VillageWardController extends Controller
{
    /**
     * Public endpoint: list village/wards, optionally filtered by district_id.
     */
    public function publicIndex(Request $request)
    {
        $query = VillageWard::query()
            ->select(['id', 'name', 'type', 'district_id', 'villages', 'area_type', 'local_body']);

        if ($request->filled('district_id')) {
            $districtId = $request->input('district_id');
            if (!is_numeric($districtId) || (int) $districtId <= 0) {
                return response()->json([
                    'message' => 'Invalid district_id.',
                    'data' => [],
                ], 422);
            }
            $query->where('district_id', (int) $districtId);
        }

        $villageWards = $query->orderBy('name')->get();

        return response()->json($villageWards);
    }
}
