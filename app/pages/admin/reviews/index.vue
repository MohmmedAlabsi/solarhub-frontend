<script setup lang="ts">
import { Search, Star, Store, UserRoundCog } from 'lucide-vue-next'
import AdminSectionHeading from '../../../components/admin/workspace/AdminSectionHeading.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import type { AdminReview } from '../../../../types/admin'
definePageMeta({layout:'admin'})
useSeoMeta({title:'إدارة التقييمات | SolarHub'})
const data=useAdminWorkspace(),{notify}=useAdminNotice(),route=useRoute(),query=ref('')
const activeTab=computed(()=>route.query.tab==='engineers'?'engineers':'suppliers')
function targetName(review:AdminReview,kind:'suppliers'|'engineers'){const records=kind==='suppliers'?data.value.suppliers:data.value.engineers;return records.find(r=>r.id===review.targetId)?.name??`سجل غير متاح (${review.targetId})`}
const suppliers=useAdminTable(()=>data.value.supplierReviews,r=>adminMatches(query.value,r.orderId,r.client,targetName(r,'suppliers')),()=>[query.value],8)
const engineers=useAdminTable(()=>data.value.engineerReviews,r=>adminMatches(query.value,r.orderId,r.client,targetName(r,'engineers')),()=>[query.value],6)
const table=computed(()=>activeTab.value==='suppliers'?suppliers:engineers)
const rows=computed(()=>table.value.rows.value)
async function select(tab:'suppliers'|'engineers'){await navigateTo({path:route.path,query:{...route.query,tab},hash:route.hash})}
function changeApproval(review:AdminReview){review.approved=!review.approved;notify('حُدّثت حالة اعتماد التقييم محليًا داخل الجلسة.')}
</script>
<template>
  <div class="admin-managed">
    <div class="flex flex-col justify-between gap-4 border-b border-solar-border-card pb-3 lg:flex-row lg:items-end"><AdminSectionHeading title="إدارة التقييمات" description="عرض تقييمات العملاء للموردين والمهندسين ومراجعة حالة اعتمادها." /><div class="admin-search w-full lg:max-w-sm"><Search /><input v-model="query" type="search" aria-label="البحث في التقييمات" class="solar-input !bg-white" placeholder="ابحث برقم الطلب، اسم العميل، المورد، أو المهندس..." /></div></div>
    <nav class="-mt-3 flex flex-wrap border-b border-solar-border-card" aria-label="تبويبات التقييمات"><button v-for="tab in (['suppliers','engineers'] as const)" :key="tab" class="inline-flex items-center gap-2 border-b-2 px-4 py-4 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-solar-yellow" :class="activeTab===tab?'border-solar-yellow font-bold text-solar-navy-dark':'border-transparent text-solar-text-muted'" :aria-current="activeTab===tab?'page':undefined" @click="select(tab)"><component :is="tab==='suppliers'?Store:UserRoundCog" class="size-4" />{{ tab==='suppliers'?'تقييمات الموردين':'تقييمات المهندسين' }}</button></nav>
    <div class="admin-table-wrap"><table class="min-w-[800px]"><thead><tr><th>{{ activeTab==='suppliers'?'الطلب المرتبط':'طلب الخدمة المرتبط' }}</th><th>العميل</th><th>{{ activeTab==='suppliers'?'المورد':'المهندس' }}</th><th>التقييم</th><th>التعليق</th><th>حالة الاعتماد</th></tr></thead><tbody>
      <tr v-for="review in rows" :key="review.id"><td class="font-bold"><bdi>#{{ review.orderId }}</bdi></td><td><span class="flex min-w-32 items-center gap-2"><span class="admin-avatar">{{ adminInitials(review.client) }}</span>{{ review.client }}</span></td><td class="min-w-36">{{ targetName(review,activeTab) }}</td><td><span class="inline-flex items-center gap-1 whitespace-nowrap rounded border border-amber-200 bg-amber-50 px-2 py-1 font-bold"><Star class="size-3.5 fill-solar-yellow text-solar-yellow" /><bdi>{{ review.score }}/5</bdi></span></td><td class="min-w-64 text-solar-text-muted">{{ review.comment }}</td><td><button class="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow" :aria-label="`${review.approved?'إلغاء اعتماد':'اعتماد'} تقييم ${review.client}`" :aria-pressed="review.approved" @click="changeApproval(review)"><AdminBadge :status="review.approved?'معتمد':'غير معتمد'" :tone="review.approved?'success':'warning'" :show-dot="false" /></button></td></tr>
      <tr v-if="!rows.length"><td colspan="6" class="admin-empty">{{ (activeTab==='suppliers'?data.supplierReviews.length:data.engineerReviews.length) ? 'لا توجد تقييمات مطابقة للبحث.' : 'لا توجد تقييمات في هذا التبويب بعد.' }}</td></tr>
    </tbody></table></div>
    <AdminPagination :current-page="table.page.value" :total-pages="table.totalPages.value" :total-count="table.filtered.value.length" :page-size="table.pageSize" item-name="تقييم" :show-progress="false" @update:current-page="table.page.value=$event" />
    <p class="admin-demo">تقييمات تجريبية؛ اعتمادها محلي في هذه الجلسة ولا يغيّر تقييمات واجهات العميل أو الزوار.</p>
  </div>
</template>
