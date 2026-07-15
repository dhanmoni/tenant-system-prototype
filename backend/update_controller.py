import re

with open('app/Http/Controllers/TenancyApplicationController.php', 'r') as f:
    c = f.read()

c = re.sub(r"('village_ward_id'\s*=>\s*\[.*?\]\,)", r"\1\n            'village_name' => ['nullable', 'string'],", c)
c = re.sub(r"('village_ward_id',)", r"\1\n            'village_name',", c)
c = re.sub(r"(\$data\['village_ward_id'\],)", r"\1\n            $data['village_name'] ?? null,", c)
c = re.sub(r"('village_ward_id'\s*=>\s*\$application->village_ward_id,)", r"\1\n            'village_name' => $application->village_name,", c)
c = re.sub(r"(\$request->input\('village_ward_id'\))", r"\1,\n            'village_name' => $request->input('village_name')", c)

with open('app/Http/Controllers/TenancyApplicationController.php', 'w') as f:
    f.write(c)
