<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class State extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function districts()
    {
        return $this->hasMany(District::class);
    }

    public function offices()
    {
        return $this->hasMany(Office::class);
    }
}
