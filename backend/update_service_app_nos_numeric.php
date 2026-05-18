<?php
use App\Models\District;
use Illuminate\Support\Facades\DB;

$tables = [
    'rent_revision_applications',
    'other_charges_revision_applications',
    'valuer_appointment_applications',
    'rent_court_possession_applications',
    'rent_court_filing_applications',
    'rent_authority_filing_applications',
    'rent_court_appeal_applications',
    'rent_tribunal_appeal_applications'
];

foreach ($tables as $table) {
    $records = DB::table($table)->get();
    foreach ($records as $index => $record) {
        $district = District::find($record->district_id ?? 1);
        $districtCode = $district ? $district->code : '00';
        $year = date('Y', strtotime($record->created_at));
        $newNo = "APP-{$districtCode}{$year}-" . str_pad((string)($index + 1), 6, '0', STR_PAD_LEFT);
        
        DB::table($table)->where('id', $record->id)->update(['application_no' => $newNo]);
    }
}
echo "Done updating all service application numbers with numeric district codes\n";
