<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentCourtFilingApplication extends Model
{
    protected $fillable = [
        'application_no',
        'user_id',
        'rent_court_at',
        'tenancy_unique_identification_number',

        'applicant_name',
        'applicant_residential_address',

        'respondent_name',
        'respondent_residential_address',

        'particulars_of_application',
        'jurisdiction_of_rent_court',
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

