<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentCourtAppealApplication extends Model
{
    protected $fillable = [
        'application_no',
        'user_id',

        'rent_court_at',
        'tenancy_unique_identification_number',

        'appellant_name',
        'appellant_residential_address',

        'respondent_name',
        'respondent_residential_address',

        'order_particulars_against_which_appeal_made',
        'jurisdiction_of_rent_court',
        'limitation',
        'memorandum_of_appeal',
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

