<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
\Illuminate\Support\Facades\DB::enableQueryLog();
$controller = new App\Http\Controllers\CaseProceedingController();
$req = Illuminate\Http\Request::create('/api/tenant-forms/form-vi-rent-tribunal-appeal/1/proceedings', 'GET');
$req->headers->set('Accept', 'application/json');
$req->setUserResolver(function() { return App\Models\User::find(20); });
echo $controller->citizenIndex($req, 'form-vi-rent-tribunal-appeal', 1)->getContent();
echo "\n==== QUERY LOG ====\n";
echo json_encode(\Illuminate\Support\Facades\DB::getQueryLog(), JSON_PRETTY_PRINT);
