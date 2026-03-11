<?php

namespace App\Http\Controllers;

use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StateController extends Controller
{
    public function index()
    {
        $states = State::orderBy('name')->paginate(5);

        return response()->json($states);
    }

    public function publicIndex()
    {
        $states = State::orderBy('name')->get();

        return response()->json(['states' => $states]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z\\s]+$/', 'unique:states,name'],
        ]);

        $state = State::create($data);

        return response()->json(['state' => $state], 201);
    }

    public function update(Request $request, State $state)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z\\s]+$/', Rule::unique('states', 'name')->ignore($state->id)],
        ]);

        $state->update($data);

        return response()->json(['state' => $state]);
    }

    public function destroy(State $state)
    {
        $state->delete();

        return response()->json(['message' => 'State deleted']);
    }
}
