<script setup lang="ts">
import {
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  Loader2,
  RefreshCw,
  Store,
  Users,
  UserRoundCog,
  Wrench,
} from 'lucide-vue-next'
import AdminSectionHeading from '../../components/admin/workspace/AdminSectionHeading.vue'

definePageMeta({ layout: 'admin', alias: '/admin/dashboard' })
useSeoMeta({ title: 'لوحة تحكم الإدارة | SolarHub' })

const { users, fetchUsers } = useAdminUsers()
const { stores, fetchStores } = useAdminStores()
const { engineers, fetchEngineers } = useAdminEngineers()
const { orders, fetchOrders } = useAdminOrderManagement()
const { services, fetchServices } = useAdminServices()
const { notify } = useAdminNotice()

// تحميل متزامن للبيانات الحقيقية
const { pending, refresh } = useLazyAsyncData('admin_dashboard_stats', async () => {
  await Promise.allSettled([
    fetchUsers(false),
    fetchStores(false),
    fetchEngineers(false),
    fetchOrders(false),
    fetchServices(false),
  ])
  return true
})

const isRefreshing = ref(false)
async function handleRefresh() {
  isRefreshing.value = true
  try {
    await Promise.allSettled([
      fetchUsers(true),
      fetchStores(true),
      fetchEngineers(true),
      fetchOrders(true),
      fetchServices(true),
    ])
    notify('تم تحديث مؤشرات وإحصائيات لوحة التحكم بنجاح.')
  } finally {
    isRefreshing.value = false
  }
}

const today = ref('')
onMounted(() => {
  today.value = new Intl.DateTimeFormat('ar-SA', {
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Riyadh',
  }).format(new Date())
})

// إحصائيات معتمدة من قاعدة البيانات
const pendingSuppliers = computed(() => stores.value.filter(s => s.approval === 'pending').length)
const pendingEngineers = computed(() => engineers.value.filter(e => e.approval === 'pending').length)
const pendingOrders = computed(() => orders.value.filter(o => o.status === 'قيد المعالجة').length)
const openServices = computed(() => services.value.filter(s => s.status === 'open').length)

const stats = computed(() => [
  {
    label: 'المستخدمون المسجلون',
    value: users.value.length,
    detail: 'حساب مسجل',
    icon: Users,
    warm: false,
  },
  {
    label: 'المتاجر والموردون',
    value: stores.value.filter(s => s.approval === 'approved').length,
    detail: 'متجر معتمد',
    icon: Store,
    warm: true,
  },
  {
    label: 'المهندسون الاستشاريون',
    value: engineers.value.filter(e => e.approval === 'approved').length,
    detail: 'مهندس معتمد',
    icon: UserRoundCog,
    warm: false,
  },
  {
    label: 'طلبات الشراء',
    value: orders.value.length,
    detail: 'طلب شراء في النظام',
    icon: ClipboardList,
    warm: true,
  },
])

const tasks = computed(() => [
  {
    title: 'طلبات الشراء التي تحتاج إلى معالجة',
    count: pendingOrders.value,
    description: 'طلبًا جديدًا بانتظار الإجراء',
    label: 'تحتاج إجراء',
    to: '/admin/orders?status=' + encodeURIComponent('قيد المعالجة'),
    icon: ClipboardList,
    tone: pendingOrders.value > 0 ? 'text-amber-700 bg-amber-50' : 'text-slate-500 bg-slate-100',
  },
  {
    title: 'طلبات اعتماد الموردين الجدد',
    count: pendingSuppliers.value,
    description: 'متاجر بانتظار التحقق والاعتماد',
    label: 'قيد الفحص',
    to: '/admin/stores?status=pending',
    icon: Store,
    tone: pendingSuppliers.value > 0 ? 'text-amber-700 bg-amber-50' : 'text-slate-500 bg-slate-100',
  },
  {
    title: 'طلبات اعتماد المهندسين الجدد',
    count: pendingEngineers.value,
    description: 'مهندسين بانتظار فحص الشهادات',
    label: 'وثائق جديدة',
    to: '/admin/engineers?status=pending',
    icon: UserRoundCog,
    tone: pendingEngineers.value > 0 ? 'text-amber-700 bg-amber-50' : 'text-slate-500 bg-slate-100',
  },
  {
    title: 'طلبات الخدمات الهندسية المفتوحة',
    count: openServices.value,
    description: 'طلب خدمة قيد استقبال عروض الأسعار',
    label: 'مفتوحة للعروض',
    to: '/admin/services',
    icon: Wrench,
    tone: openServices.value > 0 ? 'text-blue-700 bg-blue-50' : 'text-slate-500 bg-slate-100',
  },
])
</script>

<template>
  <div class="admin-managed">
    <AdminSectionHeading
      title="مرحبًا بك في لوحة تحكم Solar Hub"
      description="متابعة حية ومباشرة لكافة مؤشرات المنصة والطلبات التي تتطلب مراجعة فورية."
    >
      <button
        class="btn-outline"
        :disabled="isRefreshing || pending"
        @click="handleRefresh"
      >
        <RefreshCw class="size-4" :class="isRefreshing ? 'animate-spin' : ''" />
        تحديث المؤشرات
      </button>
      <span class="inline-flex items-center gap-2 rounded-xl border border-solar-border-card bg-white px-4 py-2.5 text-xs font-bold shadow-xs">
        <CalendarDays class="size-4 text-solar-yellow" />
        اليوم: {{ today || 'جارٍ تحميل التاريخ...' }}
      </span>
    </AdminSectionHeading>

    <!-- بطاقات المؤشرات الرقمية -->
    <div class="mt-4 grid gap-5 border-t border-solar-border-card pt-6 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="solar-card flex items-center gap-4 !p-5 transition-shadow hover:shadow-sm"
      >
        <span
          class="flex size-13 shrink-0 items-center justify-center rounded-2xl"
          :class="stat.warm ? 'bg-amber-100/70 text-amber-800' : 'bg-solar-bg-subtle text-solar-navy'"
        >
          <component :is="stat.icon" class="size-6.5" />
        </span>
        <div class="min-w-0 flex-1">
          <h2 class="text-xs font-semibold text-solar-text-muted truncate">{{ stat.label }}</h2>
          <div class="mt-2 flex items-baseline gap-2">
            <span v-if="pending" class="size-5 animate-pulse rounded bg-slate-200"></span>
            <p v-else class="text-2xl font-bold tracking-tight text-solar-navy">
              {{ stat.value.toLocaleString('ar-SA', { numberingSystem: 'latn' }) }}
            </p>
            <span class="text-xs text-solar-text-muted truncate">{{ stat.detail }}</span>
          </div>
        </div>
      </article>
    </div>

    <!-- قائمة المهام والمتابعة المباشرة -->
    <section class="mt-8">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-solar-navy">متابعة المنصة الفورية</h2>
          <p class="mt-1 text-xs text-solar-text-muted">المهام والطلبات التي تتطلب مراجعة أو إجراءً إدارياً في النظام</p>
        </div>
      </div>

      <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="task in tasks"
          :key="task.to"
          class="solar-card flex flex-col justify-between !p-5 transition-all hover:border-solar-border-card hover:shadow-sm"
        >
          <div>
            <div class="flex items-center justify-between gap-3">
              <span class="flex size-10 items-center justify-center rounded-xl" :class="task.tone">
                <component :is="task.icon" class="size-5" />
              </span>
              <span class="rounded-full px-2.5 py-1 text-[11px] font-bold" :class="task.tone">
                {{ task.label }}
              </span>
            </div>
            <h3 class="mt-4 text-sm font-bold text-solar-navy leading-snug">{{ task.title }}</h3>
            <p class="mt-2 text-xs text-solar-text-muted">
              <strong class="text-solar-navy text-sm">{{ task.count }}</strong> {{ task.description }}
            </p>
          </div>

          <div class="mt-5 border-t border-solar-border-card/60 pt-3">
            <NuxtLink
              :to="task.to"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-solar-navy hover:text-solar-yellow transition-colors cursor-pointer"
            >
              الانتقال للمراجعة
              <ChevronLeft class="size-3.5" />
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
