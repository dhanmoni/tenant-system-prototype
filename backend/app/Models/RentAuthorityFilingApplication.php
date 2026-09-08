<?php

namespace App\Models;

use App\Traits\GeneratesApplicationNo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RentAuthorityFilingApplication extends Model
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
        'repair_items' => 'array',
        'essential_services' => 'array',
    ];

    protected $table = 'rent_authority_form_6_applications';

    protected $fillable = [
        'application_no',
        'user_id',
        'tenancy_uin',

        'applicant_name',
        'applicant_residential_address',
        'opposite_party_name',
        'opposite_party_residential_address',

        // Rule 11(1): which of Act ss. 10, 14, 15 or 20 the application is made under, with the
        // Second Schedule items (s. 15) or essential services (s. 20) in dispute.
        'statutory_matter',
        'repair_items',
        'essential_services',
        'essential_service_other',

        'particulars_of_violation',
        'jurisdiction_of_rent_authority',
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
            ->where('application_type', \App\Constants\ApplicationTypes::RENT_AUTHORITY_FILING);
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

