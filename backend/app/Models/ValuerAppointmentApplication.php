<?php

namespace App\Models;

use App\Traits\GeneratesApplicationNo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ValuerAppointmentApplication extends Model
{
    use SoftDeletes;

    use GeneratesApplicationNo;

    protected $table = 'rent_authority_form_ib_applications';

    protected $fillable = [
        'application_no',
        'user_id',
        'tenancy_uin',
        'applicant_name',
        'applicant_relation_type',
        'applicant_relation_target_name',
        'applicant_resident_place',
        'applicant_landlord_or_tenant',
        'premises_situated_address',
        'district',
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

