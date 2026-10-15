<script setup lang="ts">
import { FileText, UploadCloud, X, CheckCircle2 } from 'lucide-vue-next'

interface Props {
  label: string
  placeholder: string
  accept?: string
  required?: boolean
  maxSizeMb?: number
  modelValue?: File | null
}

const props = withDefaults(defineProps<Props>(), {
  accept: '.pdf,.png,.jpg,.jpeg',
  required: false,
  maxSizeMb: 5,
  modelValue: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', file: File | null): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const errorMsg = ref('')

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  errorMsg.value = ''

  if (!file) {
    emit('update:modelValue', null)
    fileName.value = ''
    return
  }

  // Check file size
  const maxBytes = props.maxSizeMb * 1024 * 1024
  if (file.size > maxBytes) {
    errorMsg.value = `حجم الملف يتجاوز الحد الأقصى (${props.maxSizeMb} ميجابايت)`
    target.value = ''
    return
  }

  fileName.value = file.name
  emit('update:modelValue', file)
}

function removeFile() {
  fileName.value = ''
  errorMsg.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full text-right">
    <div class="flex items-center justify-between">
      <label class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
        <span>{{ label }}</span>
        <span v-if="required" class="text-rose-500">*</span>
      </label>
    </div>

    <!-- حقل الإرفاق المطابق للتصميم تماماً مع زر استعراض على اليسار وأيقونة على اليمين -->
    <div
      class="group relative flex h-12 w-full items-center justify-between rounded-xl border border-solar-border-card/80 bg-white px-3 transition-all hover:border-solar-navy/60 focus-within:border-solar-yellow focus-within:ring-2 focus-within:ring-solar-yellow/20"
      :class="{ 'border-rose-400 ring-1 ring-rose-200': errorMsg }"
    >
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        class="hidden"
        @change="handleFileChange"
      />

      <!-- الجانب الأيمن: الأيقونة مع اسم الملف أو النص الإرشادي -->
      <div class="flex items-center gap-2.5 overflow-hidden flex-1 cursor-pointer" @click="triggerFileSelect">
        <FileText class="size-4.5 text-amber-500 shrink-0" />
        <span
          v-if="fileName"
          class="text-xs font-bold text-solar-navy-dark truncate flex items-center gap-1"
        >
          <CheckCircle2 class="size-3.5 text-emerald-600 shrink-0" />
          <span class="truncate">{{ fileName }}</span>
        </span>
        <span v-else class="text-xs text-solar-text-muted truncate select-none">
          {{ placeholder }}
        </span>
      </div>

      <!-- الجانب الأيسر: زر استعراض أو زر الحذف إذا تم اختيار ملف -->
      <div class="flex items-center gap-1 shrink-0">
        <button
          v-if="fileName"
          type="button"
          @click.stop="removeFile"
          class="flex size-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
          title="إلغاء الملف"
        >
          <X class="size-4" />
        </button>

        <button
          type="button"
          @click="triggerFileSelect"
          class="rounded-lg bg-solar-bg-subtle px-3 py-1.5 text-xs font-bold text-solar-navy hover:bg-solar-navy hover:text-white transition-all border border-solar-border-card/60 shadow-xs"
        >
          استعراض
        </button>
      </div>
    </div>

    <span v-if="errorMsg" class="text-[11px] font-semibold text-rose-500">
      {{ errorMsg }}
    </span>
  </div>
</template>
