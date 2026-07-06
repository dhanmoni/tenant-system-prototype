<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/api/admin/applications/principal-inbox', 'GET');
$user = App\Models\User::where('role', 'rent_authority')->first();
$request->setUserResolver(function() use ($user) { return $user; });

$controller = $app->make(App\Http\Controllers\ApplicationWorkflowController::class);
$response = $controller->principalInbox($request);
echo $response->getContent();
