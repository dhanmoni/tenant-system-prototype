<?php
use App\Models\District;

$districts = District::orderBy('id')->get();
foreach ($districts as $index => $d) {
    $numericCode = str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT);
    $d->code = $numericCode;
    $d->save();
    echo "{$d->id}: {$d->name} -> {$numericCode}\n";
}
echo "Done updating district codes to numeric format (fixed fillable)\n";
