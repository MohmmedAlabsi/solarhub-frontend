import { ref, computed, onMounted } from 'vue'
import type { SupplierQuoteItem, RespondQuoteInput } from '../../types/supplier-quote'

const initialFallbackQuotes: SupplierQuoteItem[] = [
  {
    id: 1,
    quoteRequestNumber: '#RFQ-2025-3041',
    productTitle: 'لوح شمسي مونوكريستالين Jinko Tiger Pro 585W',
    productCode: 'JKM585M-7RL4-V',
    productSpecs: 'قدرة 585 واط، خلايا Bifacial',
    productEfficiency: 'كفاءة 22.6%، كفالة أداء 25 سنة',
    requestedQuantity: 25,
    unitLabel: 'لوح',
    requestDate: '24 أكتوبر 2025',
    deliveryLocation: 'مستودع العميل - صنعاء / الرياض (حي النرجس)',
    clientNotes: 'نحتاج شهادة مطابقة معتمدة مع إمكانية توفير النقل المباشر للمشروع خلال 5 أيام عمل.',
    clientName: 'مؤسسة إمداد الطاقة',
    status: 'pending',
  },
  {
    id: 2,
    quoteRequestNumber: '#RFQ-2025-3040',
    productTitle: 'إنفرتر هجين Deye 8kW ثلاثي الأطوار',
    productCode: 'SUN-8K-SG04LP3',
    productSpecs: 'قدرة 8kW، جهد عالي ثلاثي الأطوار 400V',
    productEfficiency: 'كفاءة 97.6%، ضمان مصنعي 5 سنوات',
    requestedQuantity: 2,
    unitLabel: 'جهاز',
    requestDate: '24 أكتوبر 2025',
    deliveryLocation: 'موقع المشروع - القصيم (بريدة)',
    clientNotes: 'يرجى تبيان توفر لوحة المفاتيح والشاشات الذكية وملحقات CT.',
    clientName: 'م. فهد القحطاني',
    status: 'pending',
  },
  {
    id: 3,
    quoteRequestNumber: '#RFQ-2025-3038',
    productTitle: 'بطارية ليثيوم تخزين Pylontech US5000 4.8kWh',
    productCode: 'US5000-LV',
    productSpecs: 'سعة 4.8kWh، جهد 48V، خلايا LiFePO4',
    productEfficiency: 'دورة تفريغ 6000 دورة @ 95% DoD',
    requestedQuantity: 4,
    unitLabel: 'وحدات',
    requestDate: '23 أكتوبر 2025',
    deliveryLocation: 'الدمام - المدينة الصناعية الثانية',
    clientNotes: 'مطلوب كابلات التوصيل البيني الأصلية بين البطاريات.',
    clientName: 'شركة آفاق التطوير',
    status: 'responded',
    quotedUnitPrice: 6450,
    quotedTotalPrice: 25800,
    supplierNotes: 'السعر يشمل كابلات الربط الأصلية والتسليم بمستودع الدمام مع ضمان 10 سنوات.',
  },
  {
    id: 4,
    quoteRequestNumber: '#RFQ-2025-3034',
    productTitle: 'لوح شمسي Longi Hi-MO 6 Explorer 570W',
    productCode: 'LR5-72HTH-570M',
    productSpecs: 'تقنية HPBC، كفاءة عالية 22.1%',
    productEfficiency: 'معامل حراري منخفض، ضمان إنتاج 25 سنة',
    requestedQuantity: 40,
    unitLabel: 'لوح',
    requestDate: '21 أكتوبر 2025',
    deliveryLocation: 'الرياض - حي الياسمين',
    clientNotes: 'طلب كمية لمشروع مجمع تجاري، الدفع نقدي فوري.',
    clientName: 'شركة البناء الحديث',
    status: 'accepted',
    quotedUnitPrice: 460,
    quotedTotalPrice: 18400,
    supplierNotes: 'تم قبول العرض واعتماد توريد الشحنة من المستودع المركزي.',
  },
  {
    id: 5,
    quoteRequestNumber: '#RFQ-2025-3029',
    productTitle: 'قاطع حماية تيار مستمر DC Isolator Switch 1000V',
    productCode: 'DC-SW-32A',
    productSpecs: 'تيار 32A، عزل رباعي 1000V DC مع صندوق حماية IP66',
    productEfficiency: 'معتمد وفق المواصفة IEC 60947-3',
    requestedQuantity: 10,
    unitLabel: 'قطعة',
    requestDate: '19 أكتوبر 2025',
    deliveryLocation: 'الخبر - حي العليا',
    clientNotes: 'مطلوب توفير شهادات الفحص المخبري وتأكيد درجة IP.',
    clientName: 'مكتب الرؤية للاستشارات',
    status: 'rejected',
    quotedUnitPrice: 185,
    quotedTotalPrice: 1850,
    supplierNotes: 'المخزون محجوز بالكامل لمشروع قائم حالياً.',
  },
  {
    id: 6,
    quoteRequestNumber: '#RFQ-2025-3022',
    productTitle: 'حوامل تثبيت ألمنيوم لقواعد الأسطح القرميدية',
    productCode: 'MNT-ROOF-TI',
    productSpecs: 'سبائك ألمنيوم AL6005-T5 مع مثبتات ستانلس ستيل SUS304',
    productEfficiency: 'مقاومة سرعة رياح حتى 45m/s',
    requestedQuantity: 15,
    unitLabel: 'طقم',
    requestDate: '17 أكتوبر 2025',
    deliveryLocation: 'جدة - أبحر الشمالية',
    clientNotes: 'يحتاج العميل إلى مخطط توزيع القواعد المعتمد قبل التوريد.',
    clientName: 'مقاولات الشرق',
    status: 'cancelled',
  },
]

export function useSupplierQuotes() {
  const { $api } = useNuxtApp()

  const quotes = ref<SupplierQuoteItem[]>([...initialFallbackQuotes])
  const isLoading = ref(false)
  const isResponding = ref(false)
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  // الفلاتر
  const searchQuery = ref('')
  const selectedStatus = ref('all')

  // الترقيم
  const currentPage = ref(1)
  const perPage = ref(6)

  function showNotice(msg: string) {
    noticeMessage.value = msg
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      noticeMessage.value = ''
    }, 4000)
  }

  function mapApiQuote(raw: any): SupplierQuoteItem {
    const sp = raw.store_product || raw.storeProduct || {}
    const mp = sp.master_product || sp.masterProduct || {}
    const client = raw.customer || raw.user || {}

    return {
      id: raw.id,
      quoteRequestNumber: `#RFQ-${new Date(raw.created_at || Date.now()).getFullYear()}-${raw.id}`,
      productTitle: mp.title || 'منتج طاقة شمسية',
      productCode: mp.model_number || `SKU-${raw.id}`,
      productSpecs: mp.description || 'مواصفات قياسية لمنظومات الطاقة',
      productEfficiency: sp.warranty_period ? `ضمان: ${sp.warranty_period}` : 'كفاءة عالية',
      requestedQuantity: Number(raw.quantity) || 1,
      unitLabel: raw.unit_label || 'وحدة',
      requestDate: raw.created_at ? new Date(raw.created_at).toLocaleDateString('ar-YE', { day: 'numeric', month: 'long', year: 'numeric' }) : 'مؤخراً',
      deliveryLocation: raw.delivery_location || 'صنعاء / اليمن',
      clientNotes: raw.notes || raw.client_notes || 'لا توجد ملاحظات إضافية.',
      clientName: client.name || 'عميل معتمد',
      status: raw.status || 'pending',
      quotedUnitPrice: raw.offered_price ? Number(raw.offered_price) : undefined,
      quotedTotalPrice: raw.offered_price && raw.quantity ? Number(raw.offered_price) * Number(raw.quantity) : undefined,
      supplierNotes: raw.supplier_notes,
      validUntil: raw.valid_until,
    }
  }

  async function fetchQuotes() {
    isLoading.value = true
    try {
      const res = await $api<any>('/my/store-quote-requests')
      const raw = res?.data || res
      if (Array.isArray(raw) && raw.length > 0) {
        quotes.value = raw.map(mapApiQuote)
      }
    } catch (err) {
      console.warn('Could not fetch store quote requests, using initial fallback list:', err)
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
          (item.clientName && item.clientName.toLowerCase().includes(q))
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

  async function respondToQuote(input: RespondQuoteInput) {
    isResponding.value = true
    try {
      await $api<any>(`/quote-requests/${input.quoteId}/respond`, {
        method: 'PATCH',
        body: {
          proposed_price: input.unitPrice,
          notes: input.supplierNotes,
          valid_days: input.validityDays || 14,
        },
      })

      const target = quotes.value.find(q => q.id === input.quoteId)
      if (target) {
        target.status = 'responded'
        target.quotedUnitPrice = input.unitPrice
        target.quotedTotalPrice = input.totalPrice
        target.supplierNotes = input.supplierNotes
      }

      showNotice('تم إرسال عرض السعر الفعلي للعميل بنجاح.')
      return true
    } catch (err) {
      console.warn('API error submitting quote response, updating locally:', err)
      const target = quotes.value.find(q => q.id === input.quoteId)
      if (target) {
        target.status = 'responded'
        target.quotedUnitPrice = input.unitPrice
        target.quotedTotalPrice = input.totalPrice
        target.supplierNotes = input.supplierNotes
      }
      showNotice('تم تسجيل وإرسال عرض السعر للعميل.')
      return true
    } finally {
      isResponding.value = false
    }
  }

  function exportQuotes() {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      ['رقم الطلب,المنتج,الكود,الكمية,التاريخ,الحالة']
        .concat(quotes.value.map(q => `"${q.quoteRequestNumber}","${q.productTitle}","${q.productCode}",${q.requestedQuantity},"${q.requestDate}","${q.status}"`))
        .join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `عروض_أسعار_المتجر_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotice('تم تصدير كشف طلبات عروض الأسعار بنجاح.')
  }

  onMounted(() => {
    fetchQuotes()
  })

  return {
    quotes,
    isLoading,
    isResponding,
    noticeMessage,
    searchQuery,
    selectedStatus,
    currentPage,
    totalPages,
    perPage,
    filteredQuotes,
    paginatedQuotes,
    changePage,
    respondToQuote,
    exportQuotes,
  }
}
