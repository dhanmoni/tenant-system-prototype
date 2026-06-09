<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\State;
use App\Models\User;
use Illuminate\Http\Request;

class DistrictController extends Controller
{
    public function index(Request $request)
    {
        $query = District::with(['state', 'rentAuthority', 'rentCourt', 'rentTribunal', 'districtAdmin'])
            ->orderBy('name');

        if ($request->boolean('all')) {
            return response()->json($query->get());
        }

        return response()->json($query->paginate(5));
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
            'assistant_director_id' => ['nullable', 'integer', 'exists:users,id'], // Rent Authority
            'district_head_id' => ['nullable', 'integer', 'exists:users,id'],      // Rent Court
            'rent_tribunal_id' => ['nullable', 'integer', 'exists:users,id'],
            'district_admin_id' => ['nullable', 'integer', 'exists:users,id'],
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
            'assistant_director_id' => ['nullable', 'integer', 'exists:users,id'],
            'district_head_id' => ['nullable', 'integer', 'exists:users,id'],
            'rent_tribunal_id' => ['nullable', 'integer', 'exists:users,id'],
            'district_admin_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $district->update($data);

        return response()->json(['district' => $district->load(['state', 'rentAuthority', 'rentCourt', 'rentTribunal', 'districtAdmin'])]);
    }

    public function destroy(District $district)
    {
        // Deletion is disabled: deactivate the district instead to preserve history.
        return response()->json([
            'message' => 'Districts cannot be deleted. Please deactivate the district instead.',
        ], 403);
    }

    public function toggleActive(Request $request, District $district)
    {
        $deactivating = $district->is_active;

        // A reason is required when deactivating; activation clears it.
        if ($deactivating) {
            $data = $request->validate([
                'reason' => ['required', 'string', 'max:1000'],
            ]);
            $district->deactivation_reason = $data['reason'];
        } else {
            $district->deactivation_reason = null;
        }

        $district->is_active = !$deactivating;
        $district->save();

        return response()->json([
            'district' => $district->load(['state', 'rentAuthority', 'rentCourt', 'rentTribunal', 'districtAdmin']),
        ]);
    }

    public function assignAdmin(Request $request, District $district)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['required', 'string', 'in:rent_authority,rent_court,rent_tribunal,district_admin'],
        ]);

        $user = User::findOrFail($data['user_id']);
        
        $column = match($data['type']) {
            'rent_authority' => 'assistant_director_id',
            'rent_court' => 'district_head_id',
            'rent_tribunal' => 'rent_tribunal_id',
            'district_admin' => 'district_admin_id',
        };

        $district->{$column} = $user->id;
        $district->save();

        $user->district_id = $district->id;
        $user->save();

        return response()->json(['district' => $district->load(['rentAuthority', 'rentCourt', 'rentTribunal', 'districtAdmin'])]);
    }
}
