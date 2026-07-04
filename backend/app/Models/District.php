<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class District extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'is_active',
        'deactivation_reason',
        'state_id',
        'assistant_director_id', // Rent Authority
        'district_head_id',      // Rent Court
        'rent_tribunal_id',
        'district_admin_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function assistantDirector()
    {
        return $this->belongsTo(User::class, 'assistant_director_id');
    }

    public function rentAuthority()
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

    public function rentCourt()
    {
        return $this->belongsTo(User::class, 'district_head_id');
    }

    public function rentTribunal()
    {
        return $this->belongsTo(User::class, 'rent_tribunal_id');
    }

    public function districtAdmin()
    {
        return $this->belongsTo(User::class, 'district_admin_id');
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
