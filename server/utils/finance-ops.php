<?php
error_reporting(0);
ini_set('display_errors', '0');

try {
    require 'G:/solarhub-api/vendor/autoload.php';
    $app = require_once 'G:/solarhub-api/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    $action = $argv[1] ?? 'summary';
    $payload = isset($argv[2]) ? json_decode($argv[2], true) : [];

    switch ($action) {
        // ==========================================
        // 1. مدفوعات العملاء (Order Payments)
        // ==========================================
        case 'fetch_payments':
            $payments = \App\Models\OrderPayment::with([
                'order.customer',
                'walletProvider'
            ])->latest()->get();

            echo json_encode(['status' => 'success', 'data' => $payments], JSON_UNESCAPED_UNICODE);
            exit(0);

        case 'update_payment_status':
            $id = $payload['id'] ?? null;
            $newStatus = $payload['status'] ?? null;
            if (!$id || !$newStatus) {
                echo json_encode(['status' => 'error', 'message' => 'Missing payment ID or status'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $payment = \App\Models\OrderPayment::find($id);
            if (!$payment) {
                echo json_encode(['status' => 'error', 'message' => 'Payment record not found'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $payment->status = $newStatus;
            if ($newStatus === 'verified') {
                $payment->verified_at = now();
                $payment->verified_by = 1; // Admin user ID
            }
            $payment->save();

            echo json_encode(['status' => 'success', 'data' => $payment], JSON_UNESCAPED_UNICODE);
            exit(0);

        // ==========================================
        // 2. مستحقات الموردين (Store Payouts)
        // ==========================================
        case 'fetch_payouts':
            $payouts = \App\Models\StorePayout::with([
                'orderStore.store',
                'orderStore.order',
                'userWallet.walletProvider'
            ])->latest()->get();

            echo json_encode(['status' => 'success', 'data' => $payouts], JSON_UNESCAPED_UNICODE);
            exit(0);

        case 'update_payout_status':
            $id = $payload['id'] ?? null;
            $status = $payload['status'] ?? null;
            $transferRef = $payload['transfer_reference'] ?? null;

            if (!$id || !$status) {
                echo json_encode(['status' => 'error', 'message' => 'Missing payout ID or status'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $payout = \App\Models\StorePayout::find($id);
            if (!$payout) {
                echo json_encode(['status' => 'error', 'message' => 'Payout record not found'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $payout->status = $status;
            if ($transferRef) {
                $payout->transfer_reference = $transferRef;
            }
            if ($status === 'completed') {
                $payout->paid_at = now();
            }
            $payout->save();

            echo json_encode(['status' => 'success', 'data' => $payout], JSON_UNESCAPED_UNICODE);
            exit(0);

        // ==========================================
        // 3. المحافظ الإلكترونية (Wallet Providers)
        // ==========================================
        case 'fetch_wallet_providers':
            $providers = \App\Models\WalletProvider::withCount([
                'userWallets',
                'orderPayments'
            ])->orderBy('id')->get();

            $storage = app(\App\Services\SupabaseStorageService::class);
            $providers->transform(function ($provider) use ($storage) {
                $provider->logo_url = $provider->logo_path ? $storage->publicUrl($provider->logo_path) : null;
                return $provider;
            });

            echo json_encode(['status' => 'success', 'data' => $providers], JSON_UNESCAPED_UNICODE);
            exit(0);

        case 'create_wallet_provider':
            $code = strtoupper(trim($payload['code'] ?? ''));
            $nameAr = trim($payload['name_ar'] ?? '');
            $nameEn = trim($payload['name_en'] ?? '');
            $isActive = isset($payload['is_active']) ? (bool)$payload['is_active'] : true;
            $logoPath = $payload['logo_path'] ?? null;

            if (!$code || !$nameAr) {
                echo json_encode(['status' => 'error', 'message' => 'رمز المحفظة والاسم العربي مطلوبان'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $existing = \App\Models\WalletProvider::where('code', $code)->first();
            if ($existing) {
                echo json_encode(['status' => 'error', 'message' => 'رمز المحفظة مستخدم بالفعل: ' . $code], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            // رفع الشعار إلى Supabase عند توفر ملف base64
            if (!empty($payload['logo_base64'])) {
                $fileData = base64_decode($payload['logo_base64']);
                $ext = pathinfo($payload['logo_filename'] ?? 'logo.png', PATHINFO_EXTENSION) ?: 'png';
                $cleanExt = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $ext)) ?: 'png';
                $path = 'wallet-providers/' . \Illuminate\Support\Str::uuid() . '.' . $cleanExt;
                \Illuminate\Support\Facades\Storage::disk('supabase_public')->put($path, $fileData);
                $logoPath = $path;
            }

            $provider = \App\Models\WalletProvider::create([
                'code' => $code,
                'name_ar' => $nameAr,
                'name_en' => $nameEn ?: null,
                'is_active' => $isActive,
                'logo_path' => $logoPath ?: null,
            ]);

            $storage = app(\App\Services\SupabaseStorageService::class);
            $provider->logo_url = $provider->logo_path ? $storage->publicUrl($provider->logo_path) : null;

            echo json_encode(['status' => 'success', 'data' => $provider], JSON_UNESCAPED_UNICODE);
            exit(0);

        case 'update_wallet_provider':
            $id = $payload['id'] ?? null;
            if (!$id) {
                echo json_encode(['status' => 'error', 'message' => 'Missing wallet provider ID'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $provider = \App\Models\WalletProvider::find($id);
            if (!$provider) {
                echo json_encode(['status' => 'error', 'message' => 'Wallet provider not found'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $updateData = [];
            if (isset($payload['code'])) $updateData['code'] = strtoupper(trim($payload['code']));
            if (isset($payload['name_ar'])) $updateData['name_ar'] = trim($payload['name_ar']);
            if (isset($payload['name_en'])) $updateData['name_en'] = trim($payload['name_en']);
            if (isset($payload['is_active'])) $updateData['is_active'] = (bool)$payload['is_active'];

            // استبدال الشعار في Supabase: حذف القديم وتخزين الجديد لتوفير المساحة
            if (!empty($payload['logo_base64'])) {
                $storage = app(\App\Services\SupabaseStorageService::class);
                // 1. حذف الشعار القديم إن وُجد
                if ($provider->logo_path) {
                    $storage->deletePublic($provider->logo_path);
                }

                // 2. رفع الشعار الجديد إلى سحابة Supabase
                $fileData = base64_decode($payload['logo_base64']);
                $ext = pathinfo($payload['logo_filename'] ?? 'logo.png', PATHINFO_EXTENSION) ?: 'png';
                $cleanExt = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $ext)) ?: 'png';
                $newPath = 'wallet-providers/' . \Illuminate\Support\Str::uuid() . '.' . $cleanExt;
                \Illuminate\Support\Facades\Storage::disk('supabase_public')->put($newPath, $fileData);
                $updateData['logo_path'] = $newPath;
            } elseif (array_key_exists('logo_path', $payload)) {
                $updateData['logo_path'] = $payload['logo_path'];
            }

            $provider->update($updateData);

            $storage = app(\App\Services\SupabaseStorageService::class);
            $provider->logo_url = $provider->logo_path ? $storage->publicUrl($provider->logo_path) : null;

            echo json_encode(['status' => 'success', 'data' => $provider], JSON_UNESCAPED_UNICODE);
            exit(0);

        case 'delete_wallet_provider':
            $id = $payload['id'] ?? null;
            if (!$id) {
                echo json_encode(['status' => 'error', 'message' => 'Missing wallet provider ID'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $provider = \App\Models\WalletProvider::find($id);
            if (!$provider) {
                echo json_encode(['status' => 'error', 'message' => 'Wallet provider not found'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            if ($provider->userWallets()->exists() || $provider->orderPayments()->exists()) {
                // في حال وجود ارتباطات سابقة، يتم تعطيل المحفظة فقط للحفاظ على التكامل المالي
                $provider->is_active = false;
                $provider->save();
                $storage = app(\App\Services\SupabaseStorageService::class);
                $provider->logo_url = $provider->logo_path ? $storage->publicUrl($provider->logo_path) : null;
                echo json_encode([
                    'status' => 'success',
                    'message' => 'المحفظة مرتبطة بمعاملات سابقة، تم تعطيلها بدلاً من الحذف للحفاظ على سلامة القيود المالية.',
                    'data' => $provider
                ], JSON_UNESCAPED_UNICODE);
                exit(0);
            }

            // حذف الشعار من Supabase عند الحذف النهائي
            if ($provider->logo_path) {
                app(\App\Services\SupabaseStorageService::class)->deletePublic($provider->logo_path);
            }

            $provider->delete();
            echo json_encode(['status' => 'success', 'message' => 'تم حذف مزود المحفظة بنجاح'], JSON_UNESCAPED_UNICODE);
            exit(0);

        // ==========================================
        // 4. الإعدادات المالية (Platform Settings)
        // ==========================================
        case 'fetch_settings':
            $settings = \App\Models\PlatformSetting::first();
            echo json_encode(['status' => 'success', 'data' => $settings], JSON_UNESCAPED_UNICODE);
            exit(0);

        case 'update_settings':
            $settings = \App\Models\PlatformSetting::first();
            if (!$settings) {
                $settings = new \App\Models\PlatformSetting();
                $settings->platform_name = 'سولار هاب - SolarHub';
                $settings->support_phone = '777000000';
                $settings->support_email = 'support@solarhub.com';
                $settings->logo_path = 'settings/logo.png';
            }

            if (isset($payload['currency'])) $settings->currency = $payload['currency'];
            if (isset($payload['platform_name'])) $settings->platform_name = $payload['platform_name'];
            if (isset($payload['support_phone'])) $settings->support_phone = $payload['support_phone'];
            if (isset($payload['support_email'])) $settings->support_email = $payload['support_email'];
            if (isset($payload['is_maintenance_mode'])) $settings->is_maintenance_mode = (bool)$payload['is_maintenance_mode'];

            $settings->save();
            echo json_encode(['status' => 'success', 'data' => $settings], JSON_UNESCAPED_UNICODE);
            exit(0);

        // ==========================================
        // 5. الملخص والإحصائيات المالية الشاملة
        // ==========================================
        default:
            $totalPayments = (float)\App\Models\OrderPayment::where('status', 'verified')->sum('amount');
            $pendingPayments = (float)\App\Models\OrderPayment::where('status', 'pending')->sum('amount');
            $totalPayouts = (float)\App\Models\StorePayout::where('status', 'completed')->sum('net_amount');
            $pendingPayouts = (float)\App\Models\StorePayout::where('status', 'pending')->sum('net_amount');
            $totalCommissions = (float)\App\Models\StorePayout::where('status', 'completed')->sum('commission_amount');
            $providersCount = \App\Models\WalletProvider::count();

            echo json_encode([
                'status' => 'success',
                'data' => [
                    'total_payments' => $totalPayments,
                    'pending_payments' => $pendingPayments,
                    'total_payouts' => $totalPayouts,
                    'pending_payouts' => $pendingPayouts,
                    'total_commissions' => $totalCommissions,
                    'providers_count' => $providersCount,
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit(0);
    }
} catch (\Throwable $e) {
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit(1);
}
