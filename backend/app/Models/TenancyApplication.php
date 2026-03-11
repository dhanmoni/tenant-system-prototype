<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenancyApplication extends Model
{
    protected $casts = [
        'movement_history' => 'array',
    ];

    protected $fillable = [
        'application_no',
        'user_id',
        'application_type',
        'registration_date',
        'office_id',
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
    ];

    public function office()
    {
        return $this->belongsTo(\App\Models\Office::class);
    }
}
