with open('app/Http/Controllers/TenancyApplicationController.php', 'r') as f:
    c = f.read()

c = c.replace(
    "'village_ward_id' => ['required', 'integer', 'exists:village_wards,id']",
    "'village_ward_id' => ['nullable', 'integer', 'exists:village_wards,id']"
)

with open('app/Http/Controllers/TenancyApplicationController.php', 'w') as f:
    f.write(c)
