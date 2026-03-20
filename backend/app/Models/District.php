<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'state_id',
        'assistant_director_id',
        'district_head_id',
    ];

    public function assistantDirector()
    {
        return $this->belongsTo(User::class, 'assistant_director_id');
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function districtHead()
    {
        return $this->belongsTo(User::class, 'district_head_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function offices()
    {
        return $this->hasMany(Office::class);
    }

    public function villageWards()
    {
        return $this->hasMany(VillageWard::class);
    }
}
