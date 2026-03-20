<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class TenancyApplication extends Model
{
    protected $casts = [
        'movement_history' => 'array',
        'initiator_completed' => 'boolean',
        'second_party_completed' => 'boolean',
    ];

    protected $fillable = [
        'application_no',
        'ref_code',
        'user_id',
        'initiator_role',
        'initiator_completed',
        'second_party_completed',
        'landlord_user_id',
        'tenant_user_id',
        'application_type',
        'registration_date',
        'office_id',
        'village_ward_id',
        'apply_type',
        'status',
        'current_with',
        'movement_history',
        'landlord_name',
        'landlord_address',
        'landlord_email',
        'landlord_phone',
        'landlord_pan',
        'manager_name',
        'manager_address',
        'manager_email',
        'manager_phone',
        'manager_pan',
        'tenant_name',
        'tenant_address',
        'tenant_email',
        'tenant_phone',
        'tenant_pan',
        'tenant_previous_tenancy',
        'property_possession_date',
        'property_rent_payable',
        'property_premises_description',
        'property_furniture_description',
        'property_charge_electricity',
        'property_charge_water',
        'property_charge_furnishing',
        'property_charge_other_services',
        'property_tenancy_duration',
        'agreement_pdf_path',
        'landlord_photo_path',
        'landlord_signature_path',
        'tenant_photo_path',
        'tenant_signature_path',
        'uid',
    ];

    public function office()
    {
        return $this->belongsTo(Office::class);
    }

    public function villageWard()
    {
        return $this->belongsTo(VillageWard::class);
    }

    public function landlordUser()
    {
        return $this->belongsTo(User::class, 'landlord_user_id');
    }

    public function tenantUser()
    {
        return $this->belongsTo(User::class, 'tenant_user_id');
    }

    public function isFullyCompleted(): bool
    {
        return $this->initiator_completed && $this->second_party_completed;
    }

    /**
     * Generate a deterministic reference code from the core agreement details.
     * Same inputs always produce the same code.
     */
    public static function generateRefCode(
        string $landlordPhone,
        string $tenantPhone,
        string $registrationDate,
        $villageWardId
    ): string {
        // Normalize inputs
        $landlordPhone = preg_replace('/[^0-9]/', '', $landlordPhone);
        $tenantPhone = preg_replace('/[^0-9]/', '', $tenantPhone);
        // Strip leading country code (91 for India) if present
        if (strlen($landlordPhone) > 10 && str_starts_with($landlordPhone, '91')) {
            $landlordPhone = substr($landlordPhone, 2);
        }
        if (strlen($tenantPhone) > 10 && str_starts_with($tenantPhone, '91')) {
            $tenantPhone = substr($tenantPhone, 2);
        }
        // Normalize date to Y-m-d
        $registrationDate = date('Y-m-d', strtotime($registrationDate));
        $villageWardId = (string) $villageWardId;

        $input = implode('|', [$landlordPhone, $tenantPhone, $registrationDate, $villageWardId]);

        $hashBytes = hash('sha256', $input, true);
        $alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        $refCode = '';
        
        // Take 16 bits (0-65535) at a time for uniform distribution
        for ($i = 0; $i < 8; $i++) {
            $val = (ord($hashBytes[$i * 2]) << 8) | ord($hashBytes[$i * 2 + 1]);
            $refCode .= $alphabet[$val % 58];
        }

        return $refCode;
    }

    /**
     * Generate a unique incremental tenancy UID when both parties have completed.
     */
    public static function generateUid($villageWard = null): string
    {
        $stateCode = $villageWard?->district?->state?->code ?? 'AS';
        $prefix = 'TC-' . strtoupper(substr($stateCode, 0, 2)) . '-' . date('ym');
        
        $latest = self::where('uid', 'like', $prefix . '-%')
            ->orderByDesc('uid')
            ->lockForUpdate()
            ->first();

        $count = 1;
        if ($latest) {
            $lastParts = explode('-', $latest->uid);
            $lastNumber = intval(end($lastParts));
            $count = $lastNumber + 1;
        }

        return $prefix . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);
    }
}
