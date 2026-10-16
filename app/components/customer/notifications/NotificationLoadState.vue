<script setup lang="ts">
import { CircleAlert, LoaderCircle } from 'lucide-vue-next'
import type { NotificationLoadStatus } from '../../../../types/customer-notification'

defineProps<{ status: Exclude<NotificationLoadStatus, 'success'> }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <section class="flex min-h-[370px] flex-col items-center justify-center rounded-2xl bg-white px-5 py-12 text-center" :role="status === 'error' ? 'alert' : 'status'" aria-live="polite" :aria-busy="status === 'loading'">
    <LoaderCircle v-if="status === 'loading'" class="size-10 animate-spin text-solar-navy" aria-hidden="true" /><CircleAlert v-else class="size-10 text-amber-700" aria-hidden="true" />
    <h2 class="mt-5 text-xl font-bold text-solar-text-heading">{{ status === 'loading' ? 'جارٍ تحميل الإشعارات...' : 'تعذر جلب الإشعارات' }}</h2>
    <p class="mt-3 text-sm leading-7 text-solar-text-muted">{{ status === 'loading' ? 'يرجى الانتظار حتى تكتمل عملية التحميل.' : 'لم نتمكن من تحميل البيانات. أعد المحاولة لعرض الإشعارات.' }}</p>
    <button v-if="status === 'error'" type="button" class="mt-6 rounded-lg bg-solar-navy px-6 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-solar-yellow" @click="$emit('retry')">إعادة المحاولة</button>
  </section>
</template>
