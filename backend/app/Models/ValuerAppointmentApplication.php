<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValuerAppointmentApplication extends Model
{
    protected $fillable = [
        'application_no',
        'user_id',
        'rent_authority_uid',
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

