<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\Office;
use Illuminate\Http\Request;

class OfficeController extends Controller
{
    public function publicIndex()
    {
        $offices = Office::with(['state', 'district'])
            ->orderBy('name')
            ->paginate(50);

        return response()->json($offices);
    }

    public function index()
    {
        $offices = Office::with(['state', 'district'])
            ->orderBy('name')
            ->paginate(5);

        return response()->json($offices);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'state_id' => ['required', 'integer', 'exists:states,id'],
            'district_id' => ['required', 'integer', 'exists:districts,id'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
        ]);

        $districtMatchesState = District::where('id', $data['district_id'])
            ->where('state_id', $data['state_id'])
            ->exists();

        if (!$districtMatchesState) {
            return response()->json(['message' => 'Selected district does not belong to the state'], 422);
        }

        $office = Office::create($data);

        return response()->json(['office' => $office], 201);
    }

    public function update(Request $request, Office $office)
    {
        $data = $request->validate([
            'state_id' => ['required', 'integer', 'exists:states,id'],
            'district_id' => ['required', 'integer', 'exists:districts,id'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
        ]);

        $districtMatchesState = District::where('id', $data['district_id'])
            ->where('state_id', $data['state_id'])
            ->exists();

        if (!$districtMatchesState) {
            return response()->json(['message' => 'Selected district does not belong to the state'], 422);
        }

        $office->update($data);

        return response()->json(['office' => $office->load(['state', 'district'])]);
    }

    public function destroy(Office $office)
    {
        $office->delete();

        return response()->json(['message' => 'Office deleted']);
    }
}
