<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentCourtPossessionApplication extends Model
{
    protected $fillable = [
        'application_no',
        'user_id',
        'before_rent_court',

        'applicant_name',
        'applicant_residential_address',

        'tenant_unique_identification_number',
        'tenant_name',

        'jurisdiction_statement',
        'facts_of_case',
        'grounds_for_relief',
        'matters_not_previously_filed',
        'relief_sought',
        'interim_order_sought',
        'enclosures_list',

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

