<?php
require 'G:/solarhub-api/vendor/autoload.php';
$app = require_once 'G:/solarhub-api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$orderId = $argv[1] ?? null;
$status = $argv[2] ?? null;

if ($orderId && $status) {
    $order = \App\Models\Order::where('id', $orderId)->orWhere('order_number', $orderId)->first();
    if ($order) {
        $order->status = $status;
        $order->save();
        echo json_encode(['success' => true, 'order' => $order]);
    } else {
        echo json_encode(['error' => 'Order not found']);
    }
} else {
    echo json_encode(['error' => 'Missing parameters']);
}
