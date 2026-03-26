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

        $userData = $user->toArray();
        if (!empty($user->passport_photo_path)) {
            $userData['passport_photo_url'] = url('storage/' . $user->passport_photo_path);
        }

        return response()->json(['user' => $userData]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'tenant owner') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'profile_type' => ['nullable', 'string', 'in:landlord,tenant'],
            'address' => ['required', 'string', 'max:500'],
            'pin_code' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
            'pan_card' => ['required', 'string', 'size:10', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/i'],
            'passport_photo' => [
                Rule::requiredIf(!$user->passport_photo_path),
                'nullable',
                'file',
                'image',
                'mimes:jpg,jpeg,png',
                'max:2048',
            ],
        ], [
            'profile_type.in' => 'Profile type must be Landlord or Tenant.',
            'address.required' => 'Address is required.',
            'address.max' => 'Address must not exceed 500 characters.',
            'pin_code.required' => 'PIN code is required.',
            'pin_code.size' => 'PIN code must be exactly 6 digits.',
            'pin_code.regex' => 'PIN code must be exactly 6 digits (numbers only).',
            'pan_card.required' => 'PAN card number is required.',
            'pan_card.size' => 'PAN must be 10 characters (e.g. ABCDE1234F).',
            'pan_card.regex' => 'PAN must be valid format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).',
            'passport_photo.required' => 'Passport size photograph is required.',
            'passport_photo.image' => 'Passport photo must be an image (JPEG or PNG).',
            'passport_photo.mimes' => 'Passport photo must be JPEG or PNG.',
            'passport_photo.max' => 'Passport photo must not exceed 2 MB.',
        ]);

        if (array_key_exists('profile_type', $data) && !is_null($data['profile_type'])) {
            $user->profile_type = $data['profile_type'];
        }
        $user->address = $data['address'];
        $user->pin_code = $data['pin_code'];
        $user->pan_card = strtoupper($data['pan_card']);

        if ($request->hasFile('passport_photo')) {
            if ($user->passport_photo_path) {
                Storage::disk('public')->delete($user->passport_photo_path);
            }
            $path = $request->file('passport_photo')->store('profile-photos', 'public');
            $user->passport_photo_path = $path;
        }

        $user->save();

        $user->load(['district.state']);

        $userData = $user->toArray();
        if (!empty($user->passport_photo_path)) {
            $userData['passport_photo_url'] = url('storage/' . $user->passport_photo_path);
        }

        return response()->json(['user' => $userData]);
    }
}
