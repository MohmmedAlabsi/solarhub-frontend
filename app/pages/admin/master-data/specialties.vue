<script setup lang="ts">
import {
  BatteryCharging,
  Droplets,
  Eye,
  Grid,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import MasterDataTabs from '../../../components/admin/master-data/MasterDataTabs.vue'
import type { Specialization } from '../../../../types/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — التخصصات | لوحة الإدارة العامة' })

const {
  specialties,
  isLoading,
  fetchSpecialties,
} = useAdminMasterData()

// SSR Data Fetching via useAsyncData
const { refresh, pending } = await useAsyncData('admin-master-specialties', async () => {
  return await fetchSpecialties(true)
})

const searchQuery = ref('')
const selectedSpecialty = ref<Specialization | null>(null)
const isDetailModalOpen = ref(false)

function getSpecialtyIcon(name: string) {
  const n = (name || '').toLowerCase()
  if (n.includes('شمس') || n.includes('on-grid') || n.includes('شبك')) return Grid
  if (n.includes('بطار') || n.includes('تخزين') || n.includes('bess')) return BatteryCharging
  if (n.includes('مضخ') || n.includes('مياه') || n.includes('ري') || n.includes('زراع')) return Droplets
  if (n.includes('فحص') || n.includes('صيانة') || n.includes('اختبار')) return Wrench
  if (n.includes('كود') || n.includes('sbc') || n.includes('مطابق')) return ShieldCheck
  return Grid
}

const filteredSpecialties = computed(() => {
  if (!searchQuery.value.trim()) return specialties.value
  const q = searchQuery.value.trim().toLowerCase()
  return specialties.value.filter(
    s => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q))
  )
})

function viewDetails(spec: Specialization) {
  selectedSpecialty.value = spec
  isDetailModalOpen.value = true
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- عنوان الصفحة الرئيسي -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة البيانات الأساسية</h1>
        <p class="text-xs sm:text-sm text-solar-text-muted mt-1">
          إدارة وتوثيق مجالات التخصص الهندسي والاعتمادات المهنية للخبراء في منظومة سولار هب.
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
      </div>
    </div>

    <!-- شريط التبويبات -->
    <MasterDataTabs />

    <!-- كارد التخصصات المهنية للمهندسين -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <Users class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">التخصصات المهنية للمهندسين المعتمدين</h2>
            <p class="text-xs text-solar-text-muted">
              مجالات الاعتماد الهندسي الدقيق المسجلة في قاعدة بيانات المنظومة: {{ specialties.length }} تخصص
            </p>
          </div>
        </div>

        <!-- البحث -->
        <div class="relative min-w-[200px] sm:min-w-[280px]">
          <Search class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="البحث في مجالات التخصص..."
            class="solar-input h-10 pr-9 pl-4 text-xs w-full"
          />
        </div>
      </div>

      <!-- حالة التحميل -->
      <div v-if="pending && specialties.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 class="size-8 text-solar-navy animate-spin mb-3" />
        <p class="text-xs font-bold text-solar-text-muted">جاري تحميل مجالات التخصص المهني من السيرفر...</p>
      </div>

      <!-- جدول التخصصات -->
      <div v-else class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold text-center w-14">الرمز</th>
              <th class="py-3.5 px-4 font-bold">اسم التخصص ومجال الاعتماد</th>
              <th class="py-3.5 px-4 font-bold">النطاق والوصف الفني</th>
              <th class="py-3.5 px-4 font-bold text-center">المهندسون المعتمدون</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة التفعيل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in filteredSpecialties"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- الأيقونة -->
              <td class="py-4 px-4 text-center">
                <span class="inline-flex size-9 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy shadow-2xs">
                  <component :is="getSpecialtyIcon(item.name)" class="size-4" />
                </span>
              </td>

              <!-- اسم التخصص -->
              <td class="py-4 px-4">
                <p class="font-extrabold text-solar-text-heading text-sm">{{ item.name }}</p>
                <p class="font-mono text-[11px] text-solar-text-muted mt-0.5">SPEC-0{{ item.id }}</p>
              </td>

              <!-- الوصف -->
              <td class="py-4 px-4 text-solar-text-body leading-relaxed max-w-md">
                <p class="line-clamp-2 text-xs text-solar-text-muted font-medium">
                  {{ item.description || 'مجال تخصص معتمد لدى الهيئة ومرخص في المنصة.' }}
                </p>
              </td>

              <!-- عدد المهندسين المعتمدين -->
              <td class="py-4 px-4 text-center">
                <span class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-xs font-bold text-solar-text-heading">
                  <Users class="size-3 text-solar-text-muted" />
                  <span>{{ item.engineers_count ?? 0 }} مهندس</span>
                </span>
              </td>

              <!-- حالة التفعيل -->
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

            <tr v-if="filteredSpecialties.length === 0">
              <td colspan="6" class="py-12 text-center text-solar-text-muted">
                لا توجد تخصصات مطابقة لمعايير البحث الحالية.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- نافذة معاينة تفاصيل التخصص -->
    <AdminModal
      v-model="isDetailModalOpen"
      title="تفاصيل التخصص الهندسي"
      subtitle="استعراض مجالات الخبرة والاعتماد المهني"
      :icon="Users"
      max-width="md"
    >
      <div v-if="selectedSpecialty" class="flex flex-col gap-4">
        <div class="flex items-center gap-3 p-3.5 rounded-xl bg-solar-bg-subtle/80 border border-solar-border-card">
          <div class="size-11 rounded-xl bg-solar-navy text-white flex items-center justify-center shrink-0">
            <component :is="getSpecialtyIcon(selectedSpecialty.name)" class="size-5" />
          </div>
          <div>
            <h3 class="font-black text-sm text-solar-text-heading">{{ selectedSpecialty.name }}</h3>
            <p class="text-xs text-solar-text-muted font-mono mt-0.5">رمز التخصص: SPEC-0{{ selectedSpecialty.id }}</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-heading mb-1.5">معايير ونطاق الاعتماد المهني:</label>
          <div class="p-3.5 rounded-xl border border-solar-border-card bg-white text-xs text-solar-text-body leading-relaxed whitespace-pre-line">
            {{ selectedSpecialty.description || 'تخصص مهني معتمد وفق الكود والمعايير الهندسية المعمول بها.' }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-[11px] text-solar-text-muted font-bold">المهندسون المرتبطون</p>
            <p class="text-xs font-black text-solar-navy mt-1">
              {{ selectedSpecialty.engineers_count ?? 0 }} مهندس معتمد
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
