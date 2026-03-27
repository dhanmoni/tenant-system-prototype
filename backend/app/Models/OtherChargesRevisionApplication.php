<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtherChargesRevisionApplication extends Model
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
        'existing_other_charges_details',
        'proposed_other_charges_details',
        'reason_for_other_charges_revision',
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

