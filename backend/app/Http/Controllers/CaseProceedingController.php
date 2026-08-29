<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CaseProceeding;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\ApplicationWorkflowController;

class CaseProceedingController extends Controller
{
    /**
     * Get all proceedings for a given application.
     */
    public function index($type, $id)
    {
        // For security, ideally we should verify user role and access to this application.
        // Assuming middleware handles basic auth.

        $proceedings = CaseProceeding::where('application_type', $type)
            ->where('application_id', $id)
            ->with('sentBy:id,name,role')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'proceedings' => $proceedings
        ]);
    }

    /**
     * Get all proceedings for a given application (Citizen).
     */
    public function citizenIndex(Request $request, $type, $id)
    {
        $appController = new \App\Http\Controllers\ApplicationWorkflowController();
        $modelClass = $appController->getModel($type);
        if (!$modelClass) {
            return response()->json(['message' => 'Invalid application type'], 400);
        }

        $application = $modelClass::find($id);
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        if ($application->user_id != $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $proceedings = CaseProceeding::where('application_type', $type)
            ->where('application_id', $id)
            ->with('sentBy:id,name,role')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'proceedings' => $proceedings
        ]);
    }

    /**
     * Store a new case proceeding/notice.
     */
    public function store(Request $request, $type, $id)
    {
        $request->validate([
            'notice_type' => 'required|string|in:appearance,applicant_absent,respondent_absent,adjournment,proceeding_sheet,final_order,ex_parte',
            'hearing_date' => 'nullable|date',
            'hearing_time' => 'nullable|date_format:H:i',
            'venue' => 'nullable|string',
            'remarks' => 'nullable|string',
            'additional_remarks' => 'nullable|string',
        ]);

        // Find the application class based on type
        // Wait, $type here might be the route slug like "rent-tribunal-appeal"
        // Let's resolve to internal model name or just store the slug as application_type
        
        $proceeding = CaseProceeding::create([
            'application_type' => $type,
            'application_id' => $id,
            'notice_type' => $request->notice_type,
            'hearing_date' => $request->hearing_date,
            'hearing_time' => $request->hearing_time,
            'venue' => $request->venue,
            'remarks' => $request->remarks,
            'additional_remarks' => $request->additional_remarks,
            'sent_by_user_id' => $request->user()->id,
        ]);

        // TODO: Send email to the involved parties
        // MailService::sendNoticeEmail($proceeding);

        return response()->json([
            'message' => 'Proceeding added successfully',
            'proceeding' => $proceeding->load('sentBy:id,name,role')
        ], 201);
    }
}
