<?php

namespace App\Models;

use App\Traits\GeneratesApplicationNo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RentTribunalAppealApplication extends Model
{
    use SoftDeletes;

    use GeneratesApplicationNo;

    protected $table = 'rent_tribunal_form_8_applications';

    protected $fillable = [
        'application_no',
        'user_id',

        'rent_tribunal_at',
        'tenancy_uin',

        'appellant_name',
        'appellant_residential_address',

        'respondent_name',
        'respondent_residential_address',

        'order_particulars_against_which_appeal_made',
        'jurisdiction_of_rent_tribunal',
        'limitation',
        'memorandum_of_appeal',
        'matters_not_previously_filed_or_pending',

        'relief_sought',
        'interim_order_sought',
        'list_of_enclosures',

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
        'forward_remarks',
        'approved_at',
        'approved_by_user_id',
        'approval_message',
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

