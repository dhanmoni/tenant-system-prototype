<?php

namespace App\Http\Controllers;

use Illuminate\Validation\Rule;

use App\Models\District;
use App\Models\UserActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:Male,Female,Other'],
            'date_of_birth' => ['required', 'date', 'after:1900-01-01', 'before_or_equal:today'],
            'email' => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('users')->where(fn ($query) => $query->where('role', 'user'))
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'phone' => [
                'required', 'string', 'regex:/^[0-9]{10}$/',
                Rule::unique('users')->where(fn ($query) => $query->where('role', 'user'))
            ],
            'district_id' => ['required', 'integer', 'exists:districts,id'],
        ]);



        $user = User::create([
            'name' => $data['name'],
            'gender' => $data['gender'],
            'date_of_birth' => $data['date_of_birth'],
            'email' => $data['email'],
            'role' => 'user',
            'district_id' => $data['district_id'],
            'phone' => $data['phone'],
            'approved_at' => now(),
            'password' => Hash::make($data['password'] ?? Str::random(16)),
            'email_verified_at' => now(),
            'remember_token' => Str::random(60),
        ]);

        // In this prototype, registration is a two-step flow:
        // 1) create account, 2) verify OTP and then login.
        return response()->json(['user' => $user, 'otp_required' => true], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'phone' => ['required', 'string'],
            'password' => ['nullable', 'string', 'required_without:otp'],
            'otp' => ['nullable', 'string', 'required_without:password'],
        ]);

        $user = null;
        $otp = (string) ($validated['otp'] ?? '');

        if ($otp !== '') {
            if ($otp !== '123456') {
                return response()->json(['message' => 'Invalid OTP'], 422);
            }

            $users = User::where('phone', $validated['phone'])->get();
            if ($users->isEmpty()) {
                return response()->json(['message' => 'Invalid credentials'], 422);
            }

            // Find last active user among them
            $lastActiveUserId = UserActivityLog::whereIn('user_id', $users->pluck('id'))
                ->where('action', 'login')
                ->orderByDesc('logged_at')
                ->value('user_id');

            $user = $lastActiveUserId ? $users->firstWhere('id', $lastActiveUserId) : $users->first();

            Auth::login($user);
        } else {
            $users = User::where('phone', $validated['phone'])->get();
            if ($users->isEmpty()) {
                return response()->json(['message' => 'Invalid credentials'], 422);
            }

            $matchedUser = null;
            foreach ($users as $u) {
                if (Hash::check($validated['password'], $u->password)) {
                    $matchedUser = $u;
                    break;
                }
            }

            if (!$matchedUser) {
                return response()->json(['message' => 'Invalid credentials'], 422);
            }

            $lastActiveUserId = UserActivityLog::whereIn('user_id', $users->pluck('id'))
                ->where('action', 'login')
                ->orderByDesc('logged_at')
                ->value('user_id');

            $user = $lastActiveUserId ? $users->firstWhere('id', $lastActiveUserId) : $users->first();
            Auth::login($user);
        }

        if ($user->is_blocked) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json(['message' => 'Account is blocked'], 403);
        }
        if (
            !$user->approved_at &&
            $user->role !== User::ROLE_SUPER_ADMIN &&
            $user->role !== 'user'
        ) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json(['message' => 'Account pending approval'], 403);
        }

        $request->session()->regenerate();

        UserActivityLog::create([
            'user_id' => $user->id,
            'session_id' => $request->session()->getId(),
            'action' => 'login',
            'ip_address' => $request->ip(),
            'ip_location' => null,
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
            'meta' => null,
            'logged_at' => now(),
        ]);

        return response()->json(['user' => $user]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            UserActivityLog::create([
                'user_id' => $user->id,
                'session_id' => $request->session()->getId(),
                'action' => 'logout',
                'ip_address' => $request->ip(),
                'ip_location' => null,
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
                'meta' => null,
                'logged_at' => now(),
            ]);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    public function userProfiles(Request $request)
    {
        $user = $request->user();
        $profiles = User::where('phone', $user->phone)
            ->where('is_blocked', false)
            ->get();

        return response()->json(['profiles' => $profiles]);
    }

    public function switchProfile(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer']
        ]);

        $currentUser = $request->user();
        $targetUser = User::where('id', $validated['user_id'])
            ->where('phone', $currentUser->phone)
            ->first();

        if (!$targetUser) {
            return response()->json(['message' => 'Profile not found or unauthorized.'], 403);
        }

        if ($targetUser->is_blocked) {
            return response()->json(['message' => 'Target account is blocked.'], 403);
        }

        // Switch the authenticated user without invalidating the entire session
        // which would cause concurrent frontend requests to fail with 401.
        Auth::guard('web')->login($targetUser);

        UserActivityLog::create([
            'user_id' => $targetUser->id,
            'session_id' => $request->session()->getId(),
            'action' => 'login', // Log as login to update last active
            'ip_address' => $request->ip(),
            'ip_location' => null,
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
            'meta' => null,
            'logged_at' => now(),
        ]);

        return response()->json(['user' => $targetUser, 'message' => 'Profile switched successfully.']);
    }
}

