<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
import type { AdminDocument } from '../../../../types/admin'
defineProps<{document:AdminDocument}>()
const {notify}=useAdminNotice()
</script>
<template>
  <a v-if="document.url" :href="document.url" target="_blank" rel="noopener noreferrer" class="inline-flex max-w-full items-center gap-2 rounded-md border border-solar-border-card bg-white px-3 py-2 text-xs font-semibold text-solar-navy"><FileText class="size-4 shrink-0 text-red-500" /><span class="min-w-0 break-all">{{ document.name }}</span></a>
  <button v-else type="button" class="inline-flex max-w-full items-center gap-2 rounded-md border border-solar-border-card bg-white px-3 py-2 text-right text-xs text-solar-navy focus-visible:ring-2 focus-visible:ring-solar-yellow" @click="notify('المرفق تجريبي؛ لا يتوفر ملف فعلي للعرض أو التنزيل.')"><FileText class="size-4 shrink-0 text-red-500" /><span class="min-w-0 break-words">{{ document.name }}<span class="mt-1 block text-[10px] text-solar-text-muted">{{ document.size }} · غير متوفر للعرض</span></span></button>
</template>
