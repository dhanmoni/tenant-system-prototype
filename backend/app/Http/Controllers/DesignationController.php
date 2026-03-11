<?php

namespace App\Http\Controllers;

use App\Models\Designation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DesignationController extends Controller
{
    public function index()
    {
        $designations = Designation::orderBy('name')->paginate(5);

        return response()->json($designations);
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
