<script setup lang="ts">
import {
  BatteryCharging,
  Briefcase,
  ClipboardList,
  Droplets,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sun,
  Wrench,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import MasterDataTabs from '../../../components/admin/master-data/MasterDataTabs.vue'
import type { ServiceType } from '../../../../types/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — أنواع الخدمات | لوحة الإدارة العامة' })

const {
  serviceTypes,
  isLoading,
  isActionLoading,
  fetchServiceTypes,
  createServiceType,
} = useAdminMasterData()

// Non-blocking lazy SSR Data Fetching for instant navigation
const { refresh, pending } = useLazyAsyncData('admin-master-service-types', () => fetchServiceTypes(false), {
  default: () => serviceTypes.value,
})

const searchQuery = ref('')
const selectedService = ref<ServiceType | null>(null)
const isDetailModalOpen = ref(false)
const isAddModalOpen = ref(false)

const newService = ref({
  name: '',
  description: '',
  is_active: true,
})

function getServiceIcon(name: string) {
  const n = (name || '').toLowerCase()
  if (n.includes('شمس') || n.includes('on-grid') || n.includes('pv') || n.includes('ألواح')) return Sun
  if (n.includes('بطار') || n.includes('تخزين') || n.includes('bess') || n.includes('ليثيوم')) return BatteryCharging
  if (n.includes('مضخ') || n.includes('مياه') || n.includes('ري')) return Droplets
  if (n.includes('فحص') || n.includes('اختبار') || n.includes('صيانة') || n.includes('تدقيق')) return Wrench
  return Briefcase
}

const filteredServiceTypes = computed(() => {
  if (!searchQuery.value.trim()) return serviceTypes.value
  const q = searchQuery.value.trim().toLowerCase()
  return serviceTypes.value.filter(
    s => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q))
  )
})

function viewDetails(service: ServiceType) {
  selectedService.value = service
  isDetailModalOpen.value = true
}

async function handleAddService() {
  if (!newService.value.name.trim()) return
  try {
    await createServiceType({
      name: newService.value.name.trim(),
      description: newService.value.description.trim() || undefined,
      is_active: newService.value.is_active,
    })
    isAddModalOpen.value = false
    newService.value = { name: '', description: '', is_active: true }
  } catch {
    /* error handled in composable */
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- عنوان الصفحة الرئيسي -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة البيانات الأساسية</h1>
        <p class="text-xs sm:text-sm text-solar-text-muted mt-1">
          إدارة وتوصيف باقات الخدمات الهندسية والميدانية المتاحة للمستخدمين وتعيينها للمهندسين المعتمدين.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="() => refresh()"
          :disabled="pending || isLoading"
          class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle"
          title="تحديث البيانات من السيرفر"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': pending || isLoading }" />
          <span>تحديث</span>
        </button>

        <button
          type="button"
          @click="isAddModalOpen = true"
          class="btn-primary h-10 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md"
        >
          <Plus class="size-4" />
          <span>إضافة خدمة جديدة</span>
        </button>
      </div>
    </div>

    <!-- شريط التبويبات -->
    <MasterDataTabs />

    <!-- كارد باقات الخدمات -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <Briefcase class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">قائمة باقات وأنواع الخدمات الهندسية</h2>
            <p class="text-xs text-solar-text-muted">
              إجمالي باقات الخدمات المعتمدة في النظام: {{ serviceTypes.length }} باقة
            </p>
          </div>
        </div>

        <!-- البحث -->
        <div class="relative min-w-[200px] sm:min-w-[280px]">
          <Search class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="البحث في مسمى أو وصف الباقة..."
            class="solar-input h-10 pr-9 pl-4 text-xs w-full"
          />
        </div>
      </div>

      <!-- حالة التحميل الأولي فقط -->
      <div v-if="pending && serviceTypes.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 class="size-8 text-solar-navy animate-spin mb-3" />
        <p class="text-xs font-bold text-solar-text-muted">جاري جلب باقات الخدمات الهندسية من السيرفر...</p>
      </div>

      <!-- جدول الخدمات -->
      <div v-else class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold text-center w-14">الرمز</th>
              <th class="py-3.5 px-4 font-bold">مسمى باقة الخدمة الهندسية</th>
              <th class="py-3.5 px-4 font-bold">النطاق الفني وتفاصيل التنفيذ</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة الخدمة</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in filteredServiceTypes"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- الأيقونة -->
              <td class="py-4 px-4 text-center">
                <span class="inline-flex size-9 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy shadow-2xs">
                  <component :is="getServiceIcon(item.name)" class="size-4" />
                </span>
              </td>

              <!-- مسمى الباقة -->
              <td class="py-4 px-4">
                <p class="font-extrabold text-solar-text-heading text-sm">{{ item.name }}</p>
                <p class="font-mono text-[11px] text-solar-text-muted mt-0.5">SRV-0{{ item.id }}</p>
              </td>

              <!-- تفاصيل التنفيذ -->
              <td class="py-4 px-4 text-solar-text-body leading-relaxed max-w-md">
                <p class="line-clamp-2 text-xs text-solar-text-muted font-medium">
                  {{ item.description || 'لا يوجد وصف مدخل لهذه الباقة.' }}
                </p>
              </td>

              <!-- حالة الخدمة -->
              <td class="py-4 px-4 text-center">
                <AdminBadge :status="item.is_active !== false ? 'مفعل' : 'معطل'" />
              </td>

              <!-- الإجراءات -->
              <td class="py-4 px-4 text-center">
                <button
                  type="button"
                  @click="viewDetails(item)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-solar-navy bg-sky-50 hover:bg-sky-100 font-bold text-xs transition-colors"
                >
                  <Eye class="size-3.5" />
                  <span>معاينة التفاصيل</span>
                </button>
              </td>
            </tr>

            <tr v-if="filteredServiceTypes.length === 0">
              <td colspan="5" class="py-12 text-center text-solar-text-muted">
                لا توجد خدمات مطابقة لمعايير البحث الحالية.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- نافذة إضافة خدمة جديدة -->
    <AdminModal
      v-model="isAddModalOpen"
      title="إضافة باقة خدمة هندسية جديدة"
      subtitle="تحديد نطاق الأعمال الهندسية والاستشارية الجديدة في المنصة"
      :icon="Briefcase"
      max-width="md"
    >
      <form @submit.prevent="handleAddService" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">مسمى باقة الخدمة *</label>
          <input
            v-model="newService.name"
            type="text"
            required
            placeholder="مثال: فحص وتدقيق كفاءة الألواح عبر الدرون الحراري"
            class="solar-input h-11 text-xs w-full"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">النطاق والوصف الفني للخدمة</label>
          <textarea
            v-model="newService.description"
            rows="3"
            placeholder="التصوير الحراري بالأشعة تحت الحمراء وفحص منحنيات I-V..."
            class="solar-input text-xs w-full py-2.5 resize-none"
          />
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input
            id="service-active"
            v-model="newService.is_active"
            type="checkbox"
            class="size-4 rounded text-solar-navy focus:ring-solar-navy"
          />
          <label for="service-active" class="text-xs font-bold text-solar-text-heading cursor-pointer">
            تفعيل باقة الخدمة وإتاحتها لطلبات العملاء
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button
            type="button"
            @click="isAddModalOpen = false"
            :disabled="isActionLoading"
            class="btn-outline h-10 px-5 text-xs font-bold"
          >
            إلغاء
          </button>
          <button
            type="submit"
            :disabled="isActionLoading"
            class="btn-primary h-10 px-6 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md"
          >
            <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
            <span>حفظ الخدمة</span>
          </button>
        </div>
      </form>
    </AdminModal>

    <!-- نافذة معاينة تفاصيل باقة الخدمة -->
    <AdminModal
      v-model="isDetailModalOpen"
      title="تفاصيل باقة الخدمة الهندسية"
      subtitle="استعراض النطاق الفني واشتراطات التنفيذ"
      :icon="Briefcase"
      max-width="md"
    >
      <div v-if="selectedService" class="flex flex-col gap-4">
        <div class="flex items-center gap-3 p-3.5 rounded-xl bg-solar-bg-subtle/80 border border-solar-border-card">
          <div class="size-11 rounded-xl bg-solar-navy text-white flex items-center justify-center shrink-0">
            <component :is="getServiceIcon(selectedService.name)" class="size-5" />
          </div>
          <div>
            <h3 class="font-black text-sm text-solar-text-heading">{{ selectedService.name }}</h3>
            <p class="text-xs text-solar-text-muted font-mono mt-0.5">كود الباقة: SRV-0{{ selectedService.id }}</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-heading mb-1.5">نطاق الأعمال والمواصفات الفنية:</label>
          <div class="p-3.5 rounded-xl border border-solar-border-card bg-white text-xs text-solar-text-body leading-relaxed whitespace-pre-line">
            {{ selectedService.description || 'لم يتم إدراج مواصفات فنية إضافية.' }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-[11px] text-solar-text-muted font-bold">الحالة الإدارية</p>
            <p class="text-xs font-black text-solar-text-heading mt-1">
              {{ selectedService.is_active !== false ? 'مفعلة في طلبات العملاء' : 'معطلة مؤقتاً' }}
            </p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-[11px] text-solar-text-muted font-bold">الربط البرمجي</p>
            <p class="text-xs font-black text-emerald-600 mt-1">
              متصل بقاعدة البيانات API
            </p>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-solar-border-card">
          <button
            type="button"
            @click="isDetailModalOpen = false"
            class="btn-primary h-10 px-6 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md"
          >
            إغلاق
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
