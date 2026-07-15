<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$wards = App\Models\VillageWard::whereHas('district', function($q) { $q->where('name', 'like', '%Kamrup%'); })->get()->toArray();
echo json_encode(array_slice($wards, 0, 5), JSON_PRETTY_PRINT);
