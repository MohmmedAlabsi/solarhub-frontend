<script setup lang="ts">
import { FileText, Image as ImageIcon, X, CheckCircle2, AlertCircle, UploadCloud } from 'lucide-vue-next'

interface Props {
  label: string
  placeholder?: string
  accept?: string
  required?: boolean
  maxSizeMb?: number
  modelValue?: File | null
  hint?: string
  pdfOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'اضغط هنا لاختيار ملف PDF أو صورة، أو اسحب الملف إلى هنا',
  accept: '.pdf,application/pdf,image/*,.png,.jpg,.jpeg,.webp',
  required: false,
  maxSizeMb: 10,
  modelValue: null,
  hint: 'الملفات المقبولة: وثائق PDF أو صور (JPG, PNG) بحد أقصى 10 ميجابايت',
  pdfOnly: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', file: File | null): void
}>()

const isStrictlyPdf = computed(() => {
  return props.pdfOnly || (!props.accept.includes('image') && props.accept.includes('pdf'))
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const fileSizeText = ref('')
const fileType = ref<'pdf' | 'image' | 'other' | null>(null)
const errorMsg = ref('')
const isDragging = ref(false)

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      fileName.value = ''
      fileSizeText.value = ''
      fileType.value = null
      if (fileInputRef.value) fileInputRef.value.value = ''
    } else {
      updateFileInfo(newVal)
    }
  },
  { immediate: true }
)

function updateFileInfo(file: File) {
  fileName.value = file.name
  const sizeMb = file.size / (1024 * 1024)
  if (sizeMb >= 1) {
    fileSizeText.value = `${sizeMb.toFixed(1)} MB`
  } else {
    fileSizeText.value = `${Math.round(file.size / 1024)} KB`
  }

  const nameLower = file.name.toLowerCase()
  if (file.type === 'application/pdf' || nameLower.endsWith('.pdf')) {
    fileType.value = 'pdf'
  } else if (file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(nameLower)) {
    fileType.value = 'image'
  } else {
    fileType.value = 'other'
  }
}

function validateAndSetFile(file: File | null) {
  errorMsg.value = ''

  if (!file) {
    emit('update:modelValue', null)
    return
  }

  // Check file size
  const maxBytes = props.maxSizeMb * 1024 * 1024
  if (file.size > maxBytes) {
    errorMsg.value = `حجم الملف يتجاوز الحد المسموح (${props.maxSizeMb} ميجابايت). يرجى اختيار ملف أصغر.`
    return
  }

  // Check extension / type
  const nameLower = file.name.toLowerCase()
  const isPdf = file.type === 'application/pdf' || nameLower.endsWith('.pdf')
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(nameLower)

  if (isStrictlyPdf.value) {
    if (!isPdf) {
      errorMsg.value = 'عذراً، يجب أن يكون الملف بصيغة PDF فقط (لا يُسمح بالصور أو الصيغ الأخرى).'
      return
    }
  } else if (!isPdf && !isImage) {
    errorMsg.value = 'نوع الملف غير مدعوم. يرجى رفع ملف بصيغة PDF أو صورة واضحة (PNG, JPG, WEBP).'
    return
  }

  updateFileInfo(file)
  emit('update:modelValue', file)
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  validateAndSetFile(file)
}

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function removeFile() {
  fileName.value = ''
  fileSizeText.value = ''
  fileType.value = null
  errorMsg.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  emit('update:modelValue', null)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const droppedFile = e.dataTransfer?.files?.[0] || null
  validateAndSetFile(droppedFile)
}
</script>

<template>
  <div class="flex flex-col gap-2 w-full text-right">
    <!-- التسمية وشارات الصيغ المقبولة -->
    <div class="flex items-center justify-between flex-wrap gap-1">
      <label class="text-xs font-bold text-solar-text-heading flex items-center gap-1">
        <span>{{ label }}</span>
        <span v-if="required" class="text-rose-500">*</span>
      </label>

      <!-- شارات الصيغ المقبولة بوضوح تام حسب النوع -->
      <div class="flex items-center gap-1.5 text-[10px] font-bold">
        <span class="rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2 py-0.5 border border-rose-500/30">
          {{ isStrictlyPdf ? 'ملف PDF فقط' : 'مستند PDF' }}
        </span>
        <span v-if="!isStrictlyPdf" class="rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 px-2 py-0.5 border border-sky-500/30">
          صورة JPG / PNG / WEBP
        </span>
      </div>
    </div>

    <!-- صندوق الرفع التفاعلي المتوافق مع الوضعين -->
    <div
      class="group relative flex flex-col rounded-2xl border-2 transition-all cursor-pointer p-3.5 bg-solar-bg-card dark:bg-solar-bg-subtle/50 shadow-xs"
      :class="[
        errorMsg
          ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20'
          : isDragging
            ? 'border-solar-yellow bg-amber-50/40 dark:bg-amber-950/20 border-dashed scale-[1.01]'
            : fileName
              ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20'
              : 'border-dashed border-solar-border-card hover:border-solar-yellow hover:bg-solar-bg-subtle'
      ]"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="triggerFileSelect"
    >
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        class="hidden"
        @change="handleFileChange"
      />

      <!-- الحالة 1: تم اختيار ملف بنجاح (عرض البطاقة الواضحة بنوع الملف) -->
      <div v-if="fileName" class="flex items-center justify-between gap-3" @click.stop>
        <div class="flex items-center gap-3 overflow-hidden flex-1">
          <!-- أيقونة نوع الملف المختار -->
          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-xl font-black text-xs shadow-xs"
            :class="[
              fileType === 'pdf'
                ? 'bg-rose-600 text-white'
                : 'bg-sky-600 text-white'
            ]"
          >
            <span v-if="fileType === 'pdf'">PDF</span>
            <ImageIcon v-else class="size-6" />
          </div>

          <!-- تفاصيل الملف -->
          <div class="flex flex-col overflow-hidden text-right">
            <div class="flex items-center gap-1.5">
              <CheckCircle2 class="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span class="text-xs font-bold text-solar-text-heading truncate" dir="ltr">
                {{ fileName }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-0.5 text-[11px] text-solar-text-muted font-medium">
              <span class="font-mono">{{ fileSizeText }}</span>
              <span>•</span>
              <span :class="fileType === 'pdf' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-sky-600 dark:text-sky-400 font-bold'">
                {{ fileType === 'pdf' ? 'مستند PDF معتمد' : 'صورة معتمدة' }}
              </span>
            </div>
          </div>
        </div>

        <!-- أزرار الإجراءات (تغيير أو حذف) -->
        <div class="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            @click.stop="triggerFileSelect"
            class="rounded-lg bg-solar-bg-subtle hover:bg-solar-yellow hover:text-solar-navy-dark px-2.5 py-1.5 text-xs font-bold text-solar-text-heading transition-colors border border-solar-border-card cursor-pointer"
          >
            تغيير
          </button>
          <button
            type="button"
            @click.stop="removeFile"
            class="flex size-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            title="إلغاء الملف"
          >
            <X class="size-4.5" />
          </button>
        </div>
      </div>

      <!-- الحالة 2: لم يتم اختيار ملف بعد (واجهة واضحة وجذابة) -->
      <div v-else class="flex items-center gap-3.5 select-none py-1">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-solar-bg-subtle text-solar-navy dark:text-solar-yellow group-hover:bg-solar-yellow group-hover:text-solar-navy-dark transition-colors">
          <UploadCloud class="size-6" />
        </div>

        <div class="flex flex-col flex-1 text-right overflow-hidden">
          <p class="text-xs font-bold text-solar-text-heading group-hover:text-solar-yellow transition-colors truncate">
            {{ isDragging ? 'أفلت الملف هنا الآن...' : placeholder }}
          </p>
          <p class="text-[11px] text-solar-text-muted mt-0.5">
            {{ hint }}
          </p>
        </div>

        <button
          type="button"
          @click.stop="triggerFileSelect"
          class="shrink-0 rounded-xl bg-solar-navy-dark dark:bg-solar-yellow hover:opacity-90 px-3.5 py-2 text-xs font-bold text-white dark:text-solar-navy-dark shadow-xs transition-colors cursor-pointer"
        >
          استعراض
        </button>
      </div>
    </div>

    <!-- رسالة الخطأ إن وجدت -->
    <div v-if="errorMsg" class="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 animate-in fade-in">
      <AlertCircle class="size-4 shrink-0 text-rose-500" />
      <span>{{ errorMsg }}</span>
    </div>
  </div>
</template>
