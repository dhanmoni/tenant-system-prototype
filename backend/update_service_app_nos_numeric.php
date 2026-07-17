<?php
use App\Models\District;
use Illuminate\Support\Facades\DB;

$tables = [
    'rent_authority_form_i_applications',
    'rent_authority_form_ia_applications',
    'rent_authority_form_ib_applications',
    'rent_court_form_4_applications',
    'rent_court_form_5_applications',
    'rent_authority_form_6_applications',
    'rent_court_form_7_applications',
    'rent_tribunal_form_8_applications'
];

$counters = [];

foreach ($tables as $table) {
    $records = DB::table($table)->orderBy('created_at')->get();
    foreach ($records as $record) {
        $districtId = $record->district_id ?? 1;
        $district = District::find($districtId);
        $districtCode = $district ? $district->code : '00';
        $year = date('Y', strtotime($record->created_at));
        
        $key = "{$districtCode}{$year}";
        if (!isset($counters[$key])) {
            $counters[$key] = 0;
        }
        $counters[$key]++;
        
        $newNo = "APP-{$key}-" . str_pad((string)$counters[$key], 6, '0', STR_PAD_LEFT);
        
        DB::table($table)->where('id', $record->id)->update(['application_no' => $newNo]);
    }
}
echo "Done updating all service application numbers with unique cross-table sequence\n";
