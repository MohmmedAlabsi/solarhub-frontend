<script setup lang="ts">
import {
  Building2,
  Check,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  CreditCard,
  HardHat,
  Package,
  RotateCcw,
  Save,
  Shield,
  ShieldCheck,
  Sliders,
  Store,
  User,
  UserCheck,
  Users,
} from 'lucide-vue-next'
import type { AdminPermissionGroup, AdminRoleUser } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة الصلاحيات والأدوار | لوحة الإدارة العامة' })

// قائمة المشرفين / المستخدمين المستهدفين
const targetUsers: AdminRoleUser[] = [
  {
    id: 'user-1',
    name: 'م. أنس نايف علي',
    role: 'system_admin',
    roleTitle: 'مسؤول نظام',
    avatarText: 'أ ن',
    permissions: ['users.view_logs', 'orders.view_records'],
  },
  {
    id: 'user-2',
    name: 'م. فهد السديري',
    role: 'super_admin',
    roleTitle: 'مدير عام المنصة',
    avatarText: 'ف س',
    permissions: [
      'users.view_logs',
      'users.create_account',
      'users.edit_data',
      'users.delete_account',
      'users.assign_roles',
      'suppliers.view_profiles',
      'suppliers.approve_records',
      'suppliers.manage_catalog',
      'suppliers.add_product',
      'suppliers.edit_pricing',
      'engineers.view_list',
      'engineers.verify_accreditation',
      'engineers.dispatch_requests',
      'engineers.review_quotes',
      'orders.view_records',
      'orders.update_shipping',
      'orders.cancel_refund',
      'finance.view_payments',
      'finance.approve_payouts',
      'finance.edit_vat_settings',
      'finance.export_reports',
      'system.send_notifications',
      'system.manage_master_data',
      'system.edit_platform_settings',
      'system.moderate_reviews',
    ],
  },
  {
    id: 'user-3',
    name: 'سارة القحطاني',
    role: 'finance_officer',
    roleTitle: 'مشرف العمليات المالية',
    avatarText: 'س ق',
    permissions: [
      'orders.view_records',
      'finance.view_payments',
      'finance.approve_payouts',
      'finance.edit_vat_settings',
      'finance.export_reports',
    ],
  },
  {
    id: 'user-4',
    name: 'عبدالله الغامدي',
    role: 'catalog_manager',
    roleTitle: 'مشرف الكتالوج والمخزون',
    avatarText: 'ع غ',
    permissions: [
      'suppliers.view_profiles',
      'suppliers.manage_catalog',
      'suppliers.add_product',
      'suppliers.edit_pricing',
    ],
  },
  {
    id: 'user-5',
    name: 'م. ريم الشمري',
    role: 'engineering_director',
    roleTitle: 'مشرف اعتماد المهندسين',
    avatarText: 'ر ش',
    permissions: [
      'engineers.view_list',
      'engineers.verify_accreditation',
      'engineers.dispatch_requests',
      'engineers.review_quotes',
    ],
  },
]

const selectedUserId = ref('user-1')
const selectedUser = computed(() => {
  return targetUsers.find(u => u.id === selectedUserId.value) || targetUsers[0]
})

// مجموعات الصلاحيات الست المعتمدة في التصميم
const permissionGroups = ref<AdminPermissionGroup[]>([
  {
    id: 'users_roles',
    title: 'إدارة المستخدمين والأدوار',
    icon: 'users',
    expanded: true,
    items: [
      { id: 'users.view_logs', label: 'عرض المستخدمين وسجلات الدخول', checked: true },
      { id: 'users.create_account', label: 'إنشاء حساب مستخدم جديد', checked: false },
      { id: 'users.edit_data', label: 'تعديل بيانات المستخدم والبريد وكلمات المرور', checked: false },
      { id: 'users.delete_account', label: 'حذف أو تعطيل حسابات المستخدمين', checked: false },
      { id: 'users.assign_roles', label: 'تعيين وإسناد الأدوار والصلاحيات للمشرفين', checked: false },
    ],
  },
  {
    id: 'suppliers_catalog',
    title: 'إدارة الموردين والكتالوج',
    icon: 'store',
    expanded: true,
    items: [
      { id: 'suppliers.view_profiles', label: 'استعراض قائمة الموردين وملفاتهم التجارية', checked: false },
      { id: 'suppliers.approve_records', label: 'اعتماد ورفض السجلات التجارية لحسابات الموردين', checked: false },
      { id: 'suppliers.manage_catalog', label: 'إدارة ومراجعة منتجات الكتالوج الشمسي', checked: false },
      { id: 'suppliers.add_product', label: 'إضافة منتج جديد للكتالوج وتحديد المواصفات الفنية', checked: false },
      { id: 'suppliers.edit_pricing', label: 'تعديل أسعار الكتالوج، الخصومات وحالات التوفر', checked: false },
    ],
  },
  {
    id: 'engineers_services',
    title: 'إدارة المهندسين والخدمات',
    icon: 'userCheck',
    expanded: true,
    items: [
      { id: 'engineers.view_list', label: 'استعراض قائمة المهندسين والاستشاريين المعتمدين', checked: false },
      { id: 'engineers.verify_accreditation', label: 'التحقق من الاعتماد المهني، هيئة المهندسين والتراخيص', checked: false },
      { id: 'engineers.dispatch_requests', label: 'إدارة وتوزيع طلبات المعاينة والتصميم الهندسي', checked: false },
      { id: 'engineers.review_quotes', label: 'مراجعة عروض الأسعار والدراسات الفنية المقدمة للعملاء', checked: false },
    ],
  },
  {
    id: 'orders_sales',
    title: 'إدارة طلبات الشراء والمبيعات',
    icon: 'shoppingBag',
    expanded: true,
    items: [
      { id: 'orders.view_records', label: 'استعراض سجل طلبات الشراء وحالات الدفع', checked: true },
      { id: 'orders.update_shipping', label: 'تحديث حالة الطلبات والشحن وجدولة التوصيل', checked: false },
      { id: 'orders.cancel_refund', label: 'إلغاء الطلبات المتأخرة وإرجاع المبالغ للمحافظ', checked: false },
    ],
  },
  {
    id: 'finance_operations',
    title: 'الإدارة المالية والعمليات',
    icon: 'creditCard',
    expanded: true,
    items: [
      { id: 'finance.view_payments', label: 'استعراض سجل المدفوعات والتحصيلات وبوابات الدفع', checked: false },
      { id: 'finance.approve_payouts', label: 'مراجعة واعتماد صرف مستحقات الموردين والمهندسين', checked: false },
      { id: 'finance.edit_vat_settings', label: 'تعديل نسب ضريبة القيمة المضافة والإعدادات المالية للمنصة', checked: false },
      { id: 'finance.export_reports', label: 'تصدير التقارير المالية التفصيلية وكشوفات الحساب البنكي', checked: false },
    ],
  },
  {
    id: 'system_notifications',
    title: 'إدارة النظام والإشعارات',
    icon: 'sliders',
    expanded: true,
    items: [
      { id: 'system.send_notifications', label: 'إرسال الإشعارات الفورية والتعاميم الجماعية للمستخدمين', checked: false },
      { id: 'system.manage_master_data', label: 'إدارة البيانات الأساسية (التصنيفات، العلامات التجارية، التخصصات، المحافظات)', checked: false },
      { id: 'system.edit_platform_settings', label: 'تعديل إعدادات وسياسات المنصة التقنية وسجلات النظام', checked: false },
      { id: 'system.moderate_reviews', label: 'مراجعة والتحكم في تقييمات وتعليقات العملاء المنشورة', checked: false },
    ],
  },
])

// تتبع وحفظ الحالة الأصلية لتفعيل زر الإلغاء
const initialPermissionsSnapshot = ref<string[]>([])

function loadUserPermissions() {
  const current = selectedUser.value
  const activeIds = new Set(current.permissions)
  initialPermissionsSnapshot.value = [...current.permissions]

  permissionGroups.value.forEach(group => {
    group.items.forEach(item => {
      item.checked = activeIds.has(item.id)
    })
  })
}

// تحميل الصلاحيات للمستخدم المختار عند البداية أو عند تغيير المستخدم
watch(selectedUserId, () => {
  loadUserPermissions()
}, { immediate: true })

// إجمالي الصلاحيات المختارة
const totalPermissionsCount = computed(() => {
  return permissionGroups.value.reduce((acc, g) => acc + g.items.length, 0)
})

const selectedPermissionsCount = computed(() => {
  return permissionGroups.value.reduce((acc, g) => acc + g.items.filter(i => i.checked).length, 0)
})

// حالة تحديد الكل
const isAllSelected = computed({
  get() {
    return selectedPermissionsCount.value === totalPermissionsCount.value && totalPermissionsCount.value > 0
  },
  set(val: boolean) {
    permissionGroups.value.forEach(group => {
      group.items.forEach(item => {
        item.checked = val
      })
    })
  },
})

function toggleGroupExpand(group: AdminPermissionGroup) {
  group.expanded = !group.expanded
}

function expandAllGroups() {
  permissionGroups.value.forEach(g => {
    g.expanded = true
  })
}

function collapseAllGroups() {
  permissionGroups.value.forEach(g => {
    g.expanded = false
  })
}

function togglePermission(item: { id: string; checked: boolean }) {
  item.checked = !item.checked
}

// التحقق من وجود تعديلات لم تحفظ بعد
const hasUnsavedChanges = computed(() => {
  const currentChecked = new Set<string>()
  permissionGroups.value.forEach(group => {
    group.items.forEach(item => {
      if (item.checked) currentChecked.add(item.id)
    })
  })

  if (currentChecked.size !== initialPermissionsSnapshot.value.length) return true
  return initialPermissionsSnapshot.value.some(id => !currentChecked.has(id))
})

// إشعار الحفظ والإلغاء
const saveToastMessage = ref('')
const isToastVisible = ref(false)

function showToast(msg: string) {
  saveToastMessage.value = msg
  isToastVisible.value = true
  setTimeout(() => {
    isToastVisible.value = false
  }, 3500)
}

function cancelChanges() {
  loadUserPermissions()
  showToast('تم إلغاء التغييرات واستعادة الصلاحيات الأصلية')
}

function savePermissions() {
  const checkedIds: string[] = []
  permissionGroups.value.forEach(group => {
    group.items.forEach(item => {
      if (item.checked) checkedIds.push(item.id)
    })
  })

  selectedUser.value.permissions = checkedIds
  initialPermissionsSnapshot.value = [...checkedIds]
  showToast(`تم حفظ وتحديث صلاحيات (${selectedUser.value.name}) بنجاح (${checkedIds.length} صلاحية مسندة)`)
}

// دالة لجلب أيقونة القسم
function getGroupIcon(iconName: string) {
  switch (iconName) {
    case 'users':
      return Users
    case 'store':
      return Store
    case 'userCheck':
      return UserCheck
    case 'shoppingBag':
      return Package
    case 'creditCard':
      return Building2
    case 'sliders':
      return Sliders
    default:
      return Shield
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- توست الإشعار عند الحفظ أو الإلغاء -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-2 opacity-0"
    >
      <div
        v-if="isToastVisible"
        class="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-xl bg-solar-navy px-4 py-3 text-white shadow-2xl border border-white/10"
      >
        <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
          <Check class="size-4 stroke-[3]" />
        </div>
        <p class="text-xs font-bold leading-normal">{{ saveToastMessage }}</p>
      </div>
    </transition>

    <!-- شريط العنوان الرئيسي للواجهة -->
    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100 shadow-xs">
          <ShieldCheck class="size-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-solar-navy-dark tracking-tight">
            إدارة الصلاحيات والأدوار
          </h1>
          <p class="text-xs text-solar-text-muted mt-0.5">
            تخصيص مستويات الوصول وتعيين الصلاحيات الإجرائية للمشرفين والمسؤولين
          </p>
        </div>
      </div>
    </div>

    <!-- بطاقة التصفية واختيار المستخدم وإجراءات الحفظ -->
    <section class="solar-card p-4 sm:p-5 bg-white rounded-2xl border border-solar-border-card shadow-xs">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <!-- الجانب الأيمن: اختيار المستخدم المستهدف والدور الحالي -->
        <div class="flex flex-wrap items-center gap-4 sm:gap-6">
          <!-- اختيار المستخدم المستهدف -->
          <div class="w-full sm:w-auto min-w-[240px]">
            <label class="block text-[11px] font-bold text-solar-text-muted mb-1.5">
              اختيار المستخدم المستهدف
            </label>
            <div class="relative">
              <select
                v-model="selectedUserId"
                class="solar-input h-11 w-full pl-9 pr-10 text-xs font-bold text-solar-text-heading appearance-none bg-white cursor-pointer hover:border-solar-navy/30 transition-colors"
              >
                <option v-for="user in targetUsers" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
              <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-solar-navy">
                <User class="size-4 text-solar-text-muted" />
              </div>
              <ChevronDown class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
            </div>
          </div>

          <!-- الدور المسند حالياً -->
          <div>
            <label class="block text-[11px] font-bold text-solar-text-muted mb-1.5">
              الدور المسند حالياً
            </label>
            <div class="flex items-center gap-2 h-11 px-4 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-black select-none">
              <Shield class="size-4 text-amber-700" />
              <span>{{ selectedUser.roleTitle }}</span>
            </div>
          </div>
        </div>

        <!-- الجانب الأيسر: زرا إلغاء التغييرات وحفظ الصلاحيات -->
        <div class="flex items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <button
            type="button"
            @click="cancelChanges"
            class="btn-outline h-11 px-4 text-xs font-bold gap-2 text-slate-700 hover:text-solar-navy border-slate-200 bg-white hover:bg-slate-50 active:scale-98 transition-all"
          >
            <RotateCcw class="size-4 text-slate-500" />
            <span>إلغاء التغييرات</span>
          </button>

          <button
            type="button"
            @click="savePermissions"
            class="btn-primary h-11 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-sm active:scale-98 transition-all"
          >
            <Save class="size-4" />
            <span>حفظ الصلاحيات</span>
          </button>
        </div>
      </div>
    </section>

    <!-- بطاقة مصفوفة الصلاحيات الشاملة -->
    <section class="solar-card p-4 sm:p-6 bg-white rounded-2xl border border-solar-border-card shadow-xs">
      <!-- الشريط العلوي للتحكم في الصلاحيات: تحديد الكل + التوسيع والطي -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <!-- خيار تحديد كافة الصلاحيات المتاحة -->
        <label class="flex items-center gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            v-model="isAllSelected"
            class="size-4.5 rounded border-slate-300 text-solar-navy focus:ring-solar-navy cursor-pointer"
          />
          <span class="text-xs sm:text-sm font-extrabold text-solar-navy group-hover:text-solar-navy-dark transition-colors">
            تحديد كافة الصلاحيات المتاحة
          </span>
          <span class="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {{ selectedPermissionsCount }} من {{ totalPermissionsCount }}
          </span>
        </label>

        <!-- أزرار التوسيع والطي -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="expandAllGroups"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-bold active:scale-95 transition-all"
          >
            <ChevronsUpDown class="size-3.5" />
            <span>توسيع الكل</span>
          </button>

          <button
            type="button"
            @click="collapseAllGroups"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-bold active:scale-95 transition-all"
          >
            <ChevronsDownUp class="size-3.5" />
            <span>طي الكل</span>
          </button>
        </div>
      </div>

      <!-- قائمة المجموعات الست من الصلاحيات (Accordions) -->
      <div class="divide-y divide-slate-100">
        <div
          v-for="group in permissionGroups"
          :key="group.id"
          class="py-4 first:pt-4 last:pb-1"
        >
          <!-- رأس المجموعة (Group Header) -->
          <div
            @click="toggleGroupExpand(group)"
            class="flex items-center justify-between py-2 cursor-pointer select-none group"
          >
            <div class="flex items-center gap-3">
              <div class="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-solar-navy group-hover:bg-solar-navy group-hover:text-white transition-colors">
                <component :is="getGroupIcon(group.icon)" class="size-4.5 stroke-[2]" />
              </div>
              <h2 class="text-xs sm:text-sm font-black text-solar-navy group-hover:text-solar-navy-dark transition-colors">
                {{ group.title }}
              </h2>
            </div>

            <div class="flex items-center gap-3">
              <!-- مؤشر عدد الصلاحيات المحددة داخل المجموعة -->
              <span class="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
                {{ group.items.filter(i => i.checked).length }} / {{ group.items.length }}
              </span>

              <!-- سهم الفتح والإغلاق -->
              <ChevronDown
                class="size-4 text-slate-400 group-hover:text-solar-navy transition-transform duration-200"
                :class="{ 'rotate-180': group.expanded }"
              />
            </div>
          </div>

          <!-- قائمة عناصر الصلاحيات الفردية (Accordion Items) -->
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform -translate-y-1 opacity-0 max-h-0 overflow-hidden"
            enter-to-class="transform translate-y-0 opacity-100 max-h-[500px]"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform translate-y-0 opacity-100 max-h-[500px]"
            leave-to-class="transform -translate-y-1 opacity-0 max-h-0 overflow-hidden"
          >
            <div v-if="group.expanded" class="mt-2 pr-11 space-y-2">
              <div
                v-for="item in group.items"
                :key="item.id"
                @click="togglePermission(item)"
                class="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50/80 cursor-pointer select-none transition-all group/item"
                :class="{ 'bg-slate-50/50': item.checked }"
              >
                <!-- اسم الصلاحية -->
                <span
                  class="text-xs sm:text-sm font-semibold transition-colors"
                  :class="item.checked ? 'text-solar-navy font-bold' : 'text-slate-600 group-hover/item:text-solar-navy'"
                >
                  {{ item.label }}
                </span>

                <!-- مربع التحديد المطابق للصورة تماماً -->
                <div
                  class="flex size-5 shrink-0 items-center justify-center rounded transition-all"
                  :class="[
                    item.checked
                      ? 'bg-solar-navy text-white shadow-xs'
                      : 'border-2 border-slate-300 bg-white group-hover/item:border-slate-400'
                  ]"
                >
                  <Check v-if="item.checked" class="size-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </section>
  </div>
</template>
