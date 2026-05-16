<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'phone' => $this->phone,
            'district_id' => $this->district_id,
            'office_id' => $this->office_id,
            'designation_id' => $this->designation_id,
            'reports_to_user_id' => $this->reports_to_user_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relations (only if loaded)
            'office' => $this->whenLoaded('office', function() {
                return [
                    'id' => $this->office->id,
                    'name' => $this->office->name,
                ];
            }),
            'designation' => $this->whenLoaded('designation', function() {
                return [
                    'id' => $this->designation->id,
                    'name' => $this->designation->title ?? $this->designation->name,
                ];
            }),
            'district' => $this->whenLoaded('district', function() {
                return [
                    'id' => $this->district->id,
                    'name' => $this->district->name,
                ];
            }),
        ];
    }
}
