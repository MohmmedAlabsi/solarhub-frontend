<script setup lang="ts">
import {
  Eye,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import MasterDataTabs from '../../../components/admin/master-data/MasterDataTabs.vue'
import type { AdminCity } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — المحافظات | لوحة الإدارة العامة' })

const isAddModalOpen = ref(false)

const cities = ref<AdminCity[]>([
  { id: '1', nameAr: 'الرياض', nameEn: 'Riyadh Region', code: 'RUH - 01', status: 'active' },
  { id: '2', nameAr: 'مكة المكرمة', nameEn: 'Makkah Province', code: 'MKH - 02', status: 'active' },
  { id: '3', nameAr: 'المنطقة الشرقية', nameEn: 'Eastern Province', code: 'EAS - 03', status: 'active' },
  { id: '4', nameAr: 'المدينة المنورة', nameEn: 'Madinah Region', code: 'MED - 04', status: 'active' },
  { id: '5', nameAr: 'القصيم', nameEn: 'Al-Qassim', code: 'QAS - 05', status: 'active' },
  { id: '6', nameAr: 'عسير', nameEn: 'Asir Region', code: 'ASR - 06', status: 'active' },
  { id: '7', nameAr: 'تبوك', nameEn: 'Tabuk Region', code: 'TBK - 07', status: 'active' },
  { id: '8', nameAr: 'حائل', nameEn: 'Hail Region', code: 'HAIL - 08', status: 'inactive' },
])

const newCity = ref({
  nameAr: '',
  nameEn: '',
  code: '',
})

function handleAddCity() {
  if (!newCity.value.nameAr || !newCity.value.code) return
  cities.value.push({
    id: String(Date.now()),
    nameAr: newCity.value.nameAr,
    nameEn: newCity.value.nameEn,
    code: newCity.value.code,
    status: 'active',
  })
  isAddModalOpen.value = false
  newCity.value = { nameAr: '', nameEn: '', code: '' }
}

function deleteCity(id: string) {
  cities.value = cities.value.filter(c => c.id !== id)
}

function toggleCityStatus(item: AdminCity) {
  item.status = item.status === 'active' ? 'inactive' : 'active'
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- عنوان الصفحة -->
    <div class="flex flex-col gap-2">
      <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة البيانات الأساسية – المحافظات</h1>
      <p class="text-xs sm:text-sm text-solar-text-muted">
        إدارة وضبط النطاقات الجغرافية والمحافظات المعتمدة لتقديم الخدمات والشحن في المنظومة.
      </p>
    </div>

    <!-- شريط التبويبات -->
    <MasterDataTabs />

    <!-- كارد قائمة المحافظات -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <MapPin class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">قائمة المحافظات والمناطق الإدارية</h2>
            <p class="text-xs text-solar-text-muted">تحديد النطاقات الجغرافية لتقديم خدمات الفحص والتركيب والشحن.</p>
          </div>
        </div>

        <button
          type="button"
          @click="isAddModalOpen = true"
          class="btn-primary h-10 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md self-start sm:self-auto"
        >
          <Plus class="size-4" />
          <span>إضافة محافظة جديدة</span>
        </button>
      </div>

      <!-- جدول المحافظات -->
      <div class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold">اسم المحافظة (بالعربية)</th>
              <th class="py-3.5 px-4 font-bold">NAME (ENGLISH)</th>
              <th class="py-3.5 px-4 font-bold font-mono">كود المنطقة / الترتيب</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة التفعيل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in cities"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- الاسم بالعربية مع النقطة الملونة -->
              <td class="py-4 px-4 font-black text-solar-text-heading text-sm">
                <span class="inline-flex items-center gap-2">
                  <span
                    class="size-2 rounded-full"
                    :class="item.status === 'active' ? 'bg-solar-yellow' : 'bg-slate-400'"
                  />
                  <span>{{ item.nameAr }}</span>
                </span>
              </td>

              <!-- Name in English -->
              <td class="py-4 px-4 font-mono font-medium text-solar-text-body text-xs" dir="ltr">
                {{ item.nameEn }}
              </td>

              <!-- كود المنطقة -->
              <td class="py-4 px-4 font-mono font-bold text-solar-navy-dark">
                <span class="rounded bg-slate-100 px-2.5 py-1 text-xs">
                  {{ item.code }}
                </span>
              </td>

              <!-- حالة التفعيل -->
              <td class="py-4 px-4 text-center">
                <AdminBadge :status="item.status === 'active' ? 'مفعل' : 'معطل مؤقتاً'" />
              </td>

              <!-- الإجراءات -->
              <td class="py-4 px-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-solar-navy transition-colors"
                    title="معاينة"
                  >
                    <Eye class="size-4" />
                  </button>
                  <button
                    type="button"
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-amber-600 transition-colors"
                    title="تعديل"
                  >
                    <Pencil class="size-4" />
                  </button>
                  <button
                    type="button"
                    @click="deleteCity(item.id)"
                    class="flex size-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="حذف"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- نافذة إضافة محافظة جديدة -->
    <AdminModal
      v-model="isAddModalOpen"
      title="إضافة محافظة أو منطقة جديدة"
      subtitle="توسيع التغطية الجغرافية لخدمات وعمليات المنصة"
      :icon="MapPin"
      max-width="md"
    >
      <form @submit.prevent="handleAddCity" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">اسم المحافظة / المنطقة بالعربية *</label>
          <input v-model="newCity.nameAr" type="text" required placeholder="مثال: نجران" class="solar-input h-11 text-xs" />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">الاسم بالإنجليزية (ENGLISH) *</label>
          <input v-model="newCity.nameEn" type="text" required placeholder="Najran Province" dir="ltr" class="solar-input h-11 text-xs text-right font-mono" />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">كود المنطقة (Code) *</label>
          <input v-model="newCity.code" type="text" required placeholder="NAJ - 09" dir="ltr" class="solar-input h-11 text-xs font-mono text-right" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button type="button" @click="isAddModalOpen = false" class="btn-outline h-10 px-5 text-xs font-bold">إلغاء</button>
          <button type="submit" class="btn-primary h-10 px-6 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md">حفظ المنطقة</button>
        </div>
      </form>
    </AdminModal>
  </div>
</template>
