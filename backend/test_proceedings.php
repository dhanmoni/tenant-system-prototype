<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$req = Illuminate\Http\Request::create('/api/tenant-forms/form-vi-rent-tribunal-appeal/1/proceedings', 'GET');
$req->setUserResolver(function() { return App\Models\User::find(20); });
echo app()->handle($req)->getContent();
