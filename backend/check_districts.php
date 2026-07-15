<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$districts = App\Models\District::pluck('name')->toArray();
$wardsDistricts = App\Models\VillageWard::select('district_id')->distinct()->pluck('district_id')->toArray();
$wardsDistrictNames = App\Models\District::whereIn('id', $wardsDistricts)->pluck('name')->toArray();

echo "Total Districts: " . count($districts) . "\n";
echo "Districts with Wards: " . count($wardsDistricts) . "\n";
echo "Missing Districts: \n";
foreach ($districts as $d) {
    if (!in_array($d, $wardsDistrictNames)) {
        echo "- $d\n";
    }
}
