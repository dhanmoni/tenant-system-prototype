<?php

namespace App\Models;

use App\Traits\GeneratesApplicationNo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RentRevisionApplication extends Model
{
    use SoftDeletes;

    use GeneratesApplicationNo;

    protected $table = 'rent_authority_form_i_applications';

    protected $fillable = [
        'application_no',
        'user_id',
        'tenancy_uin',
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

