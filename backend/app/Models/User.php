<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Constants\Roles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_SUPER_ADMIN = Roles::SUPER_ADMIN;
    public const ROLE_DISTRICT_ADMIN = Roles::DISTRICT_ADMIN;
    public const ROLE_RENT_AUTHORITY = Roles::RENT_AUTHORITY;
    public const ROLE_RENT_COURT = Roles::RENT_COURT;
    public const ROLE_RENT_TRIBUNAL = Roles::RENT_TRIBUNAL;
    public const ROLE_RA_ASSISTANT = Roles::RA_ASSISTANT;
    public const ROLE_RC_ASSISTANT = Roles::RC_ASSISTANT;
    public const ROLE_RT_ASSISTANT = Roles::RT_ASSISTANT;
    public const ROLE_USER = Roles::USER;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'role',
        'district_id',
        'office_id',
        'designation_id',
        'phone',
        'profile_type',
        'address',
        'pin_code',
        'pan_card',
        'passport_photo_path',
        'approved_at',
        'approved_by_user_id',
        'is_blocked',
        'reports_to_user_id',
        'password',
        'email_verified_at',
        'remember_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'approved_at' => 'datetime',
        'is_blocked' => 'boolean',
    ];

    public static function roles(): array
    {
        return [
            self::ROLE_SUPER_ADMIN,
            self::ROLE_DISTRICT_ADMIN,
            self::ROLE_RENT_AUTHORITY,
            self::ROLE_RENT_COURT,
            self::ROLE_RENT_TRIBUNAL,
            self::ROLE_RA_ASSISTANT,
            self::ROLE_RC_ASSISTANT,
            self::ROLE_RT_ASSISTANT,
            self::ROLE_USER,
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isDistrictAdmin(): bool
    {
        return $this->role === self::ROLE_DISTRICT_ADMIN;
    }

    public function isAssistant(): bool
    {
        return in_array($this->role, Roles::assistants());
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function reportsTo()
    {
        return $this->belongsTo(User::class, 'reports_to_user_id');
    }

    public function office()
    {
        return $this->belongsTo(Office::class);
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function directReports()
    {
        return $this->hasMany(User::class, 'reports_to_user_id');
    }

    public function managedDistricts()
    {
        return $this->hasMany(District::class, 'assistant_director_id');
    }

    public function headedDistricts()
    {
        return $this->hasMany(District::class, 'district_head_id');
    }
}
