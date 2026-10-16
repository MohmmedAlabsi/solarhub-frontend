<script setup lang="ts">
import { CloudUpload, FileText, X } from 'lucide-vue-next'
import { attachmentAccept } from '../../../composables/useServiceRequest'

defineProps<{ files: File[]; error?: string; disabled: boolean }>()
const emit = defineEmits<{ add: [files: File[]]; remove: [index: number] }>()
const dragging = ref(false)
function choose(event: Event) {
  const input = event.target as HTMLInputElement
  emit('add', Array.from(input.files ?? []))
  input.value = ''
}
function drop(event: DragEvent) {
  dragging.value = false
  emit('add', Array.from(event.dataTransfer?.files ?? []))
}
</script>

<template>
  <div>
    <label class="relative flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed min-h-[188px] justify-center px-4 py-7 text-center focus-within:ring-2 focus-within:ring-solar-yellow" :class="[dragging ? 'border-solar-yellow bg-amber-50' : 'border-transparent bg-solar-bg-page', disabled ? 'pointer-events-none opacity-60' : '']" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="drop">
      <input type="file" multiple :accept="attachmentAccept" :disabled="disabled" class="sr-only" aria-label="اختيار المرفقات" :aria-describedby="error ? 'attachment-constraints attachment-error' : 'attachment-constraints'" :aria-invalid="!!error" @change="choose" />
      <span class="mb-2 flex size-14 items-center justify-center rounded-full bg-white shadow-sm"><CloudUpload class="size-6 text-[#856300]" aria-hidden="true" /></span>
      <span class="text-sm font-medium text-solar-text-heading">انقر لاختيار الملفات أو اسحبها هنا</span>
      <span id="attachment-constraints" class="mt-2 max-w-[450px] text-xs leading-[14px] text-solar-text-muted">صور السطح، فاتورة الكهرباء السابقة، أو مخططات أوتوكاد وPDF (الحد الأقصى: 10 ميجابايت لكل ملف).</span>
    </label>
    <ul v-if="files.length" class="mt-3 flex flex-col gap-2" aria-label="المرفقات المختارة">
      <li v-for="(file, index) in files" :key="`${file.name}-${file.size}-${file.lastModified}`" class="flex min-w-0 items-center gap-2 rounded-lg bg-solar-bg-subtle p-3 text-xs">
        <FileText class="size-4 shrink-0" aria-hidden="true" /><span class="min-w-0 flex-1 break-all">{{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</span>
        <button type="button" :disabled="disabled" class="rounded p-1 focus-visible:ring-2 focus-visible:ring-solar-yellow" :aria-label="`إزالة ${file.name}`" @click="emit('remove', index)"><X class="size-4" aria-hidden="true" /></button>
      </li>
    </ul>
    <p v-if="error" id="attachment-error" role="alert" class="mt-2 break-words text-xs text-red-600">{{ error }}</p>
    <p class="mt-2 text-xs leading-[14px] text-solar-text-muted">إرفاق صور السطح ومكان العداد يساعد المهندسين على تقييم زاوية الشمس والظلال بدقة.</p>
  </div>
</template>
