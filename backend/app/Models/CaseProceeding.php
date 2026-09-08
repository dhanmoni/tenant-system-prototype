<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CaseProceeding extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'application_type',
        'application_id',
        'notice_type',
        'hearing_date',
        'hearing_time',
        'venue',
        'previous_hearing_date',
        'remarks',
        'additional_remarks',
        'sent_by_user_id',
    ];

    protected $casts = [
        'document_generated_at' => 'datetime',
        'signed_at' => 'datetime',
        'signature_metadata' => 'array',
    ];

    /**
     * Columns the browser has no use for and should not be given.
     *
     * The two *_path values address the private documents disk. They are not URLs and cannot be
     * fetched, but there is no reason to publish the storage layout, and signature_metadata holds
     * the operator's IP alongside the certificate detail - that belongs in the record and the
     * activity log, not in a list rendered to whoever opens the case.
     */
    protected $hidden = [
        'document_path',
        'signed_document_path',
        'signature_metadata',
    ];

    protected $appends = ['is_signed'];

    /**
     * Whether the issuing authority has affixed its digital signature.
     *
     * The one thing every screen needs to know about a proceeding: until this is true the notice is
     * a draft, it is not shown to the party, and the document itself says so on its face.
     */
    public function getIsSignedAttribute(): bool
    {
        return $this->signed_document_path !== null;
    }

    public function signedBy()
    {
        return $this->belongsTo(User::class, 'signed_by_user_id');
    }

    /**
     * Get the application this proceeding belongs to.
     */
    public function application()
    {
        return $this->morphTo();
    }

    /**
     * Get the user who sent/generated this proceeding.
     */
    public function sentBy()
    {
        return $this->belongsTo(User::class, 'sent_by_user_id');
    }
}
