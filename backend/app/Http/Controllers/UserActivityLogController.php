<?php

namespace App\Http\Controllers;

use App\Models\UserActivityLog;
use Illuminate\Http\Request;

class UserActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = UserActivityLog::with('user')
            ->where('action', 'not like', 'GET %')
            ->orderByDesc('logged_at');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->filled('from')) {
            $query->where('logged_at', '>=', $request->input('from') . ' 00:00:00');
        }

        if ($request->filled('to')) {
            $query->where('logged_at', '<=', $request->input('to') . ' 23:59:59');
        }

        $logs = $query->paginate(10);

        return response()->json($logs);
    }
}
