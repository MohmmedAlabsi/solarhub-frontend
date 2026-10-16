<script setup lang="ts">
import {
  Boxes,
  Check,
  FolderTree,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import MasterDataTabs from '../../../components/admin/master-data/MasterDataTabs.vue'
import type { AdminCategory } from '../../../../types/admin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — التصنيفات | لوحة الإدارة العامة' })

const isAddModalOpen = ref(false)

const categories = ref<AdminCategory[]>([
  {
    id: '1',
    nameAr: 'ألواح كهروضوئية',
    nameEn: 'Solar PV Panels',
    type: 'رئيسي',
    slug: 'solar-pv-panels',
    productsCount: 248,
    status: 'active',
  },
  {
    id: '2',
    nameAr: 'ألواح أحادية البلورة Monocrystalline',
    nameEn: 'Monocrystalline Panels',
    type: 'فرعي',
    parentName: 'ألواح كهروضوئية',
    slug: 'mono-panels',
    productsCount: 182,
    status: 'active',
  },
  {
    id: '3',
    nameAr: 'إنفرترات ومحولات طاقة',
    nameEn: 'Solar Inverters',
    type: 'رئيسي',
    slug: 'solar-inverters',
    productsCount: 164,
    status: 'active',
  },
  {
    id: '4',
    nameAr: 'محولات هجينة Hybrid Inverters',
    nameEn: 'Hybrid Inverters',
    type: 'فرعي',
    parentName: 'إنفرترات ومحولات طاقة',
    slug: 'hybrid-inverters',
    productsCount: 96,
    status: 'active',
  },
  {
    id: '5',
    nameAr: 'أنظمة تخزين وبطاريات',
    nameEn: 'Energy Storage & Batteries',
    type: 'رئيسي',
    slug: 'energy-storage',
    productsCount: 112,
    status: 'active',
  },
  {
    id: '6',
    nameAr: 'بطاريات ليثيوم LiFePO4',
    nameEn: 'LiFePO4 Batteries',
    type: 'فرعي',
    parentName: 'أنظمة تخزين وبطاريات',
    slug: 'lifepo4-batteries',
    productsCount: 78,
    status: 'active',
  },
  {
    id: '7',
    nameAr: 'مضخات مياه شمسية',
    nameEn: 'Solar Pumps',
    type: 'رئيسي',
    slug: 'solar-pumps',
    productsCount: 65,
    status: 'active',
  },
  {
    id: '8',
    nameAr: 'هياكل وكوابل تثبيت',
    nameEn: 'Mounting & BOS',
    type: 'رئيسي',
    slug: 'mounting-bos',
    productsCount: 54,
    status: 'active',
  },
])

const newCat = ref({
  nameAr: '',
  nameEn: '',
  type: 'رئيسي' as 'رئيسي' | 'فرعي',
  parentName: '',
  slug: '',
})

function handleAddCategory() {
  if (!newCat.value.nameAr || !newCat.value.slug) return
  categories.value.push({
    id: String(Date.now()),
    nameAr: newCat.value.nameAr,
    nameEn: newCat.value.nameEn,
    type: newCat.value.type,
    parentName: newCat.value.type === 'فرعي' ? newCat.value.parentName : undefined,
    slug: newCat.value.slug,
    productsCount: 0,
    status: 'active',
  })
  isAddModalOpen.value = false
  newCat.value = { nameAr: '', nameEn: '', type: 'رئيسي', parentName: '', slug: '' }
}

function deleteCategory(id: string) {
  categories.value = categories.value.filter(c => c.id !== id)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- عنوان الصفحة الرئيسي والموجّه -->
    <div class="flex flex-col gap-2">
      <h1 class="text-xl sm:text-2xl font-black text-solar-text-heading">إدارة البيانات الأساسية</h1>
      <p class="text-xs sm:text-sm text-solar-text-muted">
        إدارة وضبط شجرة التصنيفات الرئيسية والفرعية المعتمدة للمنتجات والكتالوج.
      </p>
    </div>

    <!-- شريط التبويبات الأفقي للبيانات الأساسية -->
    <MasterDataTabs />

    <!-- كارد شجرة التصنيفات -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <FolderTree class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">شجرة التصنيفات (رئيسية وفرعية)</h2>
            <p class="text-xs text-solar-text-muted">تنظيم المنتجات الكهروضوئية والملحقات الهندسية وتوزيعها الدقيق.</p>
          </div>
        </div>

        <button
          type="button"
          @click="isAddModalOpen = true"
          class="btn-primary h-10 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md self-start sm:self-auto"
        >
          <Plus class="size-4" />
          <span>إضافة تصنيف جديد</span>
        </button>
      </div>

      <!-- جدول التصنيفات -->
      <div class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold">اسم التصنيف (عربي / ENGLISH)</th>
              <th class="py-3.5 px-4 font-bold text-center">نوع التصنيف</th>
              <th class="py-3.5 px-4 font-bold">التصنيف الرئيسي التابع له</th>
              <th class="py-3.5 px-4 font-bold font-mono">كود التصنيف (SLUG)</th>
              <th class="py-3.5 px-4 font-bold text-center">المنتجات المرتبطة</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة التفعيل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in categories"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- اسم التصنيف -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                  <span v-if="item.type === 'فرعي'" class="text-solar-text-muted text-sm pr-2">↳</span>
                  <div>
                    <p class="font-extrabold text-solar-text-heading text-sm">{{ item.nameAr }}</p>
                    <p class="text-[11px] text-solar-text-muted font-sans" dir="ltr">{{ item.nameEn }}</p>
                  </div>
                </div>
              </td>

              <!-- نوع التصنيف -->
              <td class="py-3.5 px-4 text-center">
                <span
                  class="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-black"
                  :class="item.type === 'رئيسي' ? 'bg-solar-navy text-white' : 'bg-sky-100 text-sky-800'"
                >
                  {{ item.type }}
                </span>
              </td>

              <!-- التصنيف الرئيسي -->
              <td class="py-3.5 px-4 text-solar-text-body font-medium">
                {{ item.parentName || '—' }}
              </td>

              <!-- SLUG -->
              <td class="py-3.5 px-4 font-mono font-bold text-solar-navy-dark">
                {{ item.slug }}
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
                    class="flex size-8 items-center justify-center rounded-lg text-solar-text-body hover:bg-solar-bg-subtle hover:text-amber-600 transition-colors"
                    title="تعديل"
                  >
                    <Pencil class="size-4" />
                  </button>
                  <button
                    type="button"
                    @click="deleteCategory(item.id)"
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

    <!-- نافذة إضافة تصنيف جديد -->
    <AdminModal
      v-model="isAddModalOpen"
      title="إضافة تصنيف جديد"
      subtitle="إضافة تصنيف رئيسي أو فرعي لشجرة المنتجات والكتالوج"
      :icon="Boxes"
      max-width="lg"
    >
      <form @submit.prevent="handleAddCategory" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">الاسم بالعربية *</label>
          <input v-model="newCat.nameAr" type="text" required placeholder="مثال: هياكل تثبيت ألومنيوم" class="solar-input h-11 text-xs" />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">الاسم بالإنجليزية (ENGLISH)</label>
          <input v-model="newCat.nameEn" type="text" placeholder="Aluminum Mounting Structures" dir="ltr" class="solar-input h-11 text-xs text-right" />
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-bold text-solar-text-body mb-1.5">نوع التصنيف</label>
            <select v-model="newCat.type" class="solar-input h-11 text-xs">
              <option value="رئيسي">تصنيف رئيسي</option>
              <option value="فرعي">تصنيف فرعي</option>
            </select>
          </div>

          <div v-if="newCat.type === 'فرعي'">
            <label class="block text-xs font-bold text-solar-text-body mb-1.5">التصنيف الرئيسي التابع له</label>
            <select v-model="newCat.parentName" class="solar-input h-11 text-xs">
              <option v-for="c in categories.filter(x => x.type === 'رئيسي')" :key="c.id" :value="c.nameAr">
                {{ c.nameAr }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">كود الرابط (SLUG) *</label>
          <input v-model="newCat.slug" type="text" required placeholder="mounting-structures" dir="ltr" class="solar-input h-11 text-xs font-mono text-right" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button type="button" @click="isAddModalOpen = false" class="btn-outline h-10 px-5 text-xs font-bold">إلغاء</button>
          <button type="submit" class="btn-primary h-10 px-6 text-xs font-bold bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md">حفظ التصنيف</button>
        </div>
      </form>
    </AdminModal>
  </div>
</template>
