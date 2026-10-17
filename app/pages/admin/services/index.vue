<script setup lang="ts">
import { Download, Eye, Search } from 'lucide-vue-next'
import AdminSectionHeading from '../../../components/admin/workspace/AdminSectionHeading.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AdminBadge from '../../../components/admin/common/AdminBadge.vue'
import AdminServiceDetails from '../../../components/admin/services/AdminServiceDetails.vue'
import type { AdminServiceRequest } from '../../../../types/admin'
definePageMeta({layout:'admin'})
useSeoMeta({title:'إدارة طلبات الخدمات | SolarHub'})
const data=useAdminWorkspace(),query=ref(''),status=ref('all'),detailsOpen=ref(false),selected=ref<AdminServiceRequest>()
const {page,filtered,rows,totalPages,pageSize}=useAdminTable(()=>data.value.services,s=>adminMatches(query.value,s.id,s.client,s.city)&&(status.value==='all'||s.status===status.value),()=>[query.value,status.value])
function exportList(){downloadAdminCsv('طلبات_الخدمات',['رقم الطلب','العميل','نوع الخدمة','المحافظة','القدرة kWp','الحالة'],filtered.value.map(s=>[s.id,s.client,s.service,s.city,s.capacity,serviceStatusLabels[s.status]]))}
</script>
<template>
  <div class="admin-managed">
    <AdminSectionHeading title="إدارة طلبات الخدمات" description="عرض طلبات الخدمات ومراجعة العروض المقدمة لكل طلب."><button class="btn-outline" @click="exportList"><Download class="size-4" />تصدير القائمة</button></AdminSectionHeading>
    <div class="admin-filter"><div class="admin-search"><Search /><input v-model="query" aria-label="البحث عن طلب خدمة" class="solar-input" type="search" placeholder="ابحث برقم الطلب، اسم العميل، أو المحافظة..." /></div><select v-model="status" aria-label="حالة طلب الخدمة" class="solar-input"><option value="all">كافة الحالات</option><option v-for="(label,value) in serviceStatusLabels" :key="value" :value="value">{{ label }}</option></select></div>
    <div class="admin-table-wrap"><table class="min-w-[820px]"><thead><tr><th>العميل</th><th>نوع الخدمة</th><th>المحافظة</th><th>تقدير قدرة النظام</th><th>حالة الطلب</th><th>الإجراءات</th></tr></thead><tbody>
      <tr v-for="request in rows" :key="request.id"><td><div class="flex items-center gap-3"><span class="admin-avatar">{{ adminInitials(request.client) }}</span><div class="min-w-32"><p class="font-bold">{{ request.client }}</p><p class="mt-1 text-[11px] text-solar-text-muted"><bdi>#{{ request.id }}</bdi></p></div></div></td><td class="max-w-48"><span class="inline-block rounded-md bg-solar-bg-subtle px-3 py-1 font-semibold">{{ request.service }}</span></td><td>{{ request.city }}</td><td class="whitespace-nowrap font-bold"><bdi>{{ request.capacity }} kWp</bdi></td><td><AdminBadge :status="serviceStatusLabels[request.status]" :show-dot="false" :tone="request.status==='open'?'info':request.status==='completed'?'success':request.status==='cancelled'?'neutral':'warning'" /></td><td><button class="btn-outline px-3 py-2 text-xs" :aria-label="`عرض تفاصيل ${request.id}`" @click="selected=request;detailsOpen=true"><Eye class="size-4" />عرض التفاصيل</button></td></tr>
      <tr v-if="!rows.length"><td colspan="6" class="admin-empty">{{ data.services.length ? 'لا توجد طلبات مطابقة للبحث والفلاتر.' : 'لا توجد طلبات خدمات بعد.' }}</td></tr>
    </tbody></table><div class="admin-table-footer"><AdminPagination v-model:current-page="page" :total-pages="totalPages" :total-count="filtered.length" :page-size="pageSize" item-name="طلب خدمة" :show-progress="false" /></div></div>
    <p class="admin-demo">طلبات وعروض تجريبية للمراجعة فقط؛ لا يتم ترسية عروض من الإدارة.</p>
    <AdminServiceDetails v-model="detailsOpen" :request="selected" />
  </div>
</template>
