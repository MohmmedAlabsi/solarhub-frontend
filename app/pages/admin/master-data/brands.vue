<script setup lang="ts">
import {
  Award,
  ExternalLink,
  Eye,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import MasterDataTabs from '../../../components/admin/master-data/MasterDataTabs.vue'
import type { AdminBrand } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — العلامات التجارية | لوحة الإدارة العامة' })

const isAddModalOpen = ref(false)

const brands = ref<AdminBrand[]>([
  {
    id: '1',
    name: 'Jinko Solar',
    logoText: 'Jinko',
    website: 'jinkosolar.com',
    productsCount: 124,
    status: 'active',
  },
  {
    id: '2',
    name: 'LONGi Solar',
    logoText: 'LONGi',
    website: 'longi.com',
    productsCount: 98,
    status: 'active',
  },
  {
    id: '3',
    name: 'Deye Inverters',
    logoText: 'Deye',
    website: 'deyeinverter.com',
    productsCount: 64,
    status: 'active',
  },
  {
    id: '4',
    name: 'Huawei FusionSolar',
    logoText: 'Huawei',
    website: 'solar.huawei.com',
    productsCount: 52,
    status: 'active',
  },
  {
    id: '5',
    name: 'Victron Energy',
    logoText: 'Victron',
    website: 'victronenergy.com',
    productsCount: 45,
    status: 'active',
  },
  {
    id: '6',
    name: 'Growatt New Energy',
    logoText: 'Growatt',
    website: 'growatt.com',
    productsCount: 39,
    status: 'active',
  },
  {
    id: '7',
    name: 'Grundfos Solar Pumps',
    logoText: 'Grundfos',
    website: 'grundfos.com',
    productsCount: 27,
    status: 'active',
  },
  {
    id: '8',
    name: 'Pylontech Storage',
    logoText: 'Pylon',
    website: 'pylontech.com.cn',
    productsCount: 31,
    status: 'active',
  },
])

const newBrand = ref({
  name: '',
  logoText: '',
  website: '',
})

function handleAddBrand() {
  if (!newBrand.value.name) return
  brands.value.push({
    id: String(Date.now()),
    name: newBrand.value.name,
    logoText: newBrand.value.logoText || newBrand.value.name.slice(0, 5),
    website: newBrand.value.website,
    productsCount: 0,
    status: 'active',
  })
  isAddModalOpen.value = false
  newBrand.value = { name: '', logoText: '', website: '' }
}

function deleteBrand(id: string) {
  brands.value = brands.value.filter(b => b.id !== id)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- عنوان الصفحة الرئيسي -->
    <div class="flex flex-col gap-2">
      <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة البيانات الأساسية</h1>
      <p class="text-xs sm:text-sm text-solar-text-muted">
        الشركات العالمية المصنعة والعلامات التجارية المعتمدة لمعدات الطاقة المتجددة.
      </p>
    </div>

    <!-- شريط التبويبات الأفقي -->
    <MasterDataTabs />

    <!-- كارد العلامات التجارية والمصنعين -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <Award class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">العلامات التجارية والمصنعون</h2>
            <p class="text-xs text-solar-text-muted">الشركات العالمية المصنعة المعتمدة لمعدات الطاقة المتجددة.</p>
          </div>
        </div>

        <button
          type="button"
          @click="isAddModalOpen = true"
          class="btn-primary h-10 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md self-start sm:self-auto"
        >
          <Plus class="size-4" />
          <span>إضافة علامة تجارية</span>
        </button>
      </div>

      <!-- جدول العلامات التجارية -->
      <div class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold text-center">الشعار</th>
              <th class="py-3.5 px-4 font-bold">اسم العلامة التجارية</th>
              <th class="py-3.5 px-4 font-bold">رابط الموقع الرسمي</th>
              <th class="py-3.5 px-4 font-bold text-center">المنتجات المرتبطة</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة التفعيل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in brands"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- الشعار النصي / الرمزي -->
              <td class="py-3.5 px-4 text-center">
                <span class="inline-flex size-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-solar-navy-dark font-black text-xs">
                  {{ item.logoText }}
                </span>
              </td>

              <!-- اسم الماركة -->
              <td class="py-3.5 px-4 font-black text-solar-text-heading text-sm">
                {{ item.name }}
              </td>

              <!-- الموقع الرسمي -->
              <td class="py-3.5 px-4">
                <a
                  :href="`https://${item.website}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1.5 font-mono text-xs text-sky-700 hover:text-solar-yellow transition-colors"
                  dir="ltr"
                >
                  <ExternalLink class="size-3.5" />
                  <span>{{ item.website }}</span>
                </a>
              </td>

              <!-- المنتجات المرتبطة -->
              <td class="py-3.5 px-4 text-center font-bold text-solar-text-body">
                <span class="rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-xs">
                  {{ item.productsCount }} منتج
                </span>
              </td>

              <!-- حالة التفعيل -->
              <td class="py-3.5 px-4 text-center">
                <AdminBadge :status="item.status === 'active' ? 'مفعل' : 'معطل'" />
              </td>

              <!-- الإجراءات -->
              <td class="py-3.5 px-4 text-center">
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
                    @click="deleteBrand(item.id)"
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

    <!-- نافذة إضافة علامة تجارية -->
    <AdminModal
      v-model="isAddModalOpen"
      title="إضافة علامة تجارية جديدة"
      subtitle="تسجيل شركة عالمية مصنعة في قاعدة بيانات المنتجات"
      :icon="Award"
      max-width="md"
    >
      <form @submit.prevent="handleAddBrand" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">اسم الماركة / الشركة *</label>
          <input v-model="newBrand.name" type="text" required placeholder="مثال: SMA Solar" class="solar-input h-11 text-xs" />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">شعار أو اختصار الماركة</label>
          <input v-model="newBrand.logoText" type="text" placeholder="SMA" class="solar-input h-11 text-xs" />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">رابط الموقع الرسمي</label>
          <input v-model="newBrand.website" type="text" placeholder="sma.de" dir="ltr" class="solar-input h-11 text-xs text-right font-mono" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button type="button" @click="isAddModalOpen = false" class="btn-outline h-10 px-5 text-xs font-bold">إلغاء</button>
          <button type="submit" class="btn-primary h-10 px-6 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md">حفظ العلامة</button>
        </div>
      </form>
    </AdminModal>
  </div>
</template>
