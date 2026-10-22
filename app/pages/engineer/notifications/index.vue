<script setup lang="ts">
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  MessageSquare,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-vue-next'
import AppToast from '~/components/common/AppToast.vue'

definePageMeta({ layout: 'engineer' })
useSeoMeta({
  title: 'إشعارات المهندس | SolarHub - بوابة المهندسين',
  description: 'متابعة تنبيهات طلبات الخدمات، العروض الهندسية، والاعتمادات المهنية.',
})

export interface EngineerNotification {
  id: number
  title: string
  category: string
  message: string
  time: string
  read: boolean
  rating?: number
  actionLabel: string
  actionLink: string
  icon: any
  iconBg: string
  iconColor: string
}

const { $api } = useNuxtApp()
const filterTab = ref<'all' | 'unread'>('all')
const toastMessage = ref('')
const isLoading = ref(false)

const fallbackNotifications: EngineerNotification[] = [
  {
    id: 1,
    title: 'قبول العرض الهندسي للطلب #SR-2025-1042',
    category: 'عروض مقبولة',
    message: 'وافق العميل طارق منصور العمري على عرضك الهندسي لدراسة جدوى وتصميم محطة On-Grid بقدرة 25 kWp.',
    time: 'اليوم، 11:30 ص',
    read: false,
    actionLabel: 'عرض تفاصيل المشروع والعرض',
    actionLink: '/engineer/offers',
    icon: CheckCircle2,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
  },
  {
    id: 2,
    title: 'طلب خدمة هندسية جديد متطابق مع تخصصك',
    category: 'طلبات جديدة',
    message: 'تم طرح طلب خدمة جديد: «فحص وتدقيق أداء محطة قائمة بقدرة 80 kWp في منطقة عسير». الطلب متاح الآن لتقديم العروض.',
    time: 'اليوم، 09:15 ص',
    read: false,
    actionLabel: 'تقديم عرض هندسي',
    actionLink: '/engineer/service-requests',
    icon: Zap,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 3,
    title: 'تم التحقق ومزامنة الترخيص المهني بنجاح',
    category: 'الاعتماد والتراخيص',
    message: 'تم تحديث ومزامنة بيانات الاعتماد المهني الصادر من الهيئة السعودية للمهندسين ومطابقتها.',
    time: 'أمس، 04:20 م',
    read: true,
    actionLabel: 'معاينة الملف المهني',
    actionLink: '/engineer/profile',
    icon: ShieldCheck,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
]

const notifications = ref<EngineerNotification[]>([...fallbackNotifications])

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'الآن'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

async function loadNotifications() {
  try {
    isLoading.value = true
    const res = await $api<any>('/my/notifications')
    const items = res?.data || res
    if (Array.isArray(items) && items.length > 0) {
      notifications.value = items.map((n: any) => ({
        id: n.id,
        title: n.title || 'إشعار من المنصة',
        category: n.title?.includes('عرض') ? 'العروض' : n.title?.includes('طلب') ? 'طلبات جديدة' : 'تنبيه',
        message: n.body || '',
        time: formatRelativeTime(n.created_at),
        read: !!n.is_read,
        actionLabel: 'عرض التفاصيل',
        actionLink: n.action_url || '/engineer/dashboard',
        icon: n.title?.includes('عرض') ? CheckCircle2 : n.title?.includes('طلب') ? Zap : Bell,
        iconBg: n.is_read ? 'bg-gray-100' : 'bg-amber-100',
        iconColor: n.is_read ? 'text-gray-700' : 'text-amber-700',
      }))
    }
  } catch (err: any) {
    // Keep fallback list on network or unauthenticated error
  } finally {
    isLoading.value = false
  }
}

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const totalCount = computed(() => notifications.value.length)

const filteredNotifications = computed(() => {
  if (filterTab.value === 'unread') {
    return notifications.value.filter(n => !n.read)
  }
  return notifications.value
})

async function markAllAsRead() {
  try {
    await $api('/my/notifications/read-all', { method: 'PATCH' })
    notifications.value.forEach(n => { n.read = true })
    showToast('تم تحديد جميع الإشعارات كمقروءة')
  } catch (err: any) {
    notifications.value.forEach(n => { n.read = true })
    showToast('تم تحديد جميع الإشعارات كمقروءة')
  }
}

async function markSingleAsRead(item: EngineerNotification) {
  if (item.read) return
  item.read = true
  try {
    await $api(`/my/notifications/${item.id}/read`, { method: 'PATCH' })
  } catch {
    // Handled locally
  }
}

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

onMounted(() => {
  loadNotifications()
})
</script>

<template>
  <div class="flex flex-col gap-6 pb-10">
    <!-- رأس الصفحة -->
    <header class="flex flex-col gap-1 text-right">
      <h1 class="text-2xl font-black text-solar-text-heading md:text-3xl">
        إشعارات المهندس
      </h1>
      <p class="text-xs sm:text-sm text-solar-text-secondary">
        متابعة تنبيهات طلبات الخدمات، العروض الهندسية، والاعتمادات المهنية
      </p>
    </header>

    <!-- شريط الفلترة والأزرار العلوية -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-solar-border-card/60 pb-3">
      <!-- زر تحديد الكل كمقروء -->
      <button
        type="button"
        class="flex items-center gap-1.5 text-xs font-bold text-solar-text-body hover:text-solar-navy-dark transition-colors self-start sm:self-auto"
        @click="markAllAsRead"
      >
        <CheckCheck class="size-4 text-solar-yellow" />
        <span>تحديد الكل كمقروء</span>
      </button>

      <!-- التبويبات: الكل وغير المقروءة -->
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all"
          :class="filterTab === 'unread' ? 'bg-solar-navy-dark text-white' : 'bg-solar-bg-subtle text-solar-text-heading hover:bg-solar-border-card/40'"
          @click="filterTab = 'unread'"
        >
          <span class="flex size-4 items-center justify-center rounded-full bg-solar-yellow text-[10px] font-black text-solar-navy-dark">
            {{ unreadCount }}
          </span>
          <span>غير المقروءة</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all"
          :class="filterTab === 'all' ? 'bg-solar-navy-dark text-white' : 'bg-solar-bg-subtle text-solar-text-heading hover:bg-solar-border-card/40'"
          @click="filterTab = 'all'"
        >
          <span>الكل</span>
          <span class="text-xs opacity-70">{{ totalCount }}</span>
        </button>
      </div>
    </div>

    <!-- قائمة الإشعارات -->
    <div class="space-y-4">
      <div
        v-for="item in filteredNotifications"
        :key="item.id"
        class="relative overflow-hidden rounded-2xl border border-solar-border-card bg-white p-5 sm:p-6 shadow-card transition-all hover:border-solar-yellow/50"
        :class="{ 'border-r-4 border-r-solar-yellow': !item.read }"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <!-- تفاصيل الإشعار والوقت (يسار في RTL) -->
          <div class="flex items-center gap-2 text-xs text-solar-text-muted self-start sm:self-auto">
            <span
              class="rounded-md px-2 py-0.5 text-[10px] font-bold"
              :class="!item.read ? 'bg-solar-yellow text-solar-navy-dark font-black' : 'bg-solar-bg-subtle text-solar-text-muted'"
            >
              {{ !item.read ? 'غير مقروء' : 'مقروء' }}
            </span>
            <span class="flex items-center gap-1">
              <Clock class="size-3" />
              {{ item.time }}
            </span>
          </div>

          <!-- محتوى الإشعار (يمين في RTL) -->
          <div class="flex items-start gap-3.5 text-right flex-1 justify-end">
            <div>
              <div class="flex flex-wrap items-center justify-end gap-2 mb-1">
                <span class="rounded-md bg-solar-bg-subtle px-2 py-0.5 text-[10px] font-bold text-solar-text-heading">
                  {{ item.category }}
                </span>
                <h3 class="text-sm font-bold text-solar-text-heading">
                  {{ item.title }}
                </h3>
              </div>

              <!-- نجوم التقييم إن وجدت -->
              <div v-if="item.rating" class="flex items-center justify-end gap-1 text-solar-yellow my-1">
                <span class="text-xs font-bold text-solar-text-heading ml-1">5.0</span>
                <Star v-for="i in 5" :key="i" class="size-3.5 fill-solar-yellow text-solar-yellow" />
              </div>

              <!-- نص الإشعار -->
              <p class="text-xs sm:text-sm text-solar-text-body leading-relaxed max-w-2xl mt-1">
                {{ item.message }}
              </p>

              <!-- رابط الإجراء -->
              <NuxtLink
                :to="item.actionLink"
                class="inline-flex items-center gap-1.5 text-xs font-bold text-solar-navy hover:text-solar-yellow-active transition-colors mt-3"
                @click="markSingleAsRead(item)"
              >
                <span>{{ item.actionLabel }}</span>
                <ArrowLeft class="size-3" />
              </NuxtLink>
            </div>

            <!-- أيقونة الإشعار -->
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-xl shadow-xs"
              :class="[item.iconBg, item.iconColor]"
            >
              <component :is="item.icon" class="size-5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- الترقيم والتنقل (Pagination) -->
    <div class="mt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-solar-border-card/60 pt-4 text-xs text-solar-text-muted">
      <div class="flex items-center justify-center gap-1.5 self-center sm:self-auto">
        <button
          type="button"
          class="flex items-center gap-1 rounded-lg border border-solar-border-card px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          disabled
        >
          <ChevronRight class="size-3.5" />
          <span>السابق</span>
        </button>

        <button
          type="button"
          class="size-8 rounded-lg border border-solar-navy-dark bg-solar-navy-dark text-xs font-bold text-white"
        >
          1
        </button>

        <button
          type="button"
          class="size-8 rounded-lg border border-solar-border-card text-xs font-bold text-solar-text-body hover:border-solar-navy"
        >
          2
        </button>

        <button
          type="button"
          class="flex items-center gap-1 rounded-lg border border-solar-border-card px-2.5 py-1.5 text-xs font-semibold text-solar-text-body hover:border-solar-navy transition-colors"
        >
          <span>التالي</span>
          <ChevronLeft class="size-3.5" />
        </button>
      </div>

      <span class="text-center sm:text-right">
        عرض 1 - 5 من إجمالي 6 إشعارات
      </span>
    </div>

    <!-- Toast للتنبيهات -->
    <AppToast :message="toastMessage" />
  </div>
</template>
