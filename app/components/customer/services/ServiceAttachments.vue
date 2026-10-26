<script setup lang="ts">
import { useId } from 'vue'

import {
  CloudUpload,
  FileImage,
  FileText,
  X,
} from 'lucide-vue-next'

import {
  customerServiceAttachmentAccept,
} from '~/composables/useCustomerServiceRequest'

const props = withDefaults(
  defineProps<{
    files: File[]
    error?: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  add: [files: File[]]
  remove: [index: number]
}>()

const dragging = ref(false)

const elementId = useId()
const constraintsId = `${elementId}-constraints`
const errorId = `${elementId}-error`

function choose(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])

  // يسمح باختيار الملف نفسه مرة أخرى بعد إزالته.
  input.value = ''

  if (props.disabled || !files.length) return

  emit('add', files)
}

function handleDragOver(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = props.disabled
      ? 'none'
      : 'copy'
  }

  dragging.value = !props.disabled
}

function handleDragLeave(event: DragEvent) {
  const container = event.currentTarget as HTMLElement
  const nextTarget = event.relatedTarget

  if (
    nextTarget instanceof Node &&
    container.contains(nextTarget)
  ) {
    return
  }

  dragging.value = false
}

function handleDrop(event: DragEvent) {
  dragging.value = false

  if (props.disabled) return

  const files = Array.from(
    event.dataTransfer?.files || [],
  )

  if (files.length) {
    emit('add', files)
  }
}

function removeFile(index: number) {
  if (props.disabled) return

  emit('remove', index)
}

function formatFileSize(size: number): string {
  if (!size) return '0 بايت'

  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

watch(
  () => props.disabled,
  disabled => {
    if (disabled) {
      dragging.value = false
    }
  },
)
</script>

<template>
  <div class="min-w-0">
    <!-- اختيار الملف أو سحبه -->
    <label
      class="relative flex min-h-[188px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition focus-within:ring-2 focus-within:ring-solar-yellow"
      :class="[
        dragging
          ? 'border-solar-yellow bg-amber-50'
          : 'border-solar-border-card bg-solar-bg-page',

        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer',
      ]"
      :aria-disabled="disabled"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        type="file"
        :accept="customerServiceAttachmentAccept"
        :disabled="disabled"
        class="sr-only"
        aria-label="اختيار ملف مرفق للطلب"
        :aria-describedby="
          error
            ? `${constraintsId} ${errorId}`
            : constraintsId
        "
        :aria-invalid="Boolean(error)"
        @change="choose"
      />

      <span
        class="mb-2 flex size-14 items-center justify-center rounded-full bg-white shadow-sm"
      >
        <CloudUpload
          class="size-6 text-amber-700"
          aria-hidden="true"
        />
      </span>

      <span
        class="text-sm font-medium text-solar-text-heading"
      >
        انقر لاختيار ملف أو اسحبه هنا
      </span>

      <span
        :id="constraintsId"
        class="mt-2 max-w-[450px] text-xs leading-6 text-solar-text-muted"
      >
        ملف واحد بصيغة PDF أو JPG أو JPEG أو PNG أو WEBP،
        بحد أقصى 10 ميجابايت.
      </span>
    </label>

    <!-- الملف المختار -->
    <ul
      v-if="files.length"
      class="mt-3 flex flex-col gap-2"
      aria-label="المرفق المختار"
    >
      <li
        v-for="(file, index) in files"
        :key="`${file.name}-${file.size}-${file.lastModified}`"
        class="flex min-w-0 items-center gap-3 rounded-lg border border-solar-border-card bg-solar-bg-subtle p-3 text-xs"
      >
        <FileImage
          v-if="file.type.startsWith('image/')"
          class="size-5 shrink-0 text-solar-navy"
          aria-hidden="true"
        />

        <FileText
          v-else
          class="size-5 shrink-0 text-solar-navy"
          aria-hidden="true"
        />

        <div class="min-w-0 flex-1">
          <p
            class="break-all font-semibold text-solar-text-heading"
          >
            {{ file.name }}
          </p>

          <p
            class="mt-1 text-solar-text-muted"
            dir="ltr"
          >
            {{ formatFileSize(file.size) }}
          </p>
        </div>

        <button
          type="button"
          :disabled="disabled"
          class="shrink-0 rounded-lg p-2 text-solar-text-muted transition hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-solar-yellow disabled:cursor-not-allowed disabled:opacity-50"
          :aria-label="`إزالة المرفق ${file.name}`"
          @click="removeFile(index)"
        >
          <X class="size-4" aria-hidden="true" />
        </button>
      </li>
    </ul>

    <!-- خطأ المرفق -->
    <p
      v-if="error"
      :id="errorId"
      class="mt-2 break-words text-xs leading-6 text-red-600"
      role="alert"
    >
      {{ error }}
    </p>

    <p
      class="mt-2 text-xs leading-6 text-solar-text-muted"
    >
      يُرفع الملف عند نشر الطلب. إرفاق صورة الموقع أو
      مخطط المشروع يساعد المهندسين على تقييم احتياجك.
    </p>
  </div>
</template>