<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\State;
use App\Models\User;
use Illuminate\Http\Request;

class DistrictController extends Controller
{
    public function index()
    {
        $districts = District::with(['state', 'assistantDirector', 'districtHead'])
            ->orderBy('name')
            ->paginate(5);

        return response()->json($districts);
    }

    public function publicIndex()
    {
        $districts = District::orderBy('name')->get();

        return response()->json(['districts' => $districts]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z\\s]+$/', 'unique:districts,name'],
            'state_id' => ['nullable', 'integer', 'exists:states,id'],
            'assistant_director_id' => ['nullable', 'integer', 'exists:users,id'],
            'district_head_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        if (empty($data['state_id'])) {
            $data['state_id'] = State::value('id');
        }

        $district = District::create($data);

        return response()->json(['district' => $district], 201);
    }

    public function update(Request $request, District $district)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z\\s]+$/', 'unique:districts,name,' . $district->id],
            'state_id' => ['nullable', 'integer', 'exists:states,id'],
        ]);

        $district->update($data);

        return response()->json(['district' => $district->load('state')]);
    }

    public function destroy(District $district)
    {
        $district->delete();

        return response()->json(['message' => 'District deleted']);
    }

    public function assignAssistantDirector(Request $request, District $district)
    {
        $data = $request->validate([
            'assistant_director_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $assistantDirector = User::findOrFail($data['assistant_director_id']);
        if ($assistantDirector->role !== User::ROLE_ASSISTANT_DIRECTOR) {
            return response()->json(['message' => 'User is not an assistant director'], 422);
        }

        $district->assistant_director_id = $assistantDirector->id;
        $district->save();

        return response()->json(['district' => $district]);
    }

    public function assignDistrictHead(Request $request, District $district)
    {
        $data = $request->validate([
            'district_head_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $districtHead = User::findOrFail($data['district_head_id']);
        if ($districtHead->role !== User::ROLE_DISTRICT_HEAD) {
            return response()->json(['message' => 'User is not a district head'], 422);
        }

        $district->district_head_id = $districtHead->id;
        $district->save();

        $districtHead->district_id = $district->id;
        $districtHead->save();

        return response()->json(['district' => $district]);
    }
}
