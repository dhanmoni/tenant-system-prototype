<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\DistrictController;
use App\Http\Controllers\OfficeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StateController;
use App\Http\Controllers\TenancyApplicationController;
use App\Http\Controllers\UserActivityLogController;
use App\Http\Controllers\UserManagementController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/public/states', [StateController::class, 'publicIndex']);
Route::get('/public/districts', [DistrictController::class, 'publicIndex']);
Route::get('/public/offices', [OfficeController::class, 'publicIndex']);
Route::post('/tenancy-applications', [TenancyApplicationController::class, 'store']);
Route::get('/tenancy-applications/{tenancyApplication}/receipt', [TenancyApplicationController::class, 'receipt']);
Route::get('/tenancy-applications/{tenancyApplication}/application-details', [TenancyApplicationController::class, 'applicationDetails']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tenancy-applications/my', [TenancyApplicationController::class, 'myApplications']);
    Route::get('/tenancy-applications/{tenancyApplication}', [TenancyApplicationController::class, 'show']);
    Route::put('/tenancy-applications/{tenancyApplication}', [TenancyApplicationController::class, 'update']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // State and District: allowed for system_admin and staff (director, assistant_director, district_head, district_assistant)
    Route::middleware('role:system_admin,director,assistant_director,district_head,district_assistant')->group(function () {
        Route::get('/states', [StateController::class, 'index']);
        Route::post('/states', [StateController::class, 'store']);
        Route::put('/states/{state}', [StateController::class, 'update']);
        Route::delete('/states/{state}', [StateController::class, 'destroy']);
        Route::get('/districts', [DistrictController::class, 'index']);
        Route::post('/districts', [DistrictController::class, 'store']);
        Route::put('/districts/{district}', [DistrictController::class, 'update']);
        Route::delete('/districts/{district}', [DistrictController::class, 'destroy']);
        Route::post('/districts/{district}/assign-assistant-director', [DistrictController::class, 'assignAssistantDirector']);
        Route::post('/districts/{district}/assign-district-head', [DistrictController::class, 'assignDistrictHead']);
    });

    // User Management (read, update, delete) + read-only offices/designations/roles for staff and admin
    Route::middleware('role:system_admin,director,assistant_director,district_head,district_assistant')->group(function () {
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::get('/users/{user}', [UserManagementController::class, 'show']);
        Route::put('/users/{user}', [UserManagementController::class, 'update']);
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy']);
        Route::get('/offices', [OfficeController::class, 'index']);
        Route::get('/designations', [DesignationController::class, 'index']);
        Route::get('/roles', [RoleController::class, 'index']);
    });

    // Staff dashboard statistics (counts + applications scoped by user/office)
    Route::middleware('role:director,assistant_director,district_head,district_assistant')->group(function () {
        Route::get('/staff-dashboard-stats', [DashboardController::class, 'staffStats']);
    });

    Route::middleware('role:system_admin')->group(function () {
        Route::get('/dashboard-stats', [DashboardController::class, 'stats']);
        Route::post('/users', [UserManagementController::class, 'store']);
        Route::post('/users/{user}/approve', [UserManagementController::class, 'approve']);
        Route::post('/users/{user}/toggle-block', [UserManagementController::class, 'toggleBlock']);
        Route::get('/activity-logs', [UserActivityLogController::class, 'index']);
        Route::post('/designations', [DesignationController::class, 'store']);
        Route::put('/designations/{designation}', [DesignationController::class, 'update']);
        Route::delete('/designations/{designation}', [DesignationController::class, 'destroy']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::put('/roles/{role}', [RoleController::class, 'update']);
        Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
        Route::post('/offices', [OfficeController::class, 'store']);
        Route::put('/offices/{office}', [OfficeController::class, 'update']);
        Route::delete('/offices/{office}', [OfficeController::class, 'destroy']);
    });
});
