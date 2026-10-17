<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    currentPage: number
    totalPages: number
    totalCount: number
    pageSize?: number
    itemName?: string
    showProgress?: boolean
  }>(),
  {
    pageSize: 8,
    showProgress: true,
    itemName: 'عنصر',
  }
)

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
}>()

const visiblePages = computed(() => {
  const pages: number[] = []
  if (props.totalPages <= 5) {
    for (let i = 1; i <= props.totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (props.currentPage > 3) pages.push(-1) // ellipsis
    const start = Math.max(2, props.currentPage - 1)
    const end = Math.min(props.totalPages - 1, props.currentPage + 1)
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    if (props.currentPage < props.totalPages - 2) pages.push(-2) // ellipsis
    if (!pages.includes(props.totalPages)) pages.push(props.totalPages)
  }
  return pages
})

const startItem = computed(() => Math.min((props.currentPage - 1) * props.pageSize + 1, props.totalCount))
const endItem = computed(() => Math.min(props.currentPage * props.pageSize, props.totalCount))
const progressPercentage = computed(() => Math.min(100, Math.round((props.currentPage / Math.max(1, props.totalPages)) * 100)))

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 pt-4 border-t border-solar-border-card/60">
    <!-- شريط تقدم التصفح الدقيق كما في الموكاب -->
    <div v-if="showProgress" class="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        class="h-full rounded-full bg-solar-navy transition-all duration-300"
        :style="{ width: `${progressPercentage}%` }"
      />
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-solar-text-muted">
      <!-- أزرار التنقل بين الصفحات -->
      <nav class="flex items-center gap-1.5" aria-label="ترقيم الصفحات">
        <button
          type="button"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card bg-white text-solar-text-body transition-colors hover:bg-solar-bg-subtle disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight class="size-4" />
        </button>

        <template v-for="(p, index) in visiblePages" :key="index">
          <span v-if="p < 0" class="px-1 text-slate-400">...</span>
          <button
            v-else
            type="button"
            @click="goToPage(p)"
            class="flex size-8 items-center justify-center rounded-lg border text-xs font-bold transition-all"
            :class="[
              p === currentPage
                ? 'border-solar-navy-dark bg-solar-navy-dark text-white shadow-xs'
                : 'border-solar-border-card bg-white text-solar-text-body hover:bg-solar-bg-subtle hover:border-solar-yellow'
            ]"
            :aria-current="p === currentPage ? 'page' : undefined"
          >
            {{ p }}
          </button>
        </template>

        <button
          type="button"
          :disabled="currentPage >= Math.max(1, totalPages)"
          @click="goToPage(currentPage + 1)"
          class="flex size-8 items-center justify-center rounded-lg border border-solar-border-card bg-white text-solar-text-body transition-colors hover:bg-solar-bg-subtle disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="الصفحة التالية"
        >
          <ChevronLeft class="size-4" />
        </button>
      </nav>

      <!-- نص إحصائية العرض -->
      <p class="font-medium text-solar-text-body">
        عرض <span class="font-bold text-solar-text-heading">{{ endItem }} - {{ startItem }}</span> من أصل <span class="font-bold text-solar-text-heading">{{ totalCount }}</span> {{ itemName }}
      </p>
    </div>
  </div>
</template>
