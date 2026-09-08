<?php

namespace App\Models;

use App\Support\DocumentStore;
use Illuminate\Database\Eloquent\Model;

/**
 * One document filed with a service form.
 *
 * Written at submission and not edited afterwards. If a filer needs to replace an enclosure, that
 * is a new row and a decision for the forum, not a silent overwrite: what was on the file when the
 * Rent Court or Rent Tribunal read it has to stay reconstructible.
 *
 * `file_path` addresses the private documents disk and is not an address on its own. `url` is a signed,
 * expiring link minted per response by DocumentStore; it is appended here so that every response
 * carrying an enclosure carries the way to open it, and none carries a permanent one.
 */
class FilingEnclosure extends Model
{
    protected $table = 'filing_enclosures';

    protected $fillable = [
        'application_type',
        'application_id',
        'kind',
        'label',
        'provision_refs',
        'prior_proceeding_index',
        'file_path',
        'original_name',
        'mime_type',
        'size_bytes',
        'uploaded_by_user_id',
        'uploaded_at',
    ];

    protected $casts = [
        'provision_refs' => 'array',
        'prior_proceeding_index' => 'integer',
        'size_bytes' => 'integer',
        'uploaded_at' => 'datetime',
    ];

    protected $appends = ['url'];

    /** The signed, expiring link to this document. Null once the file is gone. */
    public function getUrlAttribute(): ?string
    {
        return DocumentStore::url(
            DocumentStore::ENCLOSURE_SCOPE,
            $this->getKey(),
            'file_path',
            $this->file_path
        );
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    /** Everything filed with one application, in the order it was attached. */
    public static function forApplication(string $applicationType, $applicationId)
    {
        return static::where('application_type', $applicationType)
            ->where('application_id', $applicationId)
            ->orderBy('id')
            ->get();
    }
}
