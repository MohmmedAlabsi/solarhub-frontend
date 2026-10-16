<script setup lang="ts">
import {
  BatteryCharging,
  Droplets,
  Eye,
  Grid,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  Wrench,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import MasterDataTabs from '../../../components/admin/master-data/MasterDataTabs.vue'
import type { AdminSpecialty } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — التخصصات | لوحة الإدارة العامة' })

const isAddModalOpen = ref(false)

const specialties = ref<AdminSpecialty[]>([
  {
    id: '1',
    title: 'هندسة نظم كهروضوئية وتصميم محطات On-Grid',
    code: 'PVSYST-ONGRID',
    description: 'دراسة الأحمال، المخططات الكهربائية والميكانيكية، ومحاكاة الإنتاجية عبر PVSyst والربط المتزامن مع الشبكة الكهربائية الوطنية.',
    engineersCount: 48,
    status: 'active',
    iconType: 'grid',
  },
  {
    id: '2',
    title: 'استشارات أنظمة التخزين والبطاريات BESS',
    code: 'BESS-STORAGE',
    description: 'تطوير منظومات تخزين الطاقة بالبطاريات الثابتة والليثيوم LiFePO4 والحلول المستقلة Off-Grid وإدارة ذروة الاستهلاك.',
    engineersCount: 31,
    status: 'active',
    iconType: 'battery',
  },
  {
    id: '3',
    title: 'استشارات طاقة زراعية ومضخات مياه شمسية',
    code: 'SOLAR-PUMPING',
    description: 'حسابات الآبار الارتوازية وتدفقات المياه وتنسيق محولات الضخ الترددية VFD وحماية المضخات الغاطسة في المزارع والمشاريع النائية.',
    engineersCount: 29,
    status: 'active',
    iconType: 'droplet',
  },
  {
    id: '4',
    title: 'فحص واختبار أداء وصيانة كهروميكانيكية',
    code: 'QA-INSPECTION',
    description: 'التصوير الحراري بالأشعة تحت الحمراء بالطائرات المسيرة، فحص منحنيات I-V للمصفوفات، واختبارات العزل الكهربائي والميكانيكي.',
    engineersCount: 36,
    status: 'active',
    iconType: 'wrench',
  },
  {
    id: '5',
    title: 'دراسات الربط الكهربائي والتوافق مع كود SBC',
    code: 'SBC-COMPLIANCE',
    description: 'إعداد ملفات المطابقة الفنية لكود البناء السعودي ومتطلبات الشركة السعودية للكهرباء ودراسات الأثر التوافقي والتأريض.',
    engineersCount: 23,
    status: 'active',
    iconType: 'shield',
  },
])

function getIcon(type: string) {
  switch (type) {
    case 'grid': return Grid
    case 'battery': return BatteryCharging
    case 'droplet': return Droplets
    case 'wrench': return Wrench
    case 'shield': return ShieldCheck
    default: return Grid
  }
}

const newSpec = ref({
  title: '',
  code: '',
  description: '',
})

function handleAddSpecialty() {
  if (!newSpec.value.title || !newSpec.value.code) return
  specialties.value.push({
    id: String(Date.now()),
    title: newSpec.value.title,
    code: newSpec.value.code,
    description: newSpec.value.description,
    engineersCount: 0,
    status: 'active',
    iconType: 'grid',
  })
  isAddModalOpen.value = false
  newSpec.value = { title: '', code: '', description: '' }
}

function deleteSpecialty(id: string) {
  specialties.value = specialties.value.filter(s => s.id !== id)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- عنوان الصفحة الرئيسي -->
    <div class="flex flex-col gap-2">
      <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة البيانات الأساسية</h1>
      <p class="text-xs sm:text-sm text-solar-text-muted">
        إدارة وتوثيق مجالات التخصص الهندسي والاعتمادات المهنية للخبراء في منظومة سولار هب.
      </p>
    </div>

    <!-- شريط التبويبات -->
    <MasterDataTabs />

    <!-- كارد التخصصات المهنية للمهندسين -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <Users class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">التخصصات المهنية للمهندسين المعتمدين</h2>
            <p class="text-xs text-solar-text-muted">مجالات الاعتماد الهندسي الدقيق عند تسجيل وتأهيل الخبراء الاستشاريين.</p>
          </div>
        </div>

        <button
          type="button"
          @click="isAddModalOpen = true"
          class="btn-primary h-10 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md self-start sm:self-auto"
        >
          <Plus class="size-4" />
          <span>إضافة تخصص جديد</span>
        </button>
      </div>

      <!-- جدول التخصصات -->
      <div class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold">اسم التخصص</th>
              <th class="py-3.5 px-4 font-bold">الوصف الهندسي</th>
              <th class="py-3.5 px-4 font-bold text-center">عدد المهندسين المسجلين</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة التفعيل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in specialties"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- اسم التخصص والأيقونة والرمز -->
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-800">
                    <component :is="getIcon(item.iconType)" class="size-5" />
                  </div>
                  <div>
                    <p class="font-extrabold text-solar-text-heading text-sm">{{ item.title }}</p>
                    <span class="inline-block font-mono text-[11px] font-bold text-solar-navy-dark mt-0.5" dir="ltr">
                      {{ item.code }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- الوصف الهندسي -->
              <td class="py-4 px-4 text-solar-text-muted max-w-md leading-relaxed text-xs">
                {{ item.description }}
              </td>

              <!-- عدد المهندسين المسجلين -->
              <td class="py-4 px-4 text-center font-bold text-solar-text-heading">
                <span class="rounded-lg bg-solar-bg-subtle px-3 py-1 text-xs">
                  {{ item.engineersCount }} مهندس
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
                    @click="deleteSpecialty(item.id)"
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

    <!-- نافذة إضافة تخصص جديد -->
    <AdminModal
      v-model="isAddModalOpen"
      title="إضافة تخصص هندسي جديد"
      subtitle="توسيع مجالات الاعتماد الهندسي للمهندسين الاستشاريين"
      :icon="Users"
      max-width="md"
    >
      <form @submit.prevent="handleAddSpecialty" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">اسم التخصص الهندسي *</label>
          <input v-model="newSpec.title" type="text" required placeholder="مثال: هندسة النظم الهجينة والمايكروجرد" class="solar-input h-11 text-xs" />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">كود التخصص (CODE) *</label>
          <input v-model="newSpec.code" type="text" required placeholder="MICROGRID-ENG" dir="ltr" class="solar-input h-11 text-xs font-mono text-right" />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">الوصف الهندسي لنطاق العمل</label>
          <textarea v-model="newSpec.description" rows="3" placeholder="توصيف المهام والدراسات الفنية المطلوبة ضمن هذا التخصص..." class="solar-input p-3 text-xs resize-y" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button type="button" @click="isAddModalOpen = false" class="btn-outline h-10 px-5 text-xs font-bold">إلغاء</button>
          <button type="submit" class="btn-primary h-10 px-6 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md">حفظ التخصص</button>
        </div>
      </form>
    </AdminModal>
  </div>
</template>
