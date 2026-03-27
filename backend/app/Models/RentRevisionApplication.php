<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentRevisionApplication extends Model
{
    protected $fillable = [
        'application_no',
        'user_id',
        'rent_authority_uid',
        'tenancy_agreement_document_no',
        'landlord_name',
        'landlord_address',
        'tenant_name',
        'tenant_address',
        'manager_name',
        'manager_address',
        'rented_premises_description',
        'present_monthly_rent',
        'proposed_monthly_rent',
        'reason_for_rent_revision',
        'signed_by',
        'signature_name',
        'signature_image_path',
        'status',
    ];

    public function getRouteKeyName()
    {
        return 'application_no';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

