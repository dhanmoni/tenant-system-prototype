<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VillageWard extends Model
{
    protected $fillable = [
        'name',
        'type', 'area_type', 'local_body',
        'district_id',
        'villages',
    ];

    protected $casts = [
        'villages' => 'array',
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
