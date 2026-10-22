<?php
require 'G:/solarhub-api/vendor/autoload.php';
$app = require_once 'G:/solarhub-api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$orders = \App\Models\Order::with([
    'customer',
    'governorate',
    'orderStores.store',
    'orderStores.items.storeProduct.masterProduct'
])->latest()->get();

echo json_encode($orders);
