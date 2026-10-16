<script setup lang="ts">
import {
  BatteryCharging,
  Briefcase,
  ClipboardList,
  Droplets,
  Eye,
  Pencil,
  Plus,
  Search,
  Sun,
  Trash2,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import MasterDataTabs from '../../../components/admin/master-data/MasterDataTabs.vue'
import type { AdminServiceType } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — أنواع الخدمات | لوحة الإدارة العامة' })

const isAddModalOpen = ref(false)

const serviceTypes = ref<AdminServiceType[]>([
  {
    id: '1',
    title: 'تصميم ومحاكاة محطات شمسية (On-Grid)',
    code: 'SRV-01',
    description: 'دراسة الأحمال، المخططات التنفيذية، نمذجة الإنتاجية عبر PVsyst، وحسابات الكابلات والحماية',
    completedOrdersCount: 58,
    status: 'active',
    iconType: 'solar',
  },
  {
    id: '2',
    title: 'استشارات أنظمة التخزين والبطاريات (BESS)',
    code: 'SRV-02',
    description: 'تحديد سعات بطاريات الليثيوم LiFePO4، وإدارة أحمال الذروة وأنظمة الطاقة الهجينة والمستقلة',
    completedOrdersCount: 42,
    status: 'active',
    iconType: 'battery',
  },
  {
    id: '3',
    title: 'تصميم مضخات المياه الكهروضوئية',
    code: 'SRV-03',
    description: 'حساب تدفق المياه والديناميكا الهيدروليكية ومطابقة محولات VFD للآبار الارتوازية والمزارع',
    completedOrdersCount: 36,
    status: 'active',
    iconType: 'droplet',
  },
  {
    id: '4',
    title: 'الفحص الميداني والاختبارات الكهروميكانيكية',
    code: 'SRV-04',
    description: 'التصوير الحراري بالأشعة تحت الحمراء، وفحص منحنيات I-V، واختبارات العزل والتأريض',
    completedOrdersCount: 49,
    status: 'active',
    iconType: 'search',
  },
  {
    id: '5',
    title: 'دراسات الربط والتوافق مع كود البناء SBC',
    code: 'SRV-05',
    description: 'إعداد تقارير المطابقة لمتطلبات الشركة السعودية للكهرباء وكود البناء السعودي للطاقة المتجددة',
    completedOrdersCount: 27,
    status: 'active',
    iconType: 'clipboard',
  },
])

function getServiceIcon(type: string) {
  switch (type) {
    case 'solar': return Sun
    case 'battery': return BatteryCharging
    case 'droplet': return Droplets
    case 'search': return Search
    case 'clipboard': return ClipboardList
    default: return Briefcase
  }
}

const newService = ref({
  title: '',
  code: '',
  description: '',
})

function handleAddService() {
  if (!newService.value.title || !newService.value.code) return
  serviceTypes.value.push({
    id: String(Date.now()),
    title: newService.value.title,
    code: newService.value.code,
    description: newService.value.description,
    completedOrdersCount: 0,
    status: 'active',
    iconType: 'solar',
  })
  isAddModalOpen.value = false
  newService.value = { title: '', code: '', description: '' }
}

function deleteService(id: string) {
  serviceTypes.value = serviceTypes.value.filter(s => s.id !== id)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- عنوان الصفحة الرئيسي -->
    <div class="flex flex-col gap-2">
      <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة البيانات الأساسية</h1>
      <p class="text-xs sm:text-sm text-solar-text-muted">
        إدارة وتوصيف باقات الخدمات الهندسية والميدانية المتاحة للمستخدمين وتعيينها للمهندسين المعتمدين.
      </p>
    </div>

    <!-- شريط التبويبات -->
    <MasterDataTabs />

    <!-- كارد باقات الخدمات -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <Briefcase class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">قائمة باقات وأنواع الخدمات الهندسية</h2>
            <p class="text-xs text-solar-text-muted">تحديد نطاق الأعمال الهندسية والاستشارية والفحص الميداني.</p>
          </div>
        </div>

        <button
          type="button"
          @click="isAddModalOpen = true"
          class="btn-primary h-10 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md self-start sm:self-auto"
        >
          <Plus class="size-4" />
          <span>إضافة نوع خدمة جديد</span>
        </button>
      </div>

      <!-- جدول الخدمات -->
      <div class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold text-center">الأيقونة</th>
              <th class="py-3.5 px-4 font-bold">اسم نوع الخدمة</th>
              <th class="py-3.5 px-4 font-bold font-mono">كود الخدمة</th>
              <th class="py-3.5 px-4 font-bold">الوصف الهندسي / نطاق العمل</th>
              <th class="py-3.5 px-4 font-bold text-center">عدد المشاريع والطلبات</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة التفعيل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in serviceTypes"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- الأيقونة -->
              <td class="py-4 px-4 text-center">
                <span class="inline-flex size-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-700">
                  <component :is="getServiceIcon(item.iconType)" class="size-5" />
                </span>
              </td>

              <!-- اسم الخدمة -->
              <td class="py-4 px-4 font-extrabold text-solar-text-heading text-sm">
                {{ item.title }}
              </td>

              <!-- كود الخدمة -->
              <td class="py-4 px-4 font-mono font-bold text-solar-navy-dark">
                <span class="rounded bg-slate-100 px-2 py-0.5">
                  {{ item.code }}
                </span>
              </td>

              <!-- نطاق العمل -->
              <td class="py-4 px-4 text-solar-text-muted max-w-sm leading-relaxed text-xs">
                {{ item.description }}
              </td>

              <!-- الطلبات المنجزة -->
              <td class="py-4 px-4 text-center font-bold text-solar-text-heading">
                <span class="rounded-lg bg-sky-50 text-sky-800 border border-sky-100 px-2.5 py-1 text-xs">
                  {{ item.completedOrdersCount }} طلب منجز
                </span>
              </td>

              <!-- حالة التفعيل -->
              <td class="py-4 px-4 text-center">
                <AdminBadge :status="item.status === 'active' ? 'مفعل' : 'معطل'" />
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
                    @click="deleteService(item.id)"
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

    <!-- نافذة إضافة نوع خدمة جديد -->
    <AdminModal
      v-model="isAddModalOpen"
      title="إضافة نوع خدمة هندسية جديدة"
      subtitle="تعريف باقة أعمال هندسية جديدة متاحة لطلبات العملاء"
      :icon="Briefcase"
      max-width="md"
    >
      <form @submit.prevent="handleAddService" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">اسم نوع الخدمة *</label>
          <input v-model="newService.title" type="text" required placeholder="مثال: فحص دوري للمنظومات الصناعية" class="solar-input h-11 text-xs" />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">كود الخدمة (Code) *</label>
          <input v-model="newService.code" type="text" required placeholder="SRV-06" dir="ltr" class="solar-input h-11 text-xs font-mono text-right" />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">الوصف الهندسي لنطاق العمل</label>
          <textarea v-model="newService.description" rows="3" placeholder="تحديد نطاق الأعمال المشمولة في هذه الخدمة..." class="solar-input p-3 text-xs resize-y" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button type="button" @click="isAddModalOpen = false" class="btn-outline h-10 px-5 text-xs font-bold">إلغاء</button>
          <button type="submit" class="btn-primary h-10 px-6 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md">حفظ الخدمة</button>
        </div>
      </form>
    </AdminModal>
  </div>
</template>
