<?php

namespace App\Http\Controllers;

use App\Models\Designation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DesignationController extends Controller
{
    public function index(Request $request)
    {
        $query = Designation::orderBy('name');

        if ($request->boolean('all')) {
            return response()->json($query->get());
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z\\s]+$/', 'unique:designations,name'],
        ]);

        $designation = Designation::create($data);

        return response()->json(['designation' => $designation], 201);
    }

    public function update(Request $request, Designation $designation)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z\\s]+$/', Rule::unique('designations', 'name')->ignore($designation->id)],
        ]);

        $designation->update($data);

        return response()->json(['designation' => $designation]);
    }

    public function destroy(Designation $designation)
    {
        $designation->delete();

        return response()->json(['message' => 'Designation deleted']);
    }
}
