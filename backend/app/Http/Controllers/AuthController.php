<?php

namespace App\Http\Controllers;

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
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'phone' => ['required', 'string', 'max:30', 'unique:users,phone'],
            'state_id' => ['required', 'integer', 'exists:states,id'],
            'district_id' => ['required', 'integer', 'exists:districts,id'],
        ]);

        $districtMatchesState = District::where('id', $data['district_id'])
            ->where('state_id', $data['state_id'])
            ->exists();

        if (!$districtMatchesState) {
            return response()->json(['message' => 'Selected district does not belong to the state'], 422);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'role' => 'tenant owner',
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

            $user = User::where('phone', $validated['phone'])->first();
            if (!$user) {
                return response()->json(['message' => 'Invalid credentials'], 422);
            }

            Auth::login($user);
        } else {
            $credentials = [
                'phone' => $validated['phone'],
                'password' => $validated['password'],
            ];

            if (!Auth::attempt($credentials)) {
                return response()->json(['message' => 'Invalid credentials'], 422);
            }

            $user = $request->user();
        }

        if ($user->is_blocked) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json(['message' => 'Account is blocked'], 403);
        }
        if (
            !$user->approved_at &&
            $user->role !== User::ROLE_SYSTEM_ADMIN &&
            $user->role !== 'tenant owner'
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
}
