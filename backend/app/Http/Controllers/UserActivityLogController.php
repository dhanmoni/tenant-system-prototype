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

        if ($request->filled('q')) {
            $needle = $request->input('q');
            $query->where(function ($inner) use ($needle) {
                $inner->where('action', 'like', '%' . $needle . '%')
                    ->orWhere('ip_address', 'like', '%' . $needle . '%')
                    ->orWhereHas('user', function ($userQuery) use ($needle) {
                        $userQuery->where('name', 'like', '%' . $needle . '%')
                            ->orWhere('email', 'like', '%' . $needle . '%');
                    });
            });
        }

        $perPage = min(50, max(5, (int) $request->input('per_page', 15)));
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }
}
