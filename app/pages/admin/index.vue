<script setup lang="ts">
import { CalendarDays, ChevronLeft, ClipboardList, Store, Users, UserRoundCog } from 'lucide-vue-next'
import AdminSectionHeading from '../../components/admin/workspace/AdminSectionHeading.vue'
definePageMeta({layout:'admin',alias:'/admin/dashboard'})
useSeoMeta({title:'لوحة تحكم الإدارة | SolarHub'})
const data=useAdminWorkspace(),orders=useAdminOrders()
const today=ref('')
onMounted(()=>{today.value=new Intl.DateTimeFormat('ar-SA',{calendar:'gregory',year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Riyadh'}).format(new Date())})
const pendingSuppliers=computed(()=>data.value.suppliers.filter(s=>s.approval==='pending').length)
const pendingEngineers=computed(()=>data.value.engineers.filter(e=>e.approval==='pending').length)
const pendingOrders=computed(()=>orders.value.filter(o=>o.status==='قيد المعالجة').length)
const stats=computed(()=>[{label:'المستخدمون',value:data.value.users.length,detail:'حساب مسجل',icon:Users,warm:false},{label:'الموردون',value:data.value.suppliers.filter(s=>s.approval==='approved').length,detail:'متجر معتمد',icon:Store,warm:true},{label:'المهندسون',value:data.value.engineers.filter(e=>e.approval==='approved').length,detail:'مهندس معتمد',icon:UserRoundCog,warm:false},{label:'طلبات الشراء',value:orders.value.length,detail:'طلب شراء',icon:ClipboardList,warm:true}])
const tasks=computed(()=>[{title:'طلبات الشراء التي تحتاج إلى متابعة',count:pendingOrders.value,description:'طلبًا قيد الانتظار',label:'تحتاج إجراء',to:'/admin/orders?status='+encodeURIComponent('قيد المعالجة'),icon:ClipboardList},{title:'طلبات اعتماد الموردين',count:pendingSuppliers.value,description:'موردين جدد',label:'قيد الفحص',to:'/admin/stores?status=pending',icon:Store},{title:'طلبات اعتماد المهندسين',count:pendingEngineers.value,description:'مهندسين بانتظار الاعتماد',label:'وثائق جديدة',to:'/admin/engineers?status=pending',icon:UserRoundCog}])
</script>
<template>
  <div class="admin-managed">
    <AdminSectionHeading title="مرحبًا بك في لوحة تحكم Solar Hub" description="من هنا يمكنك متابعة أهم مؤشرات المنصة وإدارة أعمالك بسهولة."><span class="inline-flex items-center gap-2 rounded-xl border border-solar-border-card bg-white px-4 py-3 text-xs font-bold"><CalendarDays class="size-4 text-solar-yellow" />اليوم: {{ today||'جارٍ تحميل التاريخ...' }}</span></AdminSectionHeading>
    <div class="mt-2 grid gap-5 border-t border-solar-border-card pt-6 sm:grid-cols-2 xl:grid-cols-4"><article v-for="stat in stats" :key="stat.label" class="solar-card flex items-center gap-4 !p-5"><span class="flex size-12 shrink-0 items-center justify-center rounded-xl" :class="stat.warm?'bg-solar-yellow/20 text-amber-800':'bg-solar-bg-subtle text-solar-navy'"><component :is="stat.icon" class="size-6" /></span><div><h2 class="text-xs text-solar-text-muted">{{ stat.label }}</h2><p class="mt-2 text-2xl font-bold">{{ stat.value.toLocaleString('ar-SA',{numberingSystem:'latn'}) }} <span class="text-xs font-normal text-solar-text-muted">{{ stat.detail }}</span></p></div></article></div>
    <section class="mt-2"><h2 class="text-lg font-bold">متابعة المنصة</h2><p class="mt-2 text-xs text-solar-text-muted">المهام والطلبات التي تتطلب مراجعة فورية من الإدارة</p><div class="mt-6 flex flex-col gap-4"><article v-for="task in tasks" :key="task.to" class="solar-card !p-5"><div class="flex items-center gap-3"><span class="flex size-10 items-center justify-center rounded-lg bg-solar-yellow/15"><component :is="task.icon" class="size-5" /></span><div><h3 class="text-sm font-bold">{{ task.title }}</h3><p class="mt-2 text-xs text-solar-text-muted">{{ task.count }} {{ task.description }}</p></div></div><div class="mt-5 flex items-center justify-between border-t border-solar-border-card/50 pt-3 text-xs"><span class="text-amber-700">{{ task.label }}</span><NuxtLink :to="task.to" class="inline-flex items-center gap-1 font-bold focus-visible:ring-2 focus-visible:ring-solar-yellow">مراجعة<ChevronLeft class="size-3" /></NuxtLink></div></article></div></section>
    <p class="admin-demo">مؤشرات محسوبة من سجلات الإدارة المحلية. التعديلات تجريبية داخل الجلسة فقط.</p>
  </div>
</template>
