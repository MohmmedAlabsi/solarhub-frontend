<script setup lang="ts">
import { BellOff, House, RotateCcw } from 'lucide-vue-next'

withDefaults(defineProps<{ filtered?: boolean }>(), { filtered: false })
defineEmits<{ reset: [] }>()
</script>

<template>
  <section class="flex min-h-[370px] flex-col items-center justify-center solar-card px-5 py-12 text-center sm:px-10 sm:py-16" aria-labelledby="notification-empty-heading">
    <span class="flex size-20 items-center justify-center rounded-full bg-solar-status-info-bg"><BellOff class="size-9 text-solar-text-secondary" :stroke-width="2" aria-hidden="true" /></span>
    <h2 id="notification-empty-heading" class="mt-3 text-xl font-extrabold leading-8 text-solar-text-heading">{{ filtered ? 'لا توجد إشعارات مطابقة للفلتر' : 'لا توجد أي إشعارات جديدة حالياً' }}</h2>
    <p class="mt-2 max-w-md text-sm leading-6 text-solar-text-muted">{{ filtered ? 'ليس لديك إشعارات غير مقروءة حاليًا. أعد ضبط الفلتر لعرض جميع الإشعارات الواردة.' : 'صندوق الإشعارات فارغ. ستصلك هنا تنبيهات فورية بكل ما يخص تحديثات طلبات الشراء، عروض المهندسين، والتأكيدات المالية.' }}</p>
    <button v-if="filtered" type="button" class="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-solar-navy px-6 py-3 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow" @click="$emit('reset')"><RotateCcw class="size-4" aria-hidden="true" />إعادة ضبط الفلتر</button>
    <NuxtLink v-else to="/customer/dashboard" class="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-solar-navy px-6 py-3 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow"><House class="size-4" aria-hidden="true" />العودة للرئيسية</NuxtLink>
  </section>
</template>
