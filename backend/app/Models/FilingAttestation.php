<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * One sworn declaration accepted on a service form.
 *
 * Rows are written once, at submission, and are not edited afterwards: the point of the record is
 * that it reproduces what the filer actually accepted. If a declaration has to be re-taken, write a
 * new row rather than amending an old one.
 */
class FilingAttestation extends Model
{
    protected $table = 'filing_attestations';

    protected $fillable = [
        'application_type',
        'application_id',
        'field_id',
        'text_snapshot',
        'provision_refs',
        'values',
        'accepted',
        'accepted_at',
        'accepted_by_user_id',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'provision_refs' => 'array',
        'values' => 'array',
        'accepted' => 'boolean',
        'accepted_at' => 'datetime',
    ];

    public function acceptedBy()
    {
        return $this->belongsTo(User::class, 'accepted_by_user_id');
    }
}
