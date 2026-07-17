<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\User;
use App\Http\Resources\UserResource;
use App\Constants\Roles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = $request->user();
        $query = User::with(['office', 'designation', 'district']);

        if ($currentUser->role === Roles::SUPER_ADMIN) {
            // No additional filters for super admin
        } elseif ($currentUser->role === Roles::DISTRICT_ADMIN) {
            // District admin sees all staff in their district
            $query->where('district_id', $currentUser->district_id)
                  ->where('role', '!=', Roles::USER);
        } elseif (in_array($currentUser->role, Roles::principals())) {
            // Heads see only their respective assistants and valuers in their district
            $assistantRoles = match($currentUser->role) {
                Roles::RENT_AUTHORITY => [Roles::RA_ASSISTANT, Roles::VALUER],
                Roles::RENT_COURT => [Roles::RC_ASSISTANT],
                Roles::RENT_TRIBUNAL => [Roles::RT_ASSISTANT],
                default => [],
            };
            $query->where('district_id', $currentUser->district_id)
                  ->whereIn('role', $assistantRoles);
        } else {
            // Other roles (like assistants) should not see the user list generally,
            // but if they access it, they see nothing.
            return response()->json(['users' => []]);
        }

        $users = $query->orderBy('name')->get();

        return response()->json(['users' => UserResource::collection($users)]);
    }

    public function show(User $user)
    {
        return response()->json(['user' => new UserResource($user->load(['office', 'designation']))]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'role' => ['required', 'string', 'max:255', 'exists:roles,name'],
            'district_id' => ['nullable', 'integer', 'exists:districts,id'],
            'office_id' => ['nullable', 'integer', 'exists:offices,id'],
            'designation_id' => ['nullable', 'integer', 'exists:designations,id'],
            'phone' => [
                'required', 
                'string', 
                'size:10', 
                'regex:/^[0-9]{10}$/',
                Rule::unique('users')->where(function ($query) use ($request) {
                    return $query->where('role', $request->role);
                })
            ],
            'reports_to_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $user = $request->user();
        $role = $data['role'];

        // Permission checks
        if ($user->role === Roles::SUPER_ADMIN) {
            // Super admin can create anyone
        } elseif ($user->role === Roles::DISTRICT_ADMIN) {
            // District admin can create principals and assistants for their district
            if (!in_array($role, Roles::allStaff())) {
                return response()->json(['message' => 'Unauthorized role creation'], 403);
            }
            $data['district_id'] = $user->district_id;
        } elseif (in_array($user->role, Roles::principals())) {
            // Principals can create their own assistants and valuers
            $allowedRoles = match($user->role) {
                Roles::RENT_AUTHORITY => [Roles::RA_ASSISTANT, Roles::VALUER],
                Roles::RENT_COURT => [Roles::RC_ASSISTANT],
                Roles::RENT_TRIBUNAL => [Roles::RT_ASSISTANT],
                default => [],
            };
            if (!in_array($role, $allowedRoles)) {
                return response()->json(['message' => 'Unauthorized assistant/valuer role'], 403);
            }
            $data['district_id'] = $user->district_id;
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $newUser = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $role,
            'district_id' => $data['district_id'] ?? null,
            'office_id' => $data['office_id'] ?? null,
            'designation_id' => $data['designation_id'] ?? null,
            'phone' => $data['phone'] ?? null,
            'reports_to_user_id' => $data['reports_to_user_id'] ?? $user->id,
            'password' => Hash::make('Test@123'),
            'email_verified_at' => now(),
            'approved_at' => now(), // Auto-approve admin created users
            'remember_token' => Str::random(60),
        ]);

        // Update district principal IDs
        if (!empty($data['district_id'])) {
            $districtUpdate = match($role) {
                Roles::DISTRICT_ADMIN => ['district_admin_id' => $newUser->id],
                Roles::RENT_AUTHORITY => ['assistant_director_id' => $newUser->id],
                Roles::RENT_COURT => ['district_head_id' => $newUser->id],
                Roles::RENT_TRIBUNAL => ['rent_tribunal_id' => $newUser->id],
                default => [],
            };
            if (!empty($districtUpdate)) {
                District::where('id', $data['district_id'])->update($districtUpdate);
            }
        }

        return response()->json(['user' => $newUser], 201);
    }

    public function update(Request $request, User $user)
    {
        $currentUser = $request->user();
        $newRole = $request->input('role') ?? $user->role;

        // Permission checks
        if ($currentUser->role === Roles::SUPER_ADMIN) {
            // Can update anyone
        } elseif ($currentUser->role === Roles::DISTRICT_ADMIN) {
            // District admin can update staff in their district
            if ($user->district_id !== $currentUser->district_id || !in_array($user->role, Roles::allStaff()) || !in_array($newRole, Roles::allStaff())) {
                return response()->json(['message' => 'Unauthorized update'], 403);
            }
            $request->merge(['district_id' => $currentUser->district_id]);
        } elseif (in_array($currentUser->role, Roles::principals())) {
            // Principals can only update their own assistants and valuers
            $allowedRoles = match($currentUser->role) {
                Roles::RENT_AUTHORITY => [Roles::RA_ASSISTANT, Roles::VALUER],
                Roles::RENT_COURT => [Roles::RC_ASSISTANT],
                Roles::RENT_TRIBUNAL => [Roles::RT_ASSISTANT],
                default => [],
            };
            if ($user->district_id !== $currentUser->district_id || !in_array($user->role, $allowedRoles) || !in_array($newRole, $allowedRoles)) {
                return response()->json(['message' => 'Unauthorized update'], 403);
            }
            $request->merge(['district_id' => $currentUser->district_id]);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'role' => ['required', 'string', 'max:255', 'exists:roles,name'],
            'district_id' => ['nullable', 'integer', 'exists:districts,id'],
            'office_id' => ['nullable', 'integer', 'exists:offices,id'],
            'designation_id' => ['nullable', 'integer', 'exists:designations,id'],
            'phone' => [
                'nullable', 
                'string', 
                'size:10', 
                'regex:/^[0-9]{10}$/',
                Rule::unique('users')->where(function ($query) use ($request, $user) {
                    $role = $request->input('role') ?? $user->role;
                    return $query->where('role', $role);
                })->ignore($user->id)
            ],
            'reports_to_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        // Update district principal IDs if role changed to principal
        if (!empty($data['district_id'])) {
            $districtUpdate = match($data['role']) {
                Roles::DISTRICT_ADMIN => ['district_admin_id' => $user->id],
                Roles::RENT_AUTHORITY => ['assistant_director_id' => $user->id],
                Roles::RENT_COURT => ['district_head_id' => $user->id],
                Roles::RENT_TRIBUNAL => ['rent_tribunal_id' => $user->id],
                default => [],
            };
            if (!empty($districtUpdate)) {
                District::where('id', $data['district_id'])->update($districtUpdate);
            }
        }

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

    public function destroy(Request $request, User $user)
    {
        $currentUser = $request->user();

        // Permission checks
        if ($currentUser->role === Roles::SUPER_ADMIN) {
            // Can delete anyone
        } elseif ($currentUser->role === Roles::DISTRICT_ADMIN) {
            if ($user->district_id !== $currentUser->district_id || !in_array($user->role, Roles::allStaff())) {
                return response()->json(['message' => 'Unauthorized deletion'], 403);
            }
        } elseif (in_array($currentUser->role, Roles::principals())) {
            $allowedRoles = match($currentUser->role) {
                Roles::RENT_AUTHORITY => [Roles::RA_ASSISTANT, Roles::VALUER],
                Roles::RENT_COURT => [Roles::RC_ASSISTANT],
                Roles::RENT_TRIBUNAL => [Roles::RT_ASSISTANT],
                default => [],
            };
            if ($user->district_id !== $currentUser->district_id || !in_array($user->role, $allowedRoles)) {
                return response()->json(['message' => 'Unauthorized deletion'], 403);
            }
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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
        $currentUser = $request->user();

        // Cannot deactivate your own account.
        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'You cannot change your own account status'], 403);
        }

        // Only a super admin can change another super admin's status.
        if ($user->role === Roles::SUPER_ADMIN && $currentUser->role !== Roles::SUPER_ADMIN) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // District admins and principals can only manage users within their own district.
        if ($currentUser->role !== Roles::SUPER_ADMIN
            && $user->district_id !== $currentUser->district_id) {
            return response()->json(['message' => 'User is outside your district'], 403);
        }

        $deactivating = !$user->is_blocked;

        // A reason is required when deactivating; activation clears it.
        if ($deactivating) {
            $data = $request->validate([
                'reason' => ['required', 'string', 'max:1000'],
            ]);
            $user->block_reason = $data['reason'];
        } else {
            $user->block_reason = null;
        }

        $user->is_blocked = $deactivating;
        $user->save();

        return response()->json([
            'user' => new UserResource($user->load(['office', 'designation', 'district'])),
        ]);
    }
}
