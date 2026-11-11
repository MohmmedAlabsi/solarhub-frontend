import { computed, onMounted, ref } from 'vue'

export interface ReviewItem {
  id: number
  client_name: string
  client_initials: string
  date: string
  rating: number // من 1 إلى 5
  comment: string
}

function getInitials(name: string): string {
  if (!name) return 'ع'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts.slice(0, 2).map(p => p[0]).join('.')
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'مؤخراً'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ar-YE', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function useEngineerReviews() {
  const { $api } = useNuxtApp()

  const allReviews = ref<ReviewItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const pageSize = 5

  async function fetchReviews() {
    isLoading.value = true
    error.value = null

    try {
      const res = await $api<any>('/engineer/ratings')
      const items = res?.data || res
      if (Array.isArray(items)) {
        allReviews.value = items.map((item: any) => ({
          id: item.id,
          client_name: item.customer?.name || 'عميل في منصة SolarHub',
          client_initials: getInitials(item.customer?.name || 'عميل'),
          date: formatDate(item.created_at),
          rating: Number(item.rating) || 5,
          comment: item.comment || 'تقييم بدون تعليق مكتوب.',
        }))
      } else {
        allReviews.value = []
      }
    } catch (err: any) {
      error.value = err?.data?.message || 'تعذر تحميل التقييمات الهندسية'
      allReviews.value = []
    } finally {
      isLoading.value = false
    }
  }

  const totalReviews = computed(() => allReviews.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalReviews.value / pageSize)))

  const paginatedReviews = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return allReviews.value.slice(start, start + pageSize)
  })

  function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  onMounted(() => {
    fetchReviews()
  })

  return {
    reviews: paginatedReviews,
    allReviews,
    isLoading,
    error,
    currentPage,
    totalReviews,
    totalPages,
    pageSize,
    setPage,
    fetchReviews,
  }
}
