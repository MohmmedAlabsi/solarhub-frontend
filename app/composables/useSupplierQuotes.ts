import { ref, computed, onMounted } from 'vue'
import type {
  SupplierQuoteItem,
  RespondQuoteInput,
  SupplierQuoteStatus,
} from '~/types/supplier-quote'

export function resolveQuoteProductImage(rawImage: string | null | undefined, category = '', title = ''): string {
  if (rawImage) {
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      return rawImage
    }
    return `https://rtjrjsgabinwdbrtxakk.supabase.co/storage/v1/object/public/public-media/${rawImage.replace(/^\/+/, '')}`
  }

  const catLower = category.toLowerCase()
  const titleLower = title.toLowerCase()

  if (catLower.includes('لوح') || titleLower.includes('لوح') || titleLower.includes('panel')) return '/images/product-panel.png'
  if (catLower.includes('إنفرتر') || titleLower.includes('انفرتر') || titleLower.includes('inverter')) return '/images/product-inverter.png'
  if (catLower.includes('بطارية') || titleLower.includes('بطارية') || titleLower.includes('battery')) return '/images/product-battery.png'
  if (catLower.includes('منظومة') || titleLower.includes('kit')) return '/images/product-kit.png'

  return '/images/hero-solar.png'
}

export function useSupplierQuotes() {
  const { $api } = useNuxtApp()

  const quotes = ref<SupplierQuoteItem[]>([])
  const isLoading = ref(false)
  const isResponding = ref(false)
  const errorMessage = ref('')
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  // الفلاتر
  const searchQuery = ref('')
  const selectedStatus = ref<string>('all')

  // الترقيم
  const currentPage = ref(1)
  const perPage = ref(8)

  function showNotice(msg: string) {
    noticeMessage.value = msg
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      noticeMessage.value = ''
    }, 4000)
  }

  function formatArabicDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '–'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('ar-YE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  function mapApiQuote(raw: any): SupplierQuoteItem {
    const sp = raw.store_product || raw.storeProduct || {}
    const client = raw.customer || raw.user || {}
    const category = sp.category || ''
    const title = sp.title || 'منتج طاقة شمسية'
    const code = sp.sku || sp.model_number || `SKU-${sp.id || raw.id}`

    return {
      id: raw.id,
      quoteRequestNumber: raw.quote_number || `#RFQ-${String(raw.id).padStart(4, '0')}`,
      customer: {
        id: client.id || 0,
        name: client.name || 'عميل مسجل',
        phone: client.phone || '–',
        email: client.email || '–',
      },
      product: {
        id: sp.id || 0,
        title,
        model_number: sp.model_number || '',
        sku: sp.sku || '',
        brand: sp.brand || '',
        category,
        image: sp.image || null,
        warranty_period: sp.warranty_period || '–',
        governorate: sp.governorate || '–',
        listed_price: sp.listed_price !== undefined ? Number(sp.listed_price) : null,
      },
      productTitle: title,
      productCode: code,
      productBrand: sp.brand || 'SolarHub',
      productCategory: category,
      productImage: resolveQuoteProductImage(sp.image, category, title),
      requestedQuantity: Number(raw.quantity) || 1,
      unitLabel: 'قطعة',
      governorate: sp.governorate || '–',
      customerTargetPrice: raw.customer_target_price !== null && raw.customer_target_price !== undefined ? Number(raw.customer_target_price) : null,
      offeredUnitPrice: raw.offered_unit_price !== null && raw.offered_unit_price !== undefined ? Number(raw.offered_unit_price) : null,
      totalPrice: raw.total_price !== null && raw.total_price !== undefined ? Number(raw.total_price) : null,
      status: (raw.status as SupplierQuoteStatus) || 'pending',
      customerNotes: raw.customer_notes || 'لا توجد ملاحظات إضافية من العميل.',
      storeNotes: raw.store_notes || null,
      requestDate: formatArabicDate(raw.created_at),
      respondedAt: raw.responded_at ? formatArabicDate(raw.responded_at) : null,
      acceptedAt: raw.accepted_at ? formatArabicDate(raw.accepted_at) : null,
      rawCreatedAt: raw.created_at || '',
    }
  }

  async function fetchQuotes() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await $api<any>('/my/store-quote-requests')
      const raw = res?.data || res
      if (Array.isArray(raw)) {
        quotes.value = raw.map(mapApiQuote)
      } else {
        quotes.value = []
      }
    } catch (err: any) {
      console.error('Failed to load store quote requests:', err)
      quotes.value = []
      errorMessage.value = err?.data?.message || 'تعذر الاتصال بالخادم لجلب طلبات عروض الأسعار.'
    } finally {
      isLoading.value = false
    }
  }

  const filteredQuotes = computed(() => {
    let result = quotes.value

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter(
        item =>
          item.quoteRequestNumber.toLowerCase().includes(q) ||
          item.productTitle.toLowerCase().includes(q) ||
          item.productCode.toLowerCase().includes(q) ||
          item.customer.name.toLowerCase().includes(q) ||
          (item.customer.phone && item.customer.phone.includes(q))
      )
    }

    if (selectedStatus.value !== 'all') {
      result = result.filter(item => item.status === selectedStatus.value)
    }

    return result
  })

  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredQuotes.value.length / perPage.value))
  })

  const paginatedQuotes = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredQuotes.value.slice(start, start + perPage.value)
  })

  function changePage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  async function respondToQuote(input: RespondQuoteInput): Promise<boolean> {
    isResponding.value = true
    try {
      const res = await $api<any>(`/quote-requests/${input.quoteId}/respond`, {
        method: 'PATCH',
        body: {
          offered_unit_price: input.offeredUnitPrice,
          store_notes: input.storeNotes || null,
        },
      })

      const target = quotes.value.find(q => q.id === input.quoteId)
      if (target) {
        target.status = 'responded'
        target.offeredUnitPrice = input.offeredUnitPrice
        target.totalPrice = Math.round(input.offeredUnitPrice * target.requestedQuantity * 100) / 100
        target.storeNotes = input.storeNotes || null
        target.respondedAt = 'اليوم'
      }

      showNotice('تم إرسال عرض السعر للعميل بنجاح.')
      return true
    } catch (err: any) {
      console.error('Failed to respond to quote request:', err)
      const msg = err?.data?.message || 'حدث خطأ أثناء إرسال عرض السعر. يرجى المحاولة لاحقاً.'
      showNotice(msg)
      return false
    } finally {
      isResponding.value = false
    }
  }

  function exportQuotes() {
    if (quotes.value.length === 0) {
      showNotice('لا توجد بيانات متاحة للتصدير.')
      return
    }

    const headers = ['رقم الطلب', 'المنتج', 'الكود', 'العميل', 'رقم الهاتف', 'الكمية', 'سعر العميل المستهدف', 'السعر المعروض', 'الإجمالي', 'الحالة', 'تاريخ الطلب']
    const rows = quotes.value.map(q => [
      `"${q.quoteRequestNumber}"`,
      `"${q.productTitle.replace(/"/g, '""')}"`,
      `"${q.productCode}"`,
      `"${q.customer.name}"`,
      `"${q.customer.phone || '–'}"`,
      q.requestedQuantity,
      q.customerTargetPrice !== null ? q.customerTargetPrice : '–',
      q.offeredUnitPrice !== null ? q.offeredUnitPrice : '–',
      q.totalPrice !== null ? q.totalPrice : '–',
      `"${q.status}"`,
      `"${q.requestDate}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `طلبات_عروض_الأسعار_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showNotice('تم تصدير كشف طلبات عروض الأسعار بنجاح.')
  }

  onMounted(() => {
    fetchQuotes()
  })

  return {
    quotes,
    isLoading,
    isResponding,
    errorMessage,
    noticeMessage,
    searchQuery,
    selectedStatus,
    currentPage,
    totalPages,
    perPage,
    filteredQuotes,
    paginatedQuotes,
    fetchQuotes,
    changePage,
    respondToQuote,
    exportQuotes,
  }
}
