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
use App\Http\Controllers\RentRevisionApplicationController;
use App\Http\Controllers\OtherChargesRevisionApplicationController;
use App\Http\Controllers\ValuerAppointmentApplicationController;
use App\Http\Controllers\RentCourtPossessionApplicationController;
use App\Http\Controllers\RentCourtFilingApplicationController;
use App\Http\Controllers\RentAuthorityFilingApplicationController;
use App\Http\Controllers\RentCourtAppealApplicationController;
use App\Http\Controllers\RentTribunalAppealApplicationController;
use App\Http\Controllers\TenancyApplicationController;
use App\Http\Controllers\TenantFormsStatusController;
use App\Http\Controllers\UserActivityLogController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\VillageWardController;
use App\Http\Controllers\ApplicationWorkflowController;
use App\Constants\Roles;

$allStaffRoles = implode(',', Roles::allStaff());
$principalRoles = implode(',', Roles::principals());
$adminRoles = implode(',', Roles::allAdmin());
$managementRoles = implode(',', Roles::allManagement());
$allAdminStaffRoles = implode(',', array_merge(Roles::allAdmin(), Roles::allStaff()));

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/public/states', [StateController::class, 'publicIndex']);
Route::get('/public/districts', [DistrictController::class, 'publicIndex']);
Route::get('/public/offices', [OfficeController::class, 'publicIndex']);
Route::get('/public/village-wards', [VillageWardController::class, 'publicIndex']);
Route::get('/tenancy-applications/{tenancyApplication}/receipt', [TenancyApplicationController::class, 'receipt']);
Route::get('/tenancy-applications/{tenancyApplication}/application-details', [TenancyApplicationController::class, 'applicationDetails']);

Route::middleware('auth:sanctum')->group(function () use ($allStaffRoles, $adminRoles, $managementRoles, $principalRoles, $allAdminStaffRoles) {
    // Joint tenancy routes
    Route::get('/tenancy-applications/lookup', [TenancyApplicationController::class, 'lookupByRefCode']);
    Route::post('/tenancy-applications/join', [TenancyApplicationController::class, 'joinApplication']);
    Route::post('/tenancy-applications/check-ref-code', [TenancyApplicationController::class, 'checkRefCode']);
    Route::get('/tenancy-applications/my', [TenancyApplicationController::class, 'myApplications']);
    Route::get('/tenancy-applications/draft/current', [TenancyApplicationController::class, 'currentDraft']);
    Route::post('/tenancy-applications/draft', [TenancyApplicationController::class, 'createDraft']);
    Route::match(['put', 'post'], '/tenancy-applications/{tenancyApplication}/draft', [TenancyApplicationController::class, 'updateDraft']);
    Route::post('/tenancy-applications/{tenancyApplication}/submit', [TenancyApplicationController::class, 'submitDraft']);
    Route::post('/tenancy-applications', [TenancyApplicationController::class, 'store']);
    Route::get('/tenancy-applications/{tenancyApplication}', [TenancyApplicationController::class, 'show']);
    Route::get('/tenancy-applications/{tenancyApplication}/acknowledgement', [TenancyApplicationController::class, 'downloadAcknowledgement']);
    Route::put('/tenancy-applications/{tenancyApplication}', [TenancyApplicationController::class, 'update']);

    // Tenant Forms (Assam Tenancy Rules draft) - user only
    Route::middleware('role:user')->group(function () {
        Route::get('/tenant-forms/my', [TenantFormsStatusController::class, 'my']);
        Route::post('/rent-revision-applications', [RentRevisionApplicationController::class, 'store']);
        Route::get('/rent-revision-applications/{application}', [RentRevisionApplicationController::class, 'show']);
        Route::post('/other-charges-revision-applications', [OtherChargesRevisionApplicationController::class, 'store']);
        Route::get('/other-charges-revision-applications/{application}', [OtherChargesRevisionApplicationController::class, 'show']);
        Route::post('/valuer-appointment-applications', [ValuerAppointmentApplicationController::class, 'store']);
        Route::get('/valuer-appointment-applications/{application}', [ValuerAppointmentApplicationController::class, 'show']);
        Route::post('/rent-court-possession-applications', [RentCourtPossessionApplicationController::class, 'store']);
        Route::get('/rent-court-possession-applications/{application}', [RentCourtPossessionApplicationController::class, 'show']);
        Route::post('/rent-court-filing-applications', [RentCourtFilingApplicationController::class, 'store']);
        Route::get('/rent-court-filing-applications/{application}', [RentCourtFilingApplicationController::class, 'show']);
        Route::post('/rent-authority-filing-applications', [RentAuthorityFilingApplicationController::class, 'store']);
        Route::get('/rent-authority-filing-applications/{application}', [RentAuthorityFilingApplicationController::class, 'show']);
        Route::post('/rent-court-appeal-applications', [RentCourtAppealApplicationController::class, 'store']);
        Route::get('/rent-court-appeal-applications/{application}', [RentCourtAppealApplicationController::class, 'show']);
        Route::post('/rent-tribunal-appeal-applications', [RentTribunalAppealApplicationController::class, 'store']);
        Route::get('/rent-tribunal-appeal-applications/{application}', [RentTribunalAppealApplicationController::class, 'show']);
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::middleware("role:$adminRoles")->group(function () {
        Route::get('/admin/tenancy-records', [TenancyApplicationController::class, 'adminIndex']);
        Route::get('/admin/applications/all', [ApplicationWorkflowController::class, 'allApplications']);
        Route::put('/admin/applications/{type}/{id}', [ApplicationWorkflowController::class, 'update']);
    });

    // Service Application Workflow
    Route::middleware("role:$allAdminStaffRoles")->group(function () {
        Route::get('/admin/applications/inbox', [ApplicationWorkflowController::class, 'inbox']);
        Route::get('/admin/applications/principal-inbox', [ApplicationWorkflowController::class, 'principalInbox']);
        Route::get('/admin/applications/{applicationNo}', [ApplicationWorkflowController::class, 'showByApplicationNo']);
        Route::get('/admin/applications/{type}/{id}', [ApplicationWorkflowController::class, 'show']);
        Route::post('/admin/applications/{type}/{id}/forward', [ApplicationWorkflowController::class, 'forward']);
        Route::post('/admin/applications/{type}/{id}/reject', [ApplicationWorkflowController::class, 'reject']);
        Route::post('/admin/applications/{type}/{id}/approve', [ApplicationWorkflowController::class, 'approve']);
    });

    // Admin user management
    Route::middleware("role:$managementRoles")->group(function () {
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::get('/users/{user}', [UserManagementController::class, 'show']);
        Route::post('/users', [UserManagementController::class, 'store']);
        Route::put('/users/{user}', [UserManagementController::class, 'update']);
        // Users are deactivated (blocked), not deleted, to preserve history.
        Route::post('/users/{user}/toggle-block', [UserManagementController::class, 'toggleBlock']);
    });

    // Super Admin only routes
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/dashboard-stats', [DashboardController::class, 'stats']);
        Route::get('/activity-logs', [UserActivityLogController::class, 'index']);
        // Districts are deactivated, not deleted, to preserve history.
        Route::apiResource('districts', DistrictController::class)->except(['destroy']);
        Route::post('districts/{district}/toggle-active', [DistrictController::class, 'toggleActive']);
        Route::apiResource('offices', OfficeController::class);
        Route::apiResource('designations', DesignationController::class);
        Route::apiResource('roles', RoleController::class);
    });

    // Staff dashboard statistics (officials, assistants, district admin)
    Route::middleware("role:$allAdminStaffRoles")->group(function () {
        Route::get('/staff-dashboard-stats', [DashboardController::class, 'staffStats']);
    });
});

