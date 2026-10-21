<script setup lang="ts">
import {
  Building2,
  Check,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  CreditCard,
  Database,
  FileText,
  HardHat,
  Loader2,
  Package,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Store,
  User,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-vue-next'
import type { AdminPermissionGroup } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة الصلاحيات والأدوار | لوحة الإدارة العامة' })

const {
  permissions,
  adminUsers,
  selectedUserId,
  currentPermissions,
  permissionGroups,
  isLoading,
  isSaving,
  fetchPermissions,
  fetchAdmins,
  selectUser,
  togglePermission,
  saveUserPermissions,
  assignRole,
} = useAdminPermissions()

// جلب الصلاحيات والمشرفين بالـ SSR المتفائل فائق السرعة
const { pending } = useLazyAsyncData('admin-roles-init', async () => {
  await Promise.all([
    fetchPermissions(false),
    fetchAdmins(false),
  ])
  return true
})

const isRefreshing = ref(false)
const searchQuery = ref('')

async function handleRefresh() {
  isRefreshing.value = true
  try {
    await Promise.all([
      fetchPermissions(true),
      fetchAdmins(true),
    ])
    showToast('تم تحديث الصلاحيات والمشرفين من قاعدة البيانات')
  } finally {
    isRefreshing.value = false
  }
}

// المشرف المختار حالياً
const selectedUser = computed(() => {
  return adminUsers.value.find(u => String(u.id) === String(selectedUserId.value)) || adminUsers.value[0] || {
    id: 1,
    name: 'مدير النظام',
    email: 'admin@solarhub.com',
    role: 'admin',
    role_title: 'مدير نظام عام (Super Admin)',
    direct_permissions: [],
    all_permissions: [],
  }
})

// حالة توسيع وطي المجموعات
const expandedGroups = ref<Record<string, boolean>>({
  users_roles: true,
  catalog_products: true,
  suppliers_stores: true,
  engineers_accreditation: true,
  orders_sales: true,
  services_offers: true,
  finance_wallets: true,
  system_settings: true,
})

function toggleGroupExpand(groupId: string) {
  expandedGroups.value[groupId] = !expandedGroups.value[groupId]
}

function expandAllGroups() {
  Object.keys(expandedGroups.value).forEach(k => {
    expandedGroups.value[k] = true
  })
}

function collapseAllGroups() {
  Object.keys(expandedGroups.value).forEach(k => {
    expandedGroups.value[k] = false
  })
}

// حساب إجمالي الصلاحيات
const totalPermissionsCount = computed(() => {
  return permissions.value.length
})

const selectedPermissionsCount = computed(() => {
  return currentPermissions.value.length
})

// حالة تحديد الكل
const isAllSelected = computed({
  get() {
    return selectedPermissionsCount.value === totalPermissionsCount.value && totalPermissionsCount.value > 0
  },
  set(val: boolean) {
    if (val) {
      currentPermissions.value = permissions.value.map(p => p.name)
    } else {
      currentPermissions.value = []
    }
  },
})

// فحص تحديد مجموعة بالكامل
function isGroupAllSelected(group: AdminPermissionGroup) {
  if (group.items.length === 0) return false
  return group.items.every(i => currentPermissions.value.includes(i.id))
}

function toggleGroupSelection(group: AdminPermissionGroup) {
  const allInGroup = group.items.map(i => i.id)
  const isAll = isGroupAllSelected(group)

  if (isAll) {
    // إلغاء تحديد عناصر المجموعة
    currentPermissions.value = currentPermissions.value.filter(p => !allInGroup.includes(p))
  } else {
    // إضافة عناصر المجموعة غير المحددة
    allInGroup.forEach(id => {
      if (!currentPermissions.value.includes(id)) {
        currentPermissions.value.push(id)
      }
    })
  }
}

// تصفية المجموعات حسب البحث
const filteredGroups = computed(() => {
  if (!searchQuery.value.trim()) return permissionGroups.value

  const q = searchQuery.value.trim().toLowerCase()
  return permissionGroups.value
    .map(group => {
      const filteredItems = group.items.filter(item => {
        return item.label.toLowerCase().includes(q) ||
               (item.description && item.description.toLowerCase().includes(q)) ||
               item.id.toLowerCase().includes(q)
      })
      return {
        ...group,
        items: filteredItems,
        expanded: filteredItems.length > 0,
      }
    })
    .filter(group => group.items.length > 0)
})

// إشعار الحفظ
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
  selectUser(selectedUserId.value)
  showToast('تم إلغاء التغييرات واستعادة الصلاحيات المسجلة لهذا المستخدم')
}

async function handleSavePermissions() {
  if (!selectedUser.value) return
  const success = await saveUserPermissions(selectedUser.value.id, currentPermissions.value)
  if (success) {
    showToast(`تم حفظ وتطبيق صلاحيات (${selectedUser.value.name}) بنجاح (${currentPermissions.value.length} صلاحية مسندة)`)
  }
}

// تعيين الدور كمدير نظام
async function handlePromoteToAdmin() {
  if (!selectedUser.value) return
  await assignRole(selectedUser.value.id, 'admin')
}

// أيقونات المجموعات
function getGroupIcon(iconName: string) {
  switch (iconName) {
    case 'users':
      return Users
    case 'package':
      return Package
    case 'store':
      return Store
    case 'userCheck':
      return UserCheck
    case 'shoppingBag':
      return ShoppingBag
    case 'fileText':
      return FileText
    case 'creditCard':
      return CreditCard
    case 'settings':
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
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <div class="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-solar-navy border border-sky-100 shadow-xs">
          <ShieldCheck class="size-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-solar-navy-dark tracking-tight">
            إدارة الصلاحيات والأدوار
          </h1>
          <p class="text-xs text-solar-text-muted mt-0.5">
            تخصيص مستويات الوصول وتعيين الصلاحيات الإجرائية للمشرفين والمسؤولين متصلة بـ API وقاعدة البيانات
          </p>
        </div>
      </div>

      <!-- زر تحديث الصلاحيات من السيرفر -->
      <button
        type="button"
        @click="handleRefresh"
        :disabled="isRefreshing || isLoading"
        class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle self-start sm:self-auto"
        title="تحديث قائمة الصلاحيات والمشرفين من قاعدة البيانات"
      >
        <RefreshCw class="size-4" :class="{ 'animate-spin': isRefreshing || isLoading || pending }" />
        <span>تحديث الصلاحيات</span>
      </button>
    </div>

    <!-- بطاقة التصفية واختيار المستخدم وإجراءات الحفظ -->
    <section class="solar-card p-4 sm:p-5 bg-white rounded-2xl border border-solar-border-card shadow-xs">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <!-- الجانب الأيمن: اختيار المستخدم المستهدف والدور الحالي -->
        <div class="flex flex-wrap items-center gap-4 sm:gap-6">
          <!-- اختيار المستخدم المستهدف من قاعدة البيانات -->
          <div class="w-full sm:w-auto min-w-[260px]">
            <label class="block text-[11px] font-bold text-solar-text-muted mb-1.5">
              المشرف / الحساب الإداري المستهدف
            </label>
            <div class="relative">
              <select
                :value="selectedUserId"
                @change="selectUser(($event.target as HTMLSelectElement).value)"
                class="solar-input h-11 w-full pl-9 pr-10 text-xs font-bold text-solar-text-heading appearance-none bg-white cursor-pointer hover:border-solar-navy/30 transition-colors"
              >
                <option v-for="user in adminUsers" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.email }})
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
              الدور المسند في النظام
            </label>
            <div class="flex items-center gap-2 h-11 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black select-none">
              <Shield class="size-4 text-amber-600" />
              <span>{{ selectedUser.role_title || selectedUser.roleTitle || 'مشرف إداري' }}</span>
            </div>
          </div>

          <!-- زر ترقية للدور الإداري إذا لم يكن أدمن -->
          <div v-if="selectedUser.role !== 'admin'">
            <label class="block text-[11px] font-bold text-solar-text-muted mb-1.5">
              ترقية الدور
            </label>
            <button
              type="button"
              @click="handlePromoteToAdmin"
              :disabled="isSaving"
              class="h-11 px-3.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="ترقية المستخدم إلى مدير نظام (Admin) ومنحه كافة الصلاحيات"
            >
              <UserPlus class="size-4" />
              <span>ترقية لمدير نظام</span>
            </button>
          </div>
        </div>

        <!-- الجانب الأيسر: زرا إلغاء التغييرات وحفظ الصلاحيات الحية -->
        <div class="flex items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <button
            type="button"
            @click="cancelChanges"
            :disabled="isSaving"
            class="btn-outline h-11 px-4 text-xs font-bold gap-2 text-slate-700 hover:text-solar-navy border-slate-200 bg-white hover:bg-slate-50 active:scale-98 transition-all"
          >
            <RotateCcw class="size-4 text-slate-500" />
            <span>إلغاء التغييرات</span>
          </button>

          <button
            type="button"
            @click="handleSavePermissions"
            :disabled="isSaving"
            class="btn-primary h-11 px-6 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-sm active:scale-98 transition-all"
          >
            <Loader2 v-if="isSaving" class="size-4 animate-spin" />
            <Save v-else class="size-4" />
            <span>{{ isSaving ? 'جارٍ الحفظ والتطبيق...' : 'حفظ الصلاحيات وتطبيقها' }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- شريط البحث السريع عن الصلاحيات -->
    <div class="relative">
      <Search class="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="البحث في الصلاحيات الـ 48 المسجلة في النظام (بالاسم أو الشرح أو الكود البرمجي)..."
        class="solar-input h-11 pr-10 pl-4 text-xs w-full bg-white shadow-xs"
      />
    </div>

    <!-- حالة التحميل الأولي -->
    <div v-if="pending && permissions.length === 0" class="flex flex-col items-center justify-center py-16 text-center solar-card">
      <Loader2 class="size-8 text-solar-navy animate-spin mb-3" />
      <p class="text-xs font-bold text-solar-text-muted">جاري تحميل الصلاحيات والمشرفين من قاعدة البيانات...</p>
    </div>

    <!-- بطاقة مصفوفة الصلاحيات الشاملة -->
    <section v-else class="solar-card p-4 sm:p-6 bg-white rounded-2xl border border-solar-border-card shadow-xs">
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
          <span class="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {{ selectedPermissionsCount }} من {{ totalPermissionsCount }} مسندة
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

      <!-- قائمة المجموعات من الصلاحيات (Accordions) -->
      <div class="divide-y divide-slate-100">
        <div
          v-for="group in filteredGroups"
          :key="group.id"
          class="py-4 first:pt-4 last:pb-1"
        >
          <!-- رأس المجموعة (Group Header) -->
          <div class="flex items-center justify-between py-2 cursor-pointer select-none group">
            <div @click="toggleGroupExpand(group.id)" class="flex items-center gap-3 flex-1">
              <div class="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-solar-navy group-hover:bg-solar-navy group-hover:text-white transition-colors shadow-2xs">
                <component :is="getGroupIcon(group.icon)" class="size-4.5 stroke-[2]" />
              </div>
              <div>
                <h2 class="text-xs sm:text-sm font-black text-solar-navy group-hover:text-solar-navy-dark transition-colors">
                  {{ group.title }}
                </h2>
                <p class="text-[10px] text-solar-text-muted mt-0.5">
                  {{ group.items.length }} صلاحية في هذا القسم
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 sm:gap-3">
              <!-- زر تحديد/إلغاء الكل للمجموعة -->
              <button
                type="button"
                @click.stop="toggleGroupSelection(group)"
                class="text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-md transition-colors"
                :class="isGroupAllSelected(group) ? 'bg-sky-100 text-sky-800 hover:bg-sky-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                title="تحديد أو إلغاء كافة صلاحيات هذه المجموعة"
              >
                {{ isGroupAllSelected(group) ? 'إلغاء المجموعة' : 'تحديد المجموعة' }}
              </button>

              <!-- مؤشر عدد الصلاحيات المحددة داخل المجموعة -->
              <span class="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md font-mono">
                {{ group.items.filter(i => currentPermissions.includes(i.id)).length }} / {{ group.items.length }}
              </span>

              <!-- سهم الفتح والإغلاق -->
              <button type="button" @click.stop="toggleGroupExpand(group.id)" class="p-1">
                <ChevronDown
                  class="size-4 text-slate-400 group-hover:text-solar-navy transition-transform duration-200"
                  :class="{ 'rotate-180': expandedGroups[group.id] }"
                />
              </button>
            </div>
          </div>

          <!-- قائمة عناصر الصلاحيات الفردية -->
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform -translate-y-1 opacity-0 max-h-0 overflow-hidden"
            enter-to-class="transform translate-y-0 opacity-100 max-h-[800px]"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform translate-y-0 opacity-100 max-h-[800px]"
            leave-to-class="transform -translate-y-1 opacity-0 max-h-0 overflow-hidden"
          >
            <div v-if="expandedGroups[group.id]" class="mt-2 pr-0 sm:pr-12 space-y-2">
              <div
                v-for="item in group.items"
                :key="item.id"
                @click="togglePermission(item.id, !currentPermissions.includes(item.id))"
                class="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50/80 cursor-pointer select-none transition-all group/item"
                :class="{ 'bg-slate-50/70 border-slate-200/60': currentPermissions.includes(item.id) }"
              >
                <!-- اسم الصلاحية وكودها ووصفها -->
                <div class="flex-1 pl-4">
                  <div class="flex items-center gap-2">
                    <span
                      class="text-xs sm:text-sm font-semibold transition-colors"
                      :class="currentPermissions.includes(item.id) ? 'text-solar-navy font-bold' : 'text-slate-600 group-hover/item:text-solar-navy'"
                    >
                      {{ item.label }}
                    </span>
                    <span class="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {{ item.id }}
                    </span>
                  </div>
                  <p v-if="item.description" class="text-[11px] text-solar-text-muted mt-0.5">
                    {{ item.description }}
                  </p>
                </div>

                <!-- مربع التحديد المطابق للتصميم -->
                <div
                  class="flex size-5 shrink-0 items-center justify-center rounded transition-all"
                  :class="[
                    currentPermissions.includes(item.id)
                      ? 'bg-solar-navy text-white shadow-xs'
                      : 'border-2 border-slate-300 bg-white group-hover/item:border-slate-400'
                  ]"
                >
                  <Check v-if="currentPermissions.includes(item.id)" class="size-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </section>
  </div>
</template>
