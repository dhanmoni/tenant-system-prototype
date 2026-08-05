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
        'remarks',
        'sent_by_user_id',
    ];

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
