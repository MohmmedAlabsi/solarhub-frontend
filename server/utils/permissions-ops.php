<?php
error_reporting(0);
ini_set('display_errors', '0');

try {
    require 'G:/solarhub-api/vendor/autoload.php';
    $app = require_once 'G:/solarhub-api/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    $action = $argv[1] ?? 'fetch_permissions';
    $payload = isset($argv[2]) ? json_decode($argv[2], true) : [];

    switch ($action) {
        // ==========================================
        // 1. جلب كافة الصلاحيات المسجلة في النظام
        // ==========================================
        case 'fetch_permissions':
            $permissions = \Spatie\Permission\Models\Permission::query()
                ->where('guard_name', 'web')
                ->orderBy('name')
                ->get(['id', 'name']);

            echo json_encode(['status' => 'success', 'data' => $permissions], JSON_UNESCAPED_UNICODE);
            exit(0);

        // ==========================================
        // 2. جلب قائمة المشرفين / الأدمنز مع صلاحياتهم
        // ==========================================
        case 'fetch_admins':
            $admins = \App\Models\User::role('admin')->with(['roles', 'permissions'])->get();
            $otherStaff = \App\Models\User::has('permissions')->whereNotIn('id', $admins->pluck('id'))->with(['roles', 'permissions'])->get();
            $allAdmins = $admins->merge($otherStaff);

            if ($allAdmins->count() < 10) {
                $additional = \App\Models\User::whereNotIn('id', $allAdmins->pluck('id'))->limit(10)->with(['roles', 'permissions'])->get();
                $allAdmins = $allAdmins->merge($additional);
            }

            $result = $allAdmins->map(function ($user) {
                $primaryRole = $user->roles->first()?->name ?? 'user';
                $roleTitle = match ($primaryRole) {
                    'admin' => 'مدير نظام عام (Super Admin)',
                    'supplier' => 'حساب مورد معتمد (Supplier)',
                    'engineer' => 'حساب مهندس معتمد (Engineer)',
                    'customer' => 'عميل مسجل (Customer)',
                    default => 'مشرف إداري',
                };

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'role' => $primaryRole,
                    'role_title' => $roleTitle,
                    'direct_permissions' => $user->permissions->pluck('name')->values()->toArray(),
                    'all_permissions' => $user->getAllPermissions()->pluck('name')->values()->toArray(),
                    'roles' => $user->roles->pluck('name')->values()->toArray(),
                    'created_at' => $user->created_at?->toISOString(),
                ];
            });

            echo json_encode(['status' => 'success', 'data' => $result], JSON_UNESCAPED_UNICODE);
            exit(0);

        // ==========================================
        // 3. البحث عن مستخدمين لإسناد الصلاحيات
        // ==========================================
        case 'search_users':
            $q = trim($payload['query'] ?? '');
            $users = \App\Models\User::query()
                ->when($q, function ($query, $q) {
                    $query->where('name', 'like', "%{$q}%")
                          ->orWhere('email', 'like', "%{$q}%")
                          ->orWhere('phone', 'like', "%{$q}%");
                })
                ->with(['roles', 'permissions'])
                ->limit(20)
                ->get();

            $result = $users->map(function ($user) {
                $primaryRole = $user->roles->first()?->name ?? 'user';
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'role' => $primaryRole,
                    'direct_permissions' => $user->permissions->pluck('name')->values()->toArray(),
                    'all_permissions' => $user->getAllPermissions()->pluck('name')->values()->toArray(),
                    'roles' => $user->roles->pluck('name')->values()->toArray(),
                ];
            });

            echo json_encode(['status' => 'success', 'data' => $result], JSON_UNESCAPED_UNICODE);
            exit(0);

        // ==========================================
        // 4. جلب صلاحيات مستخدم محدد
        // ==========================================
        case 'get_user_permissions':
            $userId = $payload['user_id'] ?? null;
            if (!$userId) {
                echo json_encode(['status' => 'error', 'message' => 'User ID is required'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $user = \App\Models\User::find($userId);
            if (!$user) {
                echo json_encode(['status' => 'error', 'message' => 'User not found'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            echo json_encode([
                'status' => 'success',
                'data' => [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'direct_permissions' => $user->permissions->pluck('name')->values()->toArray(),
                    'all_permissions' => $user->getAllPermissions()->pluck('name')->values()->toArray(),
                    'roles' => $user->roles->pluck('name')->values()->toArray(),
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit(0);

        // ==========================================
        // 5. مزامنة / حفظ صلاحيات المستخدم بالكامل (Sync)
        // ==========================================
        case 'sync_user_permissions':
            $userId = $payload['user_id'] ?? null;
            $permissions = $payload['permissions'] ?? [];

            if (!$userId) {
                echo json_encode(['status' => 'error', 'message' => 'User ID is required'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $user = \App\Models\User::find($userId);
            if (!$user) {
                echo json_encode(['status' => 'error', 'message' => 'User not found'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            // مزامنة الصلاحيات المباشرة
            $user->syncPermissions($permissions);
            $user->unsetRelation('permissions');

            echo json_encode([
                'status' => 'success',
                'message' => 'تم تحديث صلاحيات المشرف بنجاح.',
                'data' => [
                    'user_id' => $user->id,
                    'direct_permissions' => $user->permissions->pluck('name')->values()->toArray(),
                    'all_permissions' => $user->getAllPermissions()->pluck('name')->values()->toArray(),
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit(0);

        // ==========================================
        // 6. إضافة أو إلغاء صلاحية مفردة لمشرف
        // ==========================================
        case 'toggle_permission':
            $userId = $payload['user_id'] ?? null;
            $permissionName = $payload['permission'] ?? null;
            $enable = isset($payload['enable']) ? (bool)$payload['enable'] : true;

            if (!$userId || !$permissionName) {
                echo json_encode(['status' => 'error', 'message' => 'User ID and permission name are required'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $user = \App\Models\User::find($userId);
            if (!$user) {
                echo json_encode(['status' => 'error', 'message' => 'User not found'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            if ($enable) {
                $user->givePermissionTo($permissionName);
            } else {
                $user->revokePermissionTo($permissionName);
            }

            $user->unsetRelation('permissions');

            echo json_encode([
                'status' => 'success',
                'message' => $enable ? 'تم منح الصلاحية بنجاح' : 'تم إلغاء الصلاحية بنجاح',
                'data' => [
                    'user_id' => $user->id,
                    'direct_permissions' => $user->permissions->pluck('name')->values()->toArray(),
                    'all_permissions' => $user->getAllPermissions()->pluck('name')->values()->toArray(),
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit(0);

        // ==========================================
        // 7. تعيين الدور الرئيسي (Role) لمستخدم
        // ==========================================
        case 'assign_role':
            $userId = $payload['user_id'] ?? null;
            $roleName = $payload['role'] ?? 'admin';

            if (!$userId) {
                echo json_encode(['status' => 'error', 'message' => 'User ID is required'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $user = \App\Models\User::find($userId);
            if (!$user) {
                echo json_encode(['status' => 'error', 'message' => 'User not found'], JSON_UNESCAPED_UNICODE);
                exit(1);
            }

            $user->syncRoles([$roleName]);
            $user->unsetRelation('roles');

            echo json_encode([
                'status' => 'success',
                'message' => "تم تعيين الدور {$roleName} بنجاح",
                'data' => [
                    'user_id' => $user->id,
                    'roles' => $user->roles->pluck('name')->values()->toArray(),
                    'all_permissions' => $user->getAllPermissions()->pluck('name')->values()->toArray(),
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit(0);

        default:
            echo json_encode(['status' => 'error', 'message' => 'Unknown action: ' . $action], JSON_UNESCAPED_UNICODE);
            exit(1);
    }
} catch (\Throwable $e) {
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit(1);
}
