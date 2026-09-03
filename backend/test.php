<?php
$u = \App\Models\User::where('role', 'super_admin')->first();
\Laravel\Sanctum\Sanctum::actingAs($u);
$req = \Illuminate\Http\Request::create('/api/users', 'GET');
$req->headers->set('Accept', 'application/json');
$res = app()->handle($req);
$data = json_decode($res->getContent(), true);
echo "COUNT: " . count($data['users']) . "\n";
