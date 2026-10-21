<script setup lang="ts">
import {
  CreditCard,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  Wallet,
} from 'lucide-vue-next'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import MasterDataTabs from '../../../components/admin/master-data/MasterDataTabs.vue'
import type { WalletProvider } from '../../../../types/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'إدارة البيانات الأساسية — المحافظ الإلكترونية | لوحة الإدارة العامة' })

const {
  walletProviders,
  isLoading,
  isActionLoading,
  fetchWalletProviders,
  createWalletProvider,
  updateWalletProvider,
  deleteWalletProvider,
} = useAdminMasterData()

// Non-blocking lazy SSR Data Fetching
const { pending } = useLazyAsyncData('admin-master-wallet-providers', () => fetchWalletProviders(false), {
  default: () => walletProviders.value,
})

const isRefreshing = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

// Selected provider for modals
const selectedProvider = ref<WalletProvider | null>(null)
const isDetailModalOpen = ref(false)
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

// Forms
const newProvider = ref({
  code: '',
  name_ar: '',
  name_en: '',
  logo_path: '',
  is_active: true,
})

const editProvider = ref({
  id: 0,
  code: '',
  name_ar: '',
  name_en: '',
  logo_path: '',
  is_active: true,
})

const filteredProviders = computed(() => {
  return walletProviders.value.filter((p) => {
    if (statusFilter.value === 'active' && !p.is_active) return false
    if (statusFilter.value === 'inactive' && p.is_active) return false

    if (!searchQuery.value.trim()) return true
    const q = searchQuery.value.trim().toLowerCase()
    return (
      p.code.toLowerCase().includes(q) ||
      p.name_ar.toLowerCase().includes(q) ||
      (p.name_en && p.name_en.toLowerCase().includes(q))
    )
  })
})

async function handleRefreshCurrentTab() {
  isRefreshing.value = true
  try {
    await fetchWalletProviders(true)
  } finally {
    isRefreshing.value = false
  }
}

function viewDetails(provider: WalletProvider) {
  selectedProvider.value = provider
  isDetailModalOpen.value = true
}

function openEditModal(provider: WalletProvider) {
  selectedProvider.value = provider
  editProvider.value = {
    id: provider.id,
    code: provider.code,
    name_ar: provider.name_ar,
    name_en: provider.name_en || '',
    logo_path: provider.logo_path || '',
    is_active: provider.is_active !== false,
  }
  isEditModalOpen.value = true
}

function openDeleteModal(provider: WalletProvider) {
  selectedProvider.value = provider
  isDeleteModalOpen.value = true
}

async function handleAddProvider() {
  if (!newProvider.value.code.trim() || !newProvider.value.name_ar.trim()) return
  try {
    await createWalletProvider({
      code: newProvider.value.code.trim().toUpperCase(),
      name_ar: newProvider.value.name_ar.trim(),
      name_en: newProvider.value.name_en.trim() || undefined,
      logo_path: newProvider.value.logo_path.trim() || undefined,
      is_active: newProvider.value.is_active,
    })
    isAddModalOpen.value = false
    newProvider.value = { code: '', name_ar: '', name_en: '', logo_path: '', is_active: true }
  } catch {
    /* error handled in composable */
  }
}

async function handleUpdateProvider() {
  if (!editProvider.value.code.trim() || !editProvider.value.name_ar.trim() || !editProvider.value.id) return
  try {
    await updateWalletProvider(editProvider.value.id, {
      code: editProvider.value.code.trim().toUpperCase(),
      name_ar: editProvider.value.name_ar.trim(),
      name_en: editProvider.value.name_en.trim() || undefined,
      logo_path: editProvider.value.logo_path.trim() || undefined,
      is_active: editProvider.value.is_active,
    })
    isEditModalOpen.value = false
  } catch {
    /* error handled in composable */
  }
}

async function executeDelete() {
  if (!selectedProvider.value) return
  try {
    await deleteWalletProvider(selectedProvider.value.id)
    isDeleteModalOpen.value = false
    selectedProvider.value = null
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
          إدارة وتوصيف مزودي المحافظ الإلكترونية المعتمدة لعمليات الدفع وتحويل مستحقات المتاجر.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="handleRefreshCurrentTab"
          :disabled="isRefreshing || pending || isLoading"
          class="btn-outline h-10 px-4 text-xs font-bold gap-2 text-solar-text-body hover:bg-solar-bg-subtle"
          title="تحديث بيانات المحافظ الإلكترونية من السيرفر"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': isRefreshing || pending || isLoading }" />
          <span>تحديث</span>
        </button>

        <button
          type="button"
          @click="isAddModalOpen = true"
          class="btn-primary h-10 px-5 text-xs font-bold gap-2 bg-solar-navy text-white hover:bg-solar-navy-dark shadow-md"
        >
          <Plus class="size-4" />
          <span>إضافة محفظة جديدة</span>
        </button>
      </div>
    </div>

    <!-- شريط التبويبات -->
    <MasterDataTabs />

    <!-- كارد المحافظ الإلكترونية -->
    <div class="solar-card p-5 sm:p-7">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-solar-border-card/60 pb-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-navy text-white">
            <Wallet class="size-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-solar-text-heading">مزودو المحافظ الإلكترونية المعتمدة</h2>
            <p class="text-xs text-solar-text-muted">
              إجمالي مزودي المحافظ في النظام: {{ walletProviders.length }} محفظة
            </p>
          </div>
        </div>

        <!-- الفلاتر والبحث -->
        <div class="flex items-center gap-2 flex-wrap">
          <div class="relative min-w-[200px] sm:min-w-[240px]">
            <Search class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-solar-text-muted" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="البحث بالرمز أو الاسم..."
              class="solar-input h-10 pr-9 pl-4 text-xs w-full"
            />
          </div>

          <select v-model="statusFilter" class="solar-input h-10 text-xs px-3 font-bold">
            <option value="all">كافة الحالات</option>
            <option value="active">المفعلة فقط</option>
            <option value="inactive">المعطلة فقط</option>
          </select>
        </div>
      </div>

      <!-- حالة التحميل الأولي فقط -->
      <div v-if="(pending || isRefreshing) && walletProviders.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 class="size-8 text-solar-navy animate-spin mb-3" />
        <p class="text-xs font-bold text-solar-text-muted">جاري تحميل مزودي المحافظ الإلكترونية من السيرفر...</p>
      </div>

      <!-- جدول المحافظ الإلكترونية -->
      <div v-else class="mt-6 overflow-x-auto rounded-xl border border-solar-border-card/80">
        <table class="w-full text-right text-xs">
          <thead class="bg-solar-bg-subtle/70 text-solar-text-muted font-bold border-b border-solar-border-card">
            <tr>
              <th class="py-3.5 px-4 font-bold text-center w-14">الرمز</th>
              <th class="py-3.5 px-4 font-bold">اسم المحفظة الإلكترونية</th>
              <th class="py-3.5 px-4 font-bold">الكود التعريفي (Code)</th>
              <th class="py-3.5 px-4 font-bold text-center">المحافظ المرتبطة</th>
              <th class="py-3.5 px-4 font-bold text-center">حالة التفعيل</th>
              <th class="py-3.5 px-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-solar-border-card/60">
            <tr
              v-for="item in filteredProviders"
              :key="item.id"
              class="transition-colors hover:bg-solar-bg-subtle/30"
            >
              <!-- الأيقونة -->
              <td class="py-4 px-4 text-center">
                <span class="inline-flex size-9 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy shadow-2xs font-bold text-xs font-mono">
                  <CreditCard class="size-4" />
                </span>
              </td>

              <!-- اسم المحفظة -->
              <td class="py-4 px-4">
                <p class="font-extrabold text-solar-text-heading text-sm">{{ item.name_ar }}</p>
                <p v-if="item.name_en" class="text-[11px] text-solar-text-muted mt-0.5">{{ item.name_en }}</p>
              </td>

              <!-- الكود التعريفي -->
              <td class="py-4 px-4 font-mono font-bold text-solar-navy-dark text-xs">
                <span class="px-2 py-1 rounded-md bg-solar-bg-subtle border border-solar-border-card">
                  {{ item.code }}
                </span>
              </td>

              <!-- عدد المحافظ المرتبطة للمستخدمين والمتاجر -->
              <td class="py-4 px-4 text-center">
                <span class="inline-flex items-center gap-1 rounded-lg bg-solar-bg-subtle px-2.5 py-1 text-xs font-bold text-solar-text-heading">
                  <Users class="size-3 text-solar-text-muted" />
                  <span>{{ item.user_wallets_count ?? 0 }} حساب</span>
                </span>
              </td>

              <!-- حالة التفعيل -->
              <td class="py-4 px-4 text-center">
                <AdminBadge :status="item.is_active !== false ? 'مفعل' : 'معطل'" />
              </td>

              <!-- الإجراءات (تعديل، حذف، معاينة) -->
              <td class="py-4 px-4 text-center">
                <div class="inline-flex items-center justify-center gap-1.5">
                  <!-- أيقونة التعديل -->
                  <button
                    type="button"
                    @click="openEditModal(item)"
                    class="size-8 inline-flex items-center justify-center rounded-lg text-solar-navy bg-sky-50 hover:bg-sky-100 hover:text-solar-navy-dark transition-colors border border-sky-100"
                    title="تعديل بيانات المحفظة"
                  >
                    <Pencil class="size-3.5" />
                  </button>

                  <!-- أيقونة الحذف -->
                  <button
                    type="button"
                    @click="openDeleteModal(item)"
                    class="size-8 inline-flex items-center justify-center rounded-lg text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
                    title="حذف مزود المحفظة"
                  >
                    <Trash2 class="size-3.5" />
                  </button>

                  <!-- أيقونة المعاينة -->
                  <button
                    type="button"
                    @click="viewDetails(item)"
                    class="size-8 inline-flex items-center justify-center rounded-lg text-solar-text-muted bg-solar-bg-subtle hover:bg-slate-200 hover:text-solar-text-heading transition-colors border border-solar-border-card"
                    title="معاينة التفاصيل"
                  >
                    <Eye class="size-3.5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredProviders.length === 0">
              <td colspan="6" class="py-12 text-center text-solar-text-muted">
                لا توجد محافظ إلكترونية مطابقة لمعايير البحث الحالية.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- نافذة إضافة محفظة جديدة -->
    <AdminModal
      v-model="isAddModalOpen"
      title="إضافة مزود محفظة إلكترونية جديد"
      subtitle="تسجيل وسيلة دفع إلكترونية جديدة في النظام"
      :icon="Wallet"
      max-width="md"
    >
      <form @submit.prevent="handleAddProvider" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">الرمز التعريفي الفريد (Code) *</label>
          <input
            v-model="newProvider.code"
            type="text"
            required
            dir="ltr"
            placeholder="مثال: KURAIMI_FLOOS أو JAWALI"
            class="solar-input h-11 text-xs w-full uppercase font-mono tracking-wider text-left"
          />
          <p class="text-[10px] text-solar-text-muted mt-1">يُستخدم في الربط البرمجي ومعالجة الحوالات المالية (أحرف إنجليزية كبيرة).</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">اسم المحفظة بالعربية *</label>
          <input
            v-model="newProvider.name_ar"
            type="text"
            required
            placeholder="مثال: الكريمي إم فلوس"
            class="solar-input h-11 text-xs w-full"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">اسم المحفظة بالإنجليزية (اختياري)</label>
          <input
            v-model="newProvider.name_en"
            type="text"
            dir="ltr"
            placeholder="مثال: Kuraimi M-Floos"
            class="solar-input h-11 text-xs w-full text-left"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">مسار الشعار (Logo Path)</label>
          <input
            v-model="newProvider.logo_path"
            type="text"
            dir="ltr"
            placeholder="مثال: wallets/kurimi.png"
            class="solar-input h-11 text-xs w-full text-left"
          />
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input
            id="provider-active"
            v-model="newProvider.is_active"
            type="checkbox"
            class="size-4 rounded text-solar-navy focus:ring-solar-navy"
          />
          <label for="provider-active" class="text-xs font-bold text-solar-text-heading cursor-pointer">
            تفعيل وسيلة الدفع وإتاحتها للعملاء والمتاجر في النظام
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
            <span>حفظ المحفظة</span>
          </button>
        </div>
      </form>
    </AdminModal>

    <!-- نافذة تعديل محفظة موجودة -->
    <AdminModal
      v-model="isEditModalOpen"
      title="تعديل بيانات المحفظة الإلكترونية"
      subtitle="تحديث الرمز أو المسمى أو حالة التفعيل"
      :icon="Pencil"
      max-width="md"
    >
      <form @submit.prevent="handleUpdateProvider" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">الرمز التعريفي الفريد (Code) *</label>
          <input
            v-model="editProvider.code"
            type="text"
            required
            dir="ltr"
            class="solar-input h-11 text-xs w-full uppercase font-mono tracking-wider text-left"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">اسم المحفظة بالعربية *</label>
          <input
            v-model="editProvider.name_ar"
            type="text"
            required
            class="solar-input h-11 text-xs w-full"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">اسم المحفظة بالإنجليزية</label>
          <input
            v-model="editProvider.name_en"
            type="text"
            dir="ltr"
            class="solar-input h-11 text-xs w-full text-left"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-solar-text-body mb-1.5">مسار الشعار</label>
          <input
            v-model="editProvider.logo_path"
            type="text"
            dir="ltr"
            class="solar-input h-11 text-xs w-full text-left"
          />
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input
            id="edit-provider-active"
            v-model="editProvider.is_active"
            type="checkbox"
            class="size-4 rounded text-solar-navy focus:ring-solar-navy"
          />
          <label for="edit-provider-active" class="text-xs font-bold text-solar-text-heading cursor-pointer">
            تفعيل وسيلة الدفع وإتاحتها للعملاء والمتاجر
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button
            type="button"
            @click="isEditModalOpen = false"
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
            <span>حفظ التعديلات</span>
          </button>
        </div>
      </form>
    </AdminModal>

    <!-- نافذة تأكيد حذف محفظة -->
    <AdminModal
      v-model="isDeleteModalOpen"
      title="تأكيد حذف أو تعطيل المحفظة"
      subtitle="إزالة مزود المحفظة من الخيارات المتاحة"
      :icon="Trash2"
      max-width="sm"
    >
      <div v-if="selectedProvider" class="flex flex-col gap-4">
        <p class="text-xs text-solar-text-body leading-relaxed">
          هل أنت متأكد من رغبتك في حذف مزود المحفظة:
          <span class="font-extrabold text-solar-text-heading">"{{ selectedProvider.name_ar }}" ({{ selectedProvider.code }})</span>؟
        </p>

        <p class="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          ملاحظة: إذا كانت المحفظة مرتبطة بمعاملات مالية أو حسابات مستخدمين مسجلة، سيتم تعطيلها تلقائياً بدلاً من الحذف لضمان سلامة العمليات المحاسبية.
        </p>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-solar-border-card mt-2">
          <button
            type="button"
            @click="isDeleteModalOpen = false"
            :disabled="isActionLoading"
            class="btn-outline h-10 px-5 text-xs font-bold"
          >
            إلغاء
          </button>
          <button
            type="button"
            @click="executeDelete"
            :disabled="isActionLoading"
            class="btn-primary h-10 px-6 text-xs font-bold gap-2 bg-red-600 text-white hover:bg-red-700 shadow-md"
          >
            <Loader2 v-if="isActionLoading" class="size-4 animate-spin" />
            <span>تأكيد الإجراء</span>
          </button>
        </div>
      </div>
    </AdminModal>

    <!-- نافذة معاينة تفاصيل المحفظة -->
    <AdminModal
      v-model="isDetailModalOpen"
      title="تفاصيل مزود المحفظة الإلكترونية"
      subtitle="استعراض الكود والبيانات الفنية والربط المالي"
      :icon="Wallet"
      max-width="md"
    >
      <div v-if="selectedProvider" class="flex flex-col gap-4">
        <div class="flex items-center gap-3 p-3.5 rounded-xl bg-solar-bg-subtle/80 border border-solar-border-card">
          <div class="size-11 rounded-xl bg-solar-navy text-white flex items-center justify-center shrink-0">
            <Wallet class="size-5" />
          </div>
          <div>
            <h3 class="font-black text-sm text-solar-text-heading">{{ selectedProvider.name_ar }}</h3>
            <p class="text-xs text-solar-text-muted font-mono mt-0.5">رمز الكود: {{ selectedProvider.code }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-[11px] text-solar-text-muted font-bold">الحالة التشغيلية</p>
            <p class="text-xs font-black text-solar-text-heading mt-1">
              {{ selectedProvider.is_active !== false ? 'مفعلة في بوابات الدفع' : 'معطلة مؤقتاً' }}
            </p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-[11px] text-solar-text-muted font-bold">الربط البرمجي بالـ API</p>
            <p class="text-xs font-black text-emerald-600 mt-1">
              متصل بقاعدة البيانات PostgreSQL
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
