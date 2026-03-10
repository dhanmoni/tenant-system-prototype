<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::with(['office', 'designation'])
            ->orderBy('name')
            ->get();

        return response()->json(['users' => $users]);
    }

    public function show(User $user)
    {
        return response()->json(['user' => $user->load(['office', 'designation'])]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', 'max:255', 'exists:roles,name'],
            'district_id' => ['nullable', 'integer', 'exists:districts,id'],
            'office_id' => ['nullable', 'integer', 'exists:offices,id'],
            'designation_id' => ['nullable', 'integer', 'exists:designations,id'],
            'phone' => ['nullable', 'string', 'max:30'],
            'reports_to_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $role = $data['role'];
        if (in_array($role, [User::ROLE_DISTRICT_HEAD, User::ROLE_DISTRICT_ASSISTANT], true) && empty($data['district_id'])) {
            return response()->json(['message' => 'district_id is required for district roles'], 422);
        }
        if ($role === User::ROLE_DISTRICT_HEAD && empty($data['reports_to_user_id'])) {
            return response()->json(['message' => 'reports_to_user_id is required for district heads'], 422);
        }
        if ($role === User::ROLE_DISTRICT_ASSISTANT && empty($data['reports_to_user_id'])) {
            return response()->json(['message' => 'reports_to_user_id is required for district assistants'], 422);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $role,
            'district_id' => $data['district_id'] ?? null,
            'office_id' => $data['office_id'] ?? null,
            'designation_id' => $data['designation_id'] ?? null,
            'phone' => $data['phone'] ?? null,
            'reports_to_user_id' => $data['reports_to_user_id'] ?? null,
            'password' => Hash::make('Test@123'),
            'email_verified_at' => now(),
            'remember_token' => Str::random(60),
        ]);

        if ($role === User::ROLE_DISTRICT_HEAD && !empty($data['district_id'])) {
            District::where('id', $data['district_id'])
                ->update(['district_head_id' => $user->id]);
        }

        return response()->json(['user' => $user], 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', 'string', 'max:255', 'exists:roles,name'],
            'district_id' => ['nullable', 'integer', 'exists:districts,id'],
            'office_id' => ['nullable', 'integer', 'exists:offices,id'],
            'designation_id' => ['nullable', 'integer', 'exists:designations,id'],
            'phone' => ['nullable', 'string', 'max:30'],
            'reports_to_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'district_id' => $data['district_id'] ?? null,
            'office_id' => $data['office_id'] ?? null,
            'designation_id' => $data['designation_id'] ?? null,
            'phone' => $data['phone'] ?? null,
            'reports_to_user_id' => $data['reports_to_user_id'] ?? null,
        ]);

        return response()->json(['user' => $user->load(['office', 'designation'])]);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    public function approve(Request $request, User $user)
    {
        if ($user->approved_at) {
            return response()->json(['message' => 'User already approved'], 422);
        }

        $user->approved_at = now();
        $user->approved_by_user_id = $request->user()->id;
        $user->save();

        return response()->json(['user' => $user->load(['office', 'designation'])]);
    }

    public function toggleBlock(Request $request, User $user)
    {
        $user->is_blocked = !$user->is_blocked;
        $user->save();

        return response()->json(['user' => $user->load(['office', 'designation'])]);
    }
}
