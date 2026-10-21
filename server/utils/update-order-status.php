<?php
error_reporting(0);
ini_set('display_errors', '0');

try {
    require 'G:/solarhub-api/vendor/autoload.php';
    $app = require_once 'G:/solarhub-api/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    $orderId = $argv[1] ?? null;
    $status = $argv[2] ?? null;

    if (!$orderId || !$status) {
        echo json_encode(['error' => 'Missing order id or status parameters'], JSON_UNESCAPED_UNICODE);
        exit(1);
    }

    $order = \App\Models\Order::where('id', $orderId)->orWhere('order_number', $orderId)->first();
    if (!$order) {
        echo json_encode(['error' => 'Order not found for ID/Number: ' . $orderId], JSON_UNESCAPED_UNICODE);
        exit(1);
    }

    $order->status = $status;
    $order->save();

    // Also sync order_stores status if appropriate
    if (in_array($status, ['completed', 'cancelled', 'processing'])) {
        \App\Models\OrderStore::where('order_id', $order->id)->update(['status' => $status]);
    }

    echo json_encode([
        'success' => true,
        'order' => $order
    ], JSON_UNESCAPED_UNICODE);
    exit(0);
} catch (\Throwable $e) {
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit(1);
}
