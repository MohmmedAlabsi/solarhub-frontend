<script setup lang="ts">
import { Download, MapPin, Search, Trash2, UserPlus } from 'lucide-vue-next'
import AdminSectionHeading from '../../../components/admin/workspace/AdminSectionHeading.vue'
import AdminModal from '../../../components/admin/common/AdminModal.vue'
import AdminPagination from '../../../components/admin/common/AdminPagination.vue'
import AdminDirectoryForm from '../../../components/admin/directory/AdminDirectoryForm.vue'
import type { AdminUser } from '../../../../types/admin'
definePageMeta({layout:'admin'})
useSeoMeta({title:'إدارة المستخدمين | SolarHub'})
const data=useAdminWorkspace(),{notify}=useAdminNotice(),query=ref(''),status=ref('all'),addOpen=ref(false),deleteOpen=ref(false),selected=ref<AdminUser>()
const {page,filtered,rows,totalPages,pageSize}=useAdminTable(()=>data.value.users,u=>adminMatches(query.value,u.name,u.email,u.phone)&&(status.value==='all'||u.active===(status.value==='active')),()=>[query.value,status.value],7)
function changeStatus(user:AdminUser,event:Event){user.active=(event.target as HTMLSelectElement).value==='active';notify('حُدّثت حالة الحساب محليًا داخل الجلسة.')}
function remove(){if(!selected.value)return;data.value.users=data.value.users.filter(u=>u.id!==selected.value.id);deleteOpen.value=false;notify('حُذف المستخدم من البيانات المحلية فقط.')}
function exportList(){downloadAdminCsv('المستخدمون',['الاسم','نوع الحساب','البريد','الهاتف','المنطقة','الحالة','تاريخ الإنشاء'],filtered.value.map(u=>[u.name,u.role,u.email,u.phone,u.city,u.active?'نشط':'غير نشط',u.createdAt]))}
</script>
<template>
  <div class="admin-managed">
    <AdminSectionHeading title="إدارة المستخدمين" description="عرض وإدارة حسابات المستخدمين المسجلين في منصة Solar Hub وحالتها."><button class="btn-outline" @click="exportList"><Download class="size-4" />تصدير القائمة</button><button class="btn-dark" @click="page=1;addOpen=true"><UserPlus class="size-4" />إضافة مستخدم</button></AdminSectionHeading>
    <div class="admin-filter"><div class="admin-search"><Search aria-hidden="true" /><input v-model="query" type="search" aria-label="البحث عن مستخدم" placeholder="ابحث باسم المستخدم، البريد الإلكتروني، أو رقم الهاتف..." class="solar-input" /></div><select v-model="status" class="solar-input" aria-label="حالة الحساب"><option value="all">حالة الحساب: الكل</option><option value="active">نشط</option><option value="inactive">غير نشط</option></select></div>
    <div class="admin-table-wrap">
      <table class="min-w-[860px]"><thead><tr><th>الاسم</th><th>البريد الإلكتروني</th><th>رقم الهاتف</th><th>المحافظة / الموقع</th><th>حالة الحساب</th><th>تاريخ إنشاء الحساب</th><th>الإجراءات</th></tr></thead><tbody>
        <tr v-for="user in rows" :key="user.id"><td><div class="flex items-center gap-2"><span class="admin-avatar">{{ adminInitials(user.name) }}</span><div class="min-w-[125px]"><p class="font-bold text-solar-text-heading">{{ user.name }}</p><p class="text-[11px] text-solar-text-muted">{{ user.role }}</p></div></div></td><td dir="ltr">{{ user.email }}</td><td dir="ltr">{{ user.phone }}</td><td><span class="inline-flex items-center gap-1"><MapPin class="size-3 shrink-0" />{{ user.city }}</span></td><td><select :value="user.active?'active':'inactive'" :aria-label="`حالة حساب ${user.name}`" class="min-w-24 rounded-md border-0 px-2 py-1 text-xs focus:ring-2 focus:ring-solar-yellow" :class="user.active?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'" @change="changeStatus(user,$event)"><option value="active">نشط</option><option value="inactive">غير نشط</option></select></td><td class="whitespace-nowrap">{{ adminDate(user.createdAt) }}</td><td><button type="button" class="rounded p-2 text-red-500 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-300" :aria-label="`حذف ${user.name}`" @click="selected=user;deleteOpen=true"><Trash2 class="size-4" /></button></td></tr>
        <tr v-if="!rows.length"><td colspan="7" class="admin-empty">{{ data.users.length ? 'لا يوجد مستخدمون مطابقون للبحث والفلاتر.' : 'لا يوجد مستخدمون بعد.' }}</td></tr>
      </tbody></table>
      <div class="admin-table-footer"><AdminPagination v-model:current-page="page" :total-pages="totalPages" :total-count="filtered.length" :page-size="pageSize" item-name="مستخدم" :show-progress="false" /></div>
    </div>
    <p class="admin-demo">بيانات تجريبية؛ الإضافة وتغيير الحالة والحذف محلية داخل الجلسة فقط.</p>
    <AdminDirectoryForm v-model="addOpen" kind="user" />
    <AdminModal v-model="deleteOpen" title="تأكيد حذف المستخدم" max-width="md"><p class="text-sm leading-7">هل تريد حذف {{ selected?.name }} من البيانات التجريبية؟</p><template #footer><button class="btn-outline" @click="deleteOpen=false">إلغاء</button><button class="btn-dark bg-red-600 hover:bg-red-700" @click="remove">تأكيد الحذف</button></template></AdminModal>
  </div>
</template>
