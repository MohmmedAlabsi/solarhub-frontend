<script setup lang="ts">
import {
  AlertCircle,
  ArrowRight,
  Ban,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HardHat,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Tag,
  User,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import {
  useCustomerServices,
  requestStatusLabels,
  type ApiServiceOffer,
} from '~~/app/composables/useCustomerServices'

definePageMeta({
  layout: 'customer',
})

const route = useRoute()
const router = useRouter()
const requestId = computed(() => Number(route.params.id))

const {
  currentRequest,
  offers,
  isLoading,
  isActionLoading,
  error,
  fetchRequestDetails,
  fetchOffers,
  acceptOffer,
  cancelServiceRequest,
  confirmCompletion,
  rateEngineer,
} = useCustomerServices()

const pendingAcceptOffer = ref<ApiServiceOffer | null>(null)
const isAcceptModalOpen = ref(false)
const isCancelModalOpen = ref(false)
const successMessage = ref('')
const actionError = ref('')

useSeoMeta({
  title: () => currentRequest.value
    ? `طلب خدمة #${requestId.value} (${currentRequest.value.service_type?.name || 'خدمة هندسية'}) | SolarHub`
    : 'تفاصيل طلب الخدمة الهندسية | SolarHub',
})

function getStatusBadge(status: string) {
  return requestStatusLabels[status] || { label: status, class: 'bg-gray-100 text-gray-700 border-gray-200' }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

async function loadData() {
  if (isNaN(requestId.value) || requestId.value <= 0) return
  await Promise.allSettled([
    fetchRequestDetails(requestId.value),
    fetchOffers(requestId.value),
  ])
}

function openAcceptConfirmation(offer: ApiServiceOffer) {
  pendingAcceptOffer.value = offer
  isAcceptModalOpen.value = true
  actionError.value = ''
}

async function handleConfirmAccept() {
  if (!pendingAcceptOffer.value) return
  actionError.value = ''
  try {
    await acceptOffer(pendingAcceptOffer.value.id)
    successMessage.value = 'تم قبول العرض الهندسي بنجاح وتعميد المشروع للبدء الفوري!'
    isAcceptModalOpen.value = false
    pendingAcceptOffer.value = null
    // إعادة تحميل البيانات للتأكد من المزامنة
    await loadData()
  } catch (err: any) {
    actionError.value = err?.data?.message || err?.message || 'تعذر قبول العرض، يرجى المحاولة لاحقاً.'
  }
}

async function handleConfirmCancel() {
  actionError.value = ''
  try {
    await cancelServiceRequest(requestId.value)
    successMessage.value = 'تم إلغاء طلب الخدمة بنجاح.'
    isCancelModalOpen.value = false
    await loadData()
  } catch (err: any) {
    actionError.value = err?.data?.message || err?.message || 'تعذر إلغاء الطلب، يرجى المحاولة لاحقاً.'
  }
}

// ===== دورة حياة الطلب بعد قبول العرض =====
const acceptedOffer = computed(() => offers.value.find(o => o.status === 'accepted') || null)
const isConfirmCompletionOpen = ref(false)
const isRatingOpen = ref(false)
const ratingValue = ref(0)
const ratingComment = ref('')
const ratingError = ref('')

const lifecycleSteps = computed(() => {
  const r = currentRequest.value
  if (!r) return []
  return [
    { key: 'awarded', label: 'تم قبول العرض', done: ['awarded', 'in_progress', 'completed'].includes(r.status) },
    { key: 'started', label: 'بدأ المهندس التنفيذ', done: !!r.started_at || ['in_progress', 'completed'].includes(r.status) },
    { key: 'done', label: 'أبلغ المهندس بإنهاء العمل', done: !!r.engineer_completed_at || r.status === 'completed' },
    { key: 'completed', label: 'تأكيد الاكتمال', done: r.status === 'completed' },
    { key: 'rated', label: 'تقييم المهندس', done: !!r.rating },
  ]
})

const ratingStars = computed(() => {
  const n = currentRequest.value?.rating?.rating || 0
  return '★'.repeat(n) + '☆'.repeat(5 - n)
})

async function handleConfirmCompletion() {
  actionError.value = ''
  try {
    await confirmCompletion(requestId.value)
    successMessage.value = 'تم تأكيد اكتمال المشروع. يمكنك الآن تقييم المهندس.'
    isConfirmCompletionOpen.value = false
    await loadData()
  } catch (err: any) {
    isConfirmCompletionOpen.value = false
    actionError.value = err?.data?.message || 'تعذر تأكيد اكتمال المشروع، حاول مرة أخرى.'
  }
}

function openRating() {
  ratingValue.value = 0
  ratingComment.value = ''
  ratingError.value = ''
  isRatingOpen.value = true
}

async function handleSubmitRating() {
  if (ratingValue.value < 1 || ratingValue.value > 5) {
    ratingError.value = 'اختر تقييماً من 1 إلى 5 نجوم.'
    return
  }
  ratingError.value = ''
  try {
    await rateEngineer(requestId.value, ratingValue.value, ratingComment.value)
    successMessage.value = 'شكراً لك، تم حفظ تقييمك للمهندس.'
    isRatingOpen.value = false
  } catch (err: any) {
    ratingError.value = err?.data?.message || 'تعذر حفظ التقييم، حاول مرة أخرى.'
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-solar-text-muted" aria-label="مسار التنقل">
      <NuxtLink to="/customer/dashboard" class="hover:text-solar-text-heading">الرئيسية</NuxtLink>
      <span>/</span>
      <NuxtLink to="/customer/services" class="hover:text-solar-text-heading">طلبات الخدمات الهندسية</NuxtLink>
      <span>/</span>
      <span class="font-bold text-solar-text-heading">تفاصيل الطلب وعروض المهندسين</span>
    </nav>

    <!-- Header Section -->
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-black text-solar-text-heading">
            طلب خدمة #SR-{{ requestId }}
          </h1>
          <span
            v-if="currentRequest"
            class="rounded-full border px-3 py-1 text-xs font-bold"
            :class="getStatusBadge(currentRequest.status).class"
          >
            {{ getStatusBadge(currentRequest.status).label }}
          </span>
        </div>
        <p class="mt-1 text-xs text-solar-text-muted">
          مراجعة بيانات المشروع ومقارنة العروض الفنية والمالية المقدمة من المهندسين المعتمدين
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="loadData()"
          :disabled="isLoading"
          class="flex size-10 items-center justify-center rounded-xl border border-solar-border-card bg-white text-solar-text-body hover:bg-solar-bg-subtle transition-all cursor-pointer disabled:opacity-50"
          title="تحديث البيانات"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': isLoading }" />
        </button>

        <NuxtLink
          to="/customer/services"
          class="btn-outline gap-2 h-10 px-4 text-xs font-bold"
        >
          <ArrowRight class="size-4" />
          <span>العودة لطلبات الخدمات</span>
        </NuxtLink>
      </div>
    </header>

    <!-- Success / Error Alert Notifications -->
    <div v-if="successMessage" class="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-800 border border-emerald-200">
      <CheckCircle2 class="size-5 shrink-0 text-emerald-600" />
      <span>{{ successMessage }}</span>
      <button type="button" @click="successMessage = ''" class="mr-auto font-bold underline">إغلاق</button>
    </div>

    <div v-if="error || actionError" class="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
      <AlertCircle class="size-5 shrink-0" />
      <span>{{ error || actionError }}</span>
      <button type="button" @click="actionError = ''" class="mr-auto font-bold underline">إغلاق</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !currentRequest" class="flex flex-col items-center justify-center rounded-2xl border border-solar-border-card bg-white p-12 text-center shadow-sm">
      <Loader2 class="size-8 animate-spin text-amber-500 mb-3" />
      <p class="text-xs font-semibold text-solar-text-muted">جارٍ تحميل بيانات المشروع وعروض المهندسين...</p>
    </div>

    <!-- Request Found -->
    <template v-else-if="currentRequest">
      <!-- 1. كرت ملخص بيانات المشروع -->
      <section class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm flex flex-col gap-5">
        <div class="flex items-center justify-between border-b border-solar-border-card pb-4">
          <div class="flex items-center gap-2">
            <Wrench class="size-5 text-amber-500" />
            <h2 class="text-base font-bold text-solar-text-heading">
              بيانات ومواصفات الطلب المقدم
            </h2>
          </div>

          <div class="flex items-center gap-2">
            <!-- زر إلغاء الطلب إن كان لا يزال مفتوحاً -->
            <button
              v-if="currentRequest.status === 'open_for_bids'"
              type="button"
              @click="isCancelModalOpen = true"
              class="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-all cursor-pointer"
            >
              <Ban class="size-3.5" />
              <span>إلغاء الطلب</span>
            </button>
          </div>
        </div>

        <!-- شبكة المعلومات التفصيلية -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="flex flex-col gap-1 rounded-xl bg-solar-bg-subtle/70 p-3.5">
            <span class="text-[11px] text-solar-text-muted">نوع الخدمة الهندسية:</span>
            <span class="text-xs font-bold text-solar-text-heading">{{ currentRequest.service_type?.name || 'خدمة هندسية' }}</span>
          </div>

          <div class="flex flex-col gap-1 rounded-xl bg-solar-bg-subtle/70 p-3.5">
            <span class="text-[11px] text-solar-text-muted">المحافظة / الموقع:</span>
            <span class="text-xs font-bold text-solar-text-heading">{{ currentRequest.governorate?.name_ar || 'غير محدد' }}</span>
          </div>

          <div class="flex flex-col gap-1 rounded-xl bg-solar-bg-subtle/70 p-3.5">
            <span class="text-[11px] text-solar-text-muted">السعة التقديرية للنظام:</span>
            <span class="text-xs font-bold text-solar-text-heading">{{ currentRequest.system_capacity_estimate ? `${currentRequest.system_capacity_estimate} kW` : 'غير محدد' }}</span>
          </div>

          <div class="flex flex-col gap-1 rounded-xl bg-solar-bg-subtle/70 p-3.5">
            <span class="text-[11px] text-solar-text-muted">تاريخ النشر:</span>
            <span class="text-xs font-bold text-solar-text-heading">{{ formatDate(currentRequest.created_at) }}</span>
          </div>
        </div>

        <!-- وصف المشروع -->
        <div class="flex flex-col gap-1.5 pt-2">
          <span class="text-xs font-bold text-solar-text-heading">وصف المشروع والاحتياج المطلوب:</span>
          <p class="text-xs text-solar-text-body leading-relaxed bg-solar-bg-subtle/40 rounded-xl p-4 border border-solar-border-card/50">
            {{ currentRequest.description }}
          </p>
        </div>

        <!-- تفاصيل الموقع والإحداثيات والمرفقات إن وجدت -->
        <div class="grid gap-4 sm:grid-cols-2 pt-2 border-t border-solar-border-card/60">
          <div v-if="currentRequest.location_details" class="flex items-start gap-2 text-xs">
            <MapPin class="size-4 text-solar-text-muted shrink-0 mt-0.5" />
            <div>
              <span class="font-bold text-solar-text-heading">العنوان التفصيلي: </span>
              <span class="text-solar-text-muted">{{ currentRequest.location_details }}</span>
              <div v-if="currentRequest.location_coordinates" class="font-mono text-[10px] text-solar-text-muted mt-0.5">
                إحداثيات: {{ currentRequest.location_coordinates }}
              </div>
            </div>
          </div>

          <div v-if="currentRequest.attachment_file" class="flex items-center gap-2 text-xs">
            <FileText class="size-4 text-solar-text-muted shrink-0" />
            <span class="font-bold text-solar-text-heading">الملف المرفق:</span>
            <span class="text-solar-text-muted font-mono truncate max-w-[200px]">{{ currentRequest.attachment_file }}</span>
          </div>
        </div>
      </section>

      <!-- 1.5 مراحل تنفيذ المشروع (بعد قبول العرض) -->
      <section
        v-if="['awarded', 'in_progress', 'completed'].includes(currentRequest.status)"
        class="rounded-2xl border border-solar-border-card bg-white p-6 shadow-sm flex flex-col gap-5"
        data-testid="service-lifecycle"
      >
        <div class="flex items-center gap-2 border-b border-solar-border-card pb-4">
          <ShieldCheck class="size-5 text-emerald-600" />
          <h2 class="text-base font-bold text-solar-text-heading">مراحل تنفيذ المشروع</h2>
          <span v-if="acceptedOffer?.engineer?.name" class="mr-auto text-xs text-solar-text-muted">
            المهندس: <strong class="text-solar-text-heading">{{ acceptedOffer.engineer.name }}</strong>
          </span>
        </div>

        <ol class="grid gap-2 sm:grid-cols-5">
          <li
            v-for="step in lifecycleSteps"
            :key="step.key"
            class="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold"
            :class="step.done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-solar-border-card bg-solar-bg-subtle/60 text-solar-text-muted'"
          >
            <CheckCircle2 v-if="step.done" class="size-4 shrink-0" aria-hidden="true" />
            <Clock v-else class="size-4 shrink-0" aria-hidden="true" />
            <span>{{ step.label }}</span>
          </li>
        </ol>

        <!-- الإجراء المناسب للمرحلة الحالية -->
        <div class="rounded-xl bg-solar-bg-subtle/60 p-4 text-xs leading-relaxed text-solar-text-body">
          <template v-if="currentRequest.status === 'awarded'">
            بانتظار أن يبدأ المهندس التنفيذ. سيصلك إشعار عند البدء.
          </template>
          <template v-else-if="currentRequest.status === 'in_progress' && !currentRequest.engineer_completed_at">
            المشروع قيد التنفيذ. عندما يبلغ المهندس بإنهاء العمل ستتمكن من تأكيد الاكتمال.
          </template>
          <div v-else-if="currentRequest.status === 'in_progress'" class="flex flex-wrap items-center justify-between gap-3">
            <span>أبلغ المهندس بإنهاء العمل. راجع التنفيذ ثم أكّد اكتمال المشروع.</span>
            <button
              type="button"
              class="btn-primary h-9 px-5 text-xs font-bold gap-2"
              :disabled="isActionLoading"
              @click="isConfirmCompletionOpen = true"
            >
              <CheckCircle2 class="size-4" />
              <span>تأكيد اكتمال المشروع</span>
            </button>
          </div>
          <div v-else-if="currentRequest.status === 'completed' && !currentRequest.rating" class="flex flex-wrap items-center justify-between gap-3">
            <span>اكتمل المشروع. قيّم تجربتك مع المهندس لمساعدة العملاء الآخرين.</span>
            <button type="button" class="btn-primary h-9 px-5 text-xs font-bold gap-2" @click="openRating">
              <span>تقييم المهندس</span>
            </button>
          </div>
          <div v-else-if="currentRequest.rating" class="flex flex-wrap items-center gap-2">
            <span>تقييمك للمهندس:</span>
            <span class="font-bold text-amber-600" :aria-label="currentRequest.rating.rating + ' من 5'">{{ ratingStars }}</span>
            <span v-if="currentRequest.rating.comment" class="text-solar-text-muted">«{{ currentRequest.rating.comment }}»</span>
          </div>
        </div>
      </section>

      <!-- 2. قسم عروض المهندسين -->
      <section class="flex flex-col gap-4">
        <div class="flex items-center justify-between border-b border-solar-border-card pb-3">
          <div class="flex items-center gap-2">
            <Tag class="size-5 text-indigo-600" />
            <h2 class="text-base font-bold text-solar-text-heading">
              عروض المهندسين المعتمدين
            </h2>
            <span class="rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold">
              {{ offers.length }} عروض
            </span>
          </div>

          <span class="text-xs text-solar-text-muted">
            {{ currentRequest.status === 'open_for_bids' ? 'يمكنك قبول عرض واحد لاعتماد المشروع والبدء المباشر' : 'تم اعتماد العرض المختار لهذا الطلب' }}
          </span>
        </div>

        <!-- إذا لم يتوفر أي عرض بعد -->
        <div
          v-if="offers.length === 0"
          class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-solar-border-card bg-white p-12 text-center"
        >
          <div class="flex size-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-3">
            <HardHat class="size-7" />
          </div>
          <h3 class="text-sm font-bold text-solar-text-heading mb-1">بانتظار تقديم عروض المهندسين</h3>
          <p class="max-w-md text-xs text-solar-text-muted leading-relaxed">
            تم إشعار المهندسين المؤهلين بمشروعك. سيتم إدراج عروضهم الفنية والمالية هنا تباعاً ويمكنك مقارنتها واختيار العرض الأنسب.
          </p>
        </div>

        <!-- قائمة كروت العروض -->
        <div v-else class="grid gap-4 md:grid-cols-2">
          <article
            v-for="offer in offers"
            :key="offer.id"
            class="relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all"
            :class="offer.status === 'accepted'
              ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/20'
              : 'border-solar-border-card hover:border-amber-300'"
          >
            <!-- بادج العرض المقبول -->
            <div
              v-if="offer.status === 'accepted'"
              class="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-xs"
            >
              <Check class="size-3 stroke-[3]" />
              <span>العرض المقبول والمعتمد</span>
            </div>

            <div class="flex flex-col gap-4">
              <!-- بيانات المهندس -->
              <div class="flex items-center gap-3 border-b border-solar-border-card/60 pb-3">
                <div class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-solar-bg-subtle border border-solar-border-card">
                  <img
                    v-if="offer.engineer?.profile_photo_path"
                    :src="offer.engineer.profile_photo_path"
                    :alt="offer.engineer?.name || 'مهندس'"
                    class="size-full object-cover"
                  />
                  <HardHat v-else class="size-6 text-solar-text-muted" />
                </div>

                <div class="flex flex-col">
                  <span class="text-sm font-bold text-solar-text-heading">{{ offer.engineer?.name || 'مهندس معتمد' }}</span>
                  <span class="text-xs text-solar-text-muted">
                    {{ offer.engineer?.years_of_experience ? `خبرة ${offer.engineer.years_of_experience} سنوات` : 'مهندس مصنف في المنصة' }}
                  </span>
                </div>

                <span class="mr-auto text-[11px] text-solar-text-muted font-mono">
                  {{ formatDate(offer.created_at) }}
                </span>
              </div>

              <!-- السعر والمدة -->
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-0.5 rounded-xl bg-solar-bg-subtle p-3">
                  <span class="text-[11px] text-solar-text-muted">التكلفة التقديرية المقترحة:</span>
                  <span class="text-sm font-black text-amber-600 font-mono">
                    {{ offer.proposed_cost }} <span class="text-[10px] font-normal text-solar-text-muted">YER</span>
                  </span>
                </div>

                <div class="flex flex-col gap-0.5 rounded-xl bg-solar-bg-subtle p-3">
                  <span class="text-[11px] text-solar-text-muted">مدة التنفيذ المتوقعة:</span>
                  <span class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
                    <Clock class="size-3 text-solar-text-muted" />
                    {{ offer.execution_time_days }} أيام
                  </span>
                </div>
              </div>

              <!-- المقترح الفني -->
              <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-solar-text-heading">المقترح الفني وتفاصيل التنفيذ:</span>
                <p class="text-xs text-solar-text-body leading-relaxed bg-solar-bg-subtle/50 rounded-xl p-3 border border-solar-border-card/40">
                  {{ offer.technical_proposal }}
                </p>
              </div>

              <!-- ملف المقترح إن وجد -->
              <div v-if="offer.proposal_file" class="flex items-center gap-2 text-xs text-solar-text-muted">
                <FileText class="size-3.5 text-solar-text-muted" />
                <span>ملف كراسة العرض الفني متوفر</span>
              </div>
            </div>

            <!-- أزرار الإجراء للعرض -->
            <div class="mt-5 flex items-center justify-between border-t border-solar-border-card pt-3">
              <span class="text-xs font-bold">
                <span v-if="offer.status === 'accepted'" class="text-emerald-700">معتمد وقيد المتابعة</span>
                <span v-else-if="offer.status === 'rejected'" class="text-solar-text-muted">لم يتم اختياره</span>
                <span v-else class="text-amber-700">بانتظار قرارك</span>
              </span>

              <!-- زر قبول العرض -->
              <button
                v-if="currentRequest.status === 'open_for_bids' && offer.status === 'pending'"
                type="button"
                @click="openAcceptConfirmation(offer)"
                :disabled="isActionLoading"
                class="btn-primary gap-1.5 h-9 px-4 text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Check class="size-3.5" />
                <span>قبول هذا العرض</span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </template>

    <!-- نافذة تأكيد قبول العرض -->
    <Teleport to="body">
      <div
        v-if="isAcceptModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        dir="rtl"
      >
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" @click="isAcceptModalOpen = false" />
        <div class="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-solar-border-card flex flex-col gap-4">
          <div class="flex items-center gap-3 border-b border-solar-border-card pb-3">
            <div class="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700">
              <CheckCircle2 class="size-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-solar-text-heading">تأكيد قبول العرض الهندسي</h3>
              <p class="text-xs text-solar-text-muted">اعتماد المهندس وبدء مرحلة التنفيذ</p>
            </div>
          </div>

          <p class="text-xs text-solar-text-body leading-relaxed">
            أنت على وشك قبول العرض المقدم من المهندس
            <strong class="text-solar-text-heading">{{ pendingAcceptOffer?.engineer?.name || 'المعتمد' }}</strong>
            بتكلفة تقديرية <strong class="text-amber-700">{{ pendingAcceptOffer?.proposed_cost }} YER</strong> ومدة
            <strong class="text-solar-text-heading">{{ pendingAcceptOffer?.execution_time_days }} أيام</strong>.
            سيتم إغلاق تلقي أي عروض أخرى واعتماد هذا العرض رسميًا.
          </p>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-solar-border-card">
            <button
              type="button"
              @click="isAcceptModalOpen = false"
              :disabled="isActionLoading"
              class="btn-outline h-9 px-4 text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              @click="handleConfirmAccept"
              :disabled="isActionLoading"
              class="btn-primary h-9 px-5 text-xs font-bold gap-2 cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
              <span>{{ isActionLoading ? 'جارٍ الاعتماد...' : 'نعم، اعتماد وقبول العرض' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- نافذة تأكيد اكتمال المشروع -->
    <Teleport to="body">
      <div v-if="isConfirmCompletionOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" @click="isConfirmCompletionOpen = false" />
        <div class="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-solar-border-card flex flex-col gap-4">
          <h3 class="text-base font-bold text-solar-text-heading">تأكيد اكتمال المشروع</h3>
          <p class="text-xs text-solar-text-body leading-relaxed">
            بتأكيدك يُغلق المشروع كمكتمل ويُبلَّغ المهندس بذلك. تأكد أن العمل نُفِّذ كما اتُّفق عليه.
          </p>
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-solar-border-card">
            <button type="button" class="btn-outline h-9 px-4 text-xs font-bold" :disabled="isActionLoading" @click="isConfirmCompletionOpen = false">تراجع</button>
            <button type="button" class="btn-primary h-9 px-5 text-xs font-bold gap-2 disabled:opacity-50" :disabled="isActionLoading" @click="handleConfirmCompletion">
              <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
              <span>{{ isActionLoading ? 'جارٍ التأكيد...' : 'نعم، المشروع مكتمل' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- نافذة تقييم المهندس -->
    <Teleport to="body">
      <div v-if="isRatingOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" @click="isRatingOpen = false" />
        <form class="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-solar-border-card flex flex-col gap-4" @submit.prevent="handleSubmitRating">
          <h3 class="text-base font-bold text-solar-text-heading">تقييم المهندس {{ acceptedOffer?.engineer?.name || '' }}</h3>
          <div class="flex items-center gap-1" role="radiogroup" aria-label="عدد النجوم">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              role="radio"
              :aria-checked="ratingValue === star"
              :aria-label="star + ' من 5'"
              class="text-2xl leading-none transition-transform hover:scale-110"
              :class="star <= ratingValue ? 'text-amber-500' : 'text-slate-300'"
              @click="ratingValue = star"
            >★</button>
          </div>
          <textarea
            v-model="ratingComment"
            rows="3"
            maxlength="1000"
            class="solar-input text-xs"
            placeholder="اكتب ملاحظاتك عن جودة العمل والالتزام بالمواعيد (اختياري)"
          />
          <p v-if="ratingError" class="text-xs font-bold text-red-600">{{ ratingError }}</p>
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-solar-border-card">
            <button type="button" class="btn-outline h-9 px-4 text-xs font-bold" :disabled="isActionLoading" @click="isRatingOpen = false">إلغاء</button>
            <button type="submit" class="btn-primary h-9 px-5 text-xs font-bold gap-2 disabled:opacity-50" :disabled="isActionLoading">
              <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
              <span>{{ isActionLoading ? 'جارٍ الحفظ...' : 'إرسال التقييم' }}</span>
            </button>
          </div>
        </form>
      </div>
    </Teleport>

    <!-- نافذة تأكيد إلغاء الطلب -->
    <Teleport to="body">
      <div
        v-if="isCancelModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        dir="rtl"
      >
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" @click="isCancelModalOpen = false" />
        <div class="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-solar-border-card flex flex-col gap-4">
          <div class="flex items-center gap-3 border-b border-solar-border-card pb-3">
            <div class="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <Ban class="size-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-solar-text-heading">تأكيد إلغاء طلب الخدمة</h3>
              <p class="text-xs text-solar-text-muted">إغلاق الطلب نهائياً</p>
            </div>
          </div>

          <p class="text-xs text-solar-text-body leading-relaxed">
            هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ سيتم إغلاقه ولن يتمكن المهندسون من تقديم عروض عليه.
          </p>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-solar-border-card">
            <button
              type="button"
              @click="isCancelModalOpen = false"
              :disabled="isActionLoading"
              class="btn-outline h-9 px-4 text-xs font-bold cursor-pointer"
            >
              تراجع
            </button>
            <button
              type="button"
              @click="handleConfirmCancel"
              :disabled="isActionLoading"
              class="btn-primary h-9 px-5 text-xs font-bold gap-2 bg-red-600 hover:bg-red-700 text-white cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
              <span>{{ isActionLoading ? 'جارٍ الإلغاء...' : 'تأكيد الإلغاء' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
