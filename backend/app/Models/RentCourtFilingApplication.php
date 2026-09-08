<?php

namespace App\Models;

use App\Traits\GeneratesApplicationNo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RentCourtFilingApplication extends Model
{
    use SoftDeletes;

    use GeneratesApplicationNo;

    protected $casts = [
        'verification_personal_knowledge_paras' => 'array',
        'verification_legal_advice_paras' => 'array',
        'verified_on' => 'date',
        'edit_history' => 'array',
        'has_prior_proceedings' => 'boolean',
        'prior_proceedings' => 'array',
    ];

    protected $table = 'rent_court_form_5_applications';

    protected $fillable = [
        'application_no',
        'user_id',
        'rent_court_at',
        'tenancy_uin',

        'applicant_name',
        'applicant_residential_address',

        'respondent_name',
        'respondent_residential_address',

        'particulars_of_application',
        'jurisdiction_of_rent_court',
        'facts_of_case',
        'grounds_for_relief',
        'matters_not_previously_filed_or_pending',
        'has_prior_proceedings',
        'prior_proceedings',
        'relief_sought',
        'interim_order_sought',
        'list_of_enclosures',

        'verification_name',
        'verification_relation',
        'verification_relative_name',
        'verification_age',
        'verification_address',
        'verification_place',
        'verification_personal_knowledge_paras',
        'verification_legal_advice_paras',
        'verified_on',
        'verification_statement',

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

    /**
     * Sworn declarations accepted on this filing. Written once at submission and never edited, so
     * the wording a filer actually accepted stays reproducible.
     */
    public function attestations()
    {
        return $this->hasMany(FilingAttestation::class, 'application_id')
            ->where('application_type', \App\Constants\ApplicationTypes::RENT_COURT_FILING);
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

