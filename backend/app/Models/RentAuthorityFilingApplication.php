<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentAuthorityFilingApplication extends Model
{
    protected $fillable = [
        'application_no',
        'user_id',
        'rent_authority_uid',

        'applicant_name',
        'applicant_residential_address',
        'opposite_party_name',
        'opposite_party_residential_address',

        'particulars_of_violation',
        'jurisdiction_of_rent_authority',
        'facts_of_case',
        'grounds_for_relief',
        'matters_not_previously_filed_or_pending',
        'relief_sought',
        'interim_order_sought',
        'list_of_enclosures',

        'signature_name',
        'signature_image_path',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

