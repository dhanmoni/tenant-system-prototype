<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        // Common fields to exclude from dynamic attributes
        $commonFields = [
            'id', 'application_no', 'user_id', 'status', 'created_at', 'updated_at', 
            'district_id', 'forwarded_at', 'forwarded_by_user_id', 'rejected_at', 
            'rejected_by_user_id', 'rejection_message', 'assigned_to_role', 
            'approved_at', 'approved_by_user_id', 'forward_remarks', 'approval_message',
            'edit_history', 'cancelled_at', 'cancelled_by_user_id', 'cancellation_reason',
        ];
        
        // Get all attributes of the model
        $attributes = $this->resource->getAttributes();
        
        // Filter out common fields to get specific fields
        $specificFields = array_diff_key($attributes, array_flip($commonFields));

        return array_merge([
            'id' => $this->id,
            'application_no' => $this->application_no,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'forwarded_at' => $this->forwarded_at,
            'rejected_at' => $this->rejected_at,
            'approved_at' => $this->approved_at,
            'rejection_message' => $this->rejection_message,
            'approval_message' => $this->approval_message,
            'forward_remarks' => $this->forward_remarks,
            'cancelled_at' => $this->cancelled_at ?? null,
            'cancellation_reason' => $this->cancellation_reason ?? null,
            'assigned_to_role' => $this->assigned_to_role,
            'district_id' => $this->district_id,
            'form_type' => $this->form_type ?? $this->resource->form_type, // Fallback if not set
            'edit_history' => $this->edit_history ?? [],
            
            // Trimmed relationships (only included if loaded)
            'user' => $this->whenLoaded('user', function() {
                return [
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'phone' => $this->user->phone,
                ];
            }),
            
            'district' => $this->whenLoaded('district', function() {
                $rel = $this->getRelation('district');
                return [
                    'id' => $rel ? $rel->id : null,
                    'name' => $rel ? $rel->name : null,
                ];
            }),

            'office' => $this->whenLoaded('office', function () {
                $rel = $this->getRelation('office');
                return [
                    'id' => $rel ? $rel->id : null,
                    'name' => $rel ? $rel->name : null,
                ];
            }),

            'village_ward' => $this->whenLoaded('villageWard', function () {
                $rel = $this->getRelation('villageWard');
                return [
                    'id' => $rel ? $rel->id : null,
                    'name' => $rel ? $rel->name : null,
                ];
            }),
            
            'forwarded_by' => $this->whenLoaded('forwardedBy', function() {
                return [
                    'name' => $this->forwardedBy->name,
                    'role' => $this->forwardedBy->role,
                ];
            }),
            
            'rejected_by' => $this->whenLoaded('rejectedBy', function() {
                return [
                    'name' => $this->rejectedBy->name,
                ];
            }),
            
            'approved_by' => $this->whenLoaded('approvedBy', function() {
                return [
                    'name' => $this->approvedBy->name,
                ];
            }),

            'cancelled_by' => $this->whenLoaded('cancelledBy', function() {
                if (!$this->cancelledBy) {
                    return null;
                }
                return [
                    'name' => $this->cancelledBy->name,
                ];
            }),

            'assigned_valuer' => $this->whenLoaded('assignedValuer', function () {
                if (!$this->assignedValuer) {
                    return null;
                }

                return [
                    'id' => $this->assignedValuer->id,
                    'name' => $this->assignedValuer->name,
                    'email' => $this->assignedValuer->email,
                    'phone' => $this->assignedValuer->phone,
                ];
            }),
        ], $specificFields);
    }
}
