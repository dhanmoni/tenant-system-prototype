<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'tenant owner') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user->load(['district.state']);

        return response()->json(['user' => $user]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'tenant owner') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'profile_type' => ['required', 'string', 'in:landlord,tenant'],
            'address' => ['required', 'string', 'max:500'],
            'pin_code' => ['required', 'regex:/^[0-9]{6}$/'],
            'pan_card' => ['required', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/i'],
            'passport_photo' => [
                Rule::requiredIf(!$user->user_passport_photo_path),
                'file',
                'image',
                'mimes:jpg,jpeg,png',
                'max:2048',
            ],
        ]);

        $user->profile_type = $data['profile_type'];
        $user->address = $data['address'];
        $user->pin_code = $data['pin_code'];
        $user->pan_card = strtoupper($data['pan_card']);

        if ($request->hasFile('passport_photo')) {
            if ($user->user_passport_photo_path) {
                Storage::disk('public')->delete($user->user_passport_photo_path);
            }
            $path = $request->file('passport_photo')->store('profile-photos', 'public');
            $user->user_passport_photo_path = $path;
        }

        $user->save();

        $user->load(['district.state']);

        return response()->json(['user' => $user]);
    }
}
