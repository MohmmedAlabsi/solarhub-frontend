<script setup lang="ts">
import type { NotificationOverviewSummary } from '../../../../types/customer-notification'
defineProps<{ summary: NotificationOverviewSummary }>()
</script>

<template>
  <section class="flex flex-col justify-between gap-6 rounded-2xl bg-[linear-gradient(115deg,#263c3d_0%,#243b53_45%,#0c253c_100%)] p-6 text-white shadow-md sm:flex-row sm:items-center sm:p-8" aria-labelledby="notifications-heading">
    <div>
      <span class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] text-amber-200"><span class="size-1.5 rounded-full bg-solar-yellow" aria-hidden="true" />بوابة التنبيهات الذكية</span>
      <h1 id="notifications-heading" class="mt-2 text-2xl font-black sm:text-3xl">مركز الإشعارات</h1>
      <p class="mt-3 text-sm leading-7 text-slate-400">تابع تحديثات طلباتك وعروض المهندسين وحالة مشاريعك الشمسية أولًا بأول</p>
    </div>
    <div class="flex shrink-0 gap-3">
      <p class="min-w-24 rounded-xl bg-white/10 px-4 py-3 text-center"><strong class="block text-2xl text-amber-200">{{ summary.kind === 'sent' ? summary.totalCount : summary.unreadCount }}</strong><span class="mt-2 block text-[11px] text-slate-400">{{ summary.kind === 'sent' ? 'إجمالي الصادرة' : 'غير مقروءة' }}</span></p>
      <p class="min-w-28 rounded-xl bg-white/10 px-4 py-3 text-center"><strong class="block text-2xl">{{ summary.kind === 'sent' ? summary.pendingCount : summary.totalCount }}</strong><span class="mt-2 block text-[11px] text-slate-400">{{ summary.kind === 'sent' ? 'معلقة' : 'إجمالي الإشعارات' }}</span></p>
    </div>
  </section>
</template>
