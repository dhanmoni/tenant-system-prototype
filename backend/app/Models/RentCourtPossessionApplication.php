<?php

namespace App\Models;

use App\Traits\GeneratesApplicationNo;

use Illuminate\Database\Eloquent\Model;

class RentCourtPossessionApplication extends Model
{
    use GeneratesApplicationNo;

    protected $table = 'rent_court_form_4_applications';

    protected $fillable = [
        'application_no',
        'user_id',
        'before_rent_court',

        'applicant_name',
        'applicant_residential_address',

        'tenancy_uin',
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
        'district_id',
        'forwarded_at',
        'forwarded_by_user_id',
        'rejected_at',
        'rejected_by_user_id',
        'rejection_message',
        'assigned_to_role',
    ];

    public function getRouteKeyName()
    {
        return 'application_no';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function forwardedBy()
    {
        return $this->belongsTo(User::class, 'forwarded_by_user_id');
    }

    public function rejectedBy()
    {
        return $this->belongsTo(User::class, 'rejected_by_user_id');
    }
}

