<?php
error_reporting(0);
ini_set('display_errors', '0');

try {
    require 'G:/solarhub-api/vendor/autoload.php';
    $app = require_once 'G:/solarhub-api/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    // استعلام فائق السرعة بمستوى قاعدة البيانات يجمع كافة الجداول المرتبطة بطلب الشراء في خطوة واحدة
    $rawSql = "
    SELECT 
      o.id, o.order_number, o.customer_id, o.delivery_governorate_id, o.total_amount, o.delivery_address, o.status, o.created_at,
      json_build_object('id', u.id, 'name', u.name, 'phone', u.phone, 'email', u.email) as customer,
      json_build_object('id', g.id, 'name_ar', g.name_ar, 'name_en', g.name_en) as governorate,
      COALESCE((
        SELECT json_agg(json_build_object(
          'id', os.id,
          'order_id', os.order_id,
          'store_id', os.store_id,
          'subtotal', os.subtotal,
          'status', os.status,
          'delivered_at', os.delivered_at,
          'customer_confirmed_at', os.customer_confirmed_at,
          'notes', os.notes,
          'store', json_build_object('id', s.id, 'company_name', s.company_name),
          'items', COALESCE((
            SELECT json_agg(json_build_object(
              'id', oi.id,
              'order_store_id', oi.order_store_id,
              'store_product_id', oi.store_product_id,
              'unit_price', oi.unit_price,
              'quantity', oi.quantity,
              'total_price', oi.total_price,
              'store_product', json_build_object(
                'id', sp.id,
                'master_product', json_build_object('id', mp.id, 'title', mp.title)
              )
            ))
            FROM order_items oi
            LEFT JOIN store_products sp ON sp.id = oi.store_product_id
            LEFT JOIN master_products mp ON mp.id = sp.master_product_id
            WHERE oi.order_store_id = os.id
          ), '[]'::json)
        ))
        FROM order_stores os
        LEFT JOIN stores s ON s.id = os.store_id
        WHERE os.order_id = o.id
      ), '[]'::json) as order_stores
    FROM orders o
    LEFT JOIN users u ON u.id = o.customer_id
    LEFT JOIN governorates g ON g.id = o.delivery_governorate_id
    ORDER BY o.created_at DESC;
    ";

    $results = \Illuminate\Support\Facades\DB::select($rawSql);

    foreach ($results as $r) {
        if (is_string($r->customer)) $r->customer = json_decode($r->customer);
        if (is_string($r->governorate)) $r->governorate = json_decode($r->governorate);
        if (is_string($r->order_stores)) $r->order_stores = json_decode($r->order_stores);
    }

    echo json_encode(['status' => 'success', 'data' => $results], JSON_UNESCAPED_UNICODE);
    exit(0);
} catch (\Throwable $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'data' => []
    ], JSON_UNESCAPED_UNICODE);
    exit(0);
}
