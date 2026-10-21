<?php
error_reporting(0);
ini_set('display_errors', '0');

try {
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

    echo json_encode($orders, JSON_UNESCAPED_UNICODE);
    exit(0);
} catch (\Throwable $e) {
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit(1);
}
