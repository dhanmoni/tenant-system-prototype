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
        $query = VillageWard::query()->with('district');

        if ($request->filled('district_id')) {
            $query->where('district_id', $request->input('district_id'));
        }

        $villageWards = $query->orderBy('name')->get();

        return response()->json($villageWards);
    }
}
