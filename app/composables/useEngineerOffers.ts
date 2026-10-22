// بيانات تجريبية لعروض المهندس المقدمة
// TODO: استبدل بـ useFetch('/api/engineer/offers')

export type OfferStatus = 'pending_review' | 'approved' | 'rejected'

export interface EngineerOffer {
  id: string               // OF-2025-089
  requestId: string        // SR-2025-1042
  requestTitle: string     // دراسة جدوى وتصميم محطة On-Grid
  totalCost: number        // 4500
  durationDays: number     // 7
  submittedAt: string      // تاريخ تقديم العرض
  status: OfferStatus
  // تفاصيل العرض (تُعرض في المودال)
  methodology: string      // العرض الفني ومنهجية العمل
  methodologyPoints?: string[] // قائمة النقاط
  attachmentName?: string
  attachmentSize?: string
}

const mockOffers: EngineerOffer[] = [
  {
    id: 'OF-2025-089',
    requestId: 'SR-2025-1042',
    requestTitle: 'دراسة جدوى وتصميم محطة On-Grid\nSR-2025-1042',
    totalCost: 4500,
    durationDays: 7,
    submittedAt: '25 أكتوبر 2025',
    status: 'pending_review',
    methodology: 'يتضمن العرض الفني منهجية متكاملة تشتمل على الخطوات التالية:',
    methodologyPoints: [
      'مراجعة دقيقة للأحمال الكهربائية للأجمال وبيانات الاستهلاك وتحديد السعة التوليدية المثلى (KWp 25)',
      'تحليل طبوغرافي ومحاكاة شمسية ثلاثية الأبعاد باستخدام برنامج PVsyst لاحتساب معدلات الظلال ونوع الإيرادية الاقتصادية بدقة',
      'إعداد المخططات الكهربائية الأحادية التوضيحية (Single Line Diagram - SLD) ومخططات توزيع الكيلوات والحماية',
      'إصدار تقرير هندسي نهائي معتمد ومطابق لاشتراطات الشركة السعودية للكهرباء (SEC) وكود البناء السعودي (SBC).',
    ],
    attachmentName: 'Technical_Offer_PV_OnGrid_2025.pdf',
    attachmentSize: '3.4 ميجابايت · وثيقة هندسية موثقة ومعتمدة',
  },
  {
    id: 'OF-2025-084',
    requestId: 'SR-2025-1038',
    requestTitle: 'إشراف وفحص هندسي ميداني\nSR-2025-1038',
    totalCost: 12000,
    durationDays: 14,
    submittedAt: '22 أكتوبر 2025',
    status: 'approved',
    methodology: 'إشراف ميداني شامل على مراحل التركيب والتوصيل والاختبار والتشغيل بموجب تقارير يومية.',
    methodologyPoints: [
      'زيارات ميدانية دورية للموقع طوال مرحلة التنفيذ',
      'مراجعة وتوثيق التوصيلات الكهربائية والإنشائية',
      'اختبارات الجودة والأداء عند الاستلام الابتدائي والنهائي',
      'إعداد تقرير الاستلام الهندسي الشامل',
    ],
    attachmentName: 'Supervision_Plan_SR1038.pdf',
    attachmentSize: '1.8 ميجابايت',
  },
  {
    id: 'OF-2025-078',
    requestId: 'SR-2025-1035',
    requestTitle: 'تصميم منظومة ضخ مياه زراعية\nSR-2025-1035',
    totalCost: 3200,
    durationDays: 5,
    submittedAt: '18 أكتوبر 2025',
    status: 'pending_review',
    methodology: 'تصميم منظومة Off-Grid متكاملة لضخ المياه الزراعية مع احتساب بطاريات التخزين.',
    methodologyPoints: [
      'تحليل احتياجات المضخة والأحمال المصاحبة',
      'احتساب طاقة الألواح وسعة بطاريات التخزين اللازمة',
      'تصميم لوحة التحكم وأنظمة الحماية',
    ],
    attachmentName: 'Farm_PV_Pump_Design.pdf',
    attachmentSize: '2.2 ميجابايت',
  },
  {
    id: 'OF-2025-065',
    requestId: 'SR-2025-1029',
    requestTitle: 'فحص واختيار توافق مع كود البناء SBC\nSR-2025-1029',
    totalCost: 8500,
    durationDays: 10,
    submittedAt: '14 أكتوبر 2025',
    status: 'approved',
    methodology: 'مراجعة شاملة للمخططات وإصدار تقرير التوافق مع كود البناء السعودي.',
    attachmentName: 'SBC_Compliance_Report.pdf',
    attachmentSize: '4.1 ميجابايت',
  },
  {
    id: 'OF-2025-052',
    requestId: 'SR-2025-1024',
    requestTitle: 'استشارة هندسية لنظام تخزين هجين BESS\nSR-2025-1024',
    totalCost: 2800,
    durationDays: 4,
    submittedAt: '09 أكتوبر 2025',
    status: 'rejected',
    methodology: 'استشارة متخصصة في تصميم وتكامل أنظمة BESS للمجمعات الصناعية.',
    attachmentName: undefined,
    attachmentSize: undefined,
  },
  {
    id: 'OF-2025-041',
    requestId: 'SR-2025-1018',
    requestTitle: 'إشراف وتدقيق أداء محطة قائمة\nSR-2025-1018',
    totalCost: 5000,
    durationDays: 6,
    submittedAt: '03 أكتوبر 2025',
    status: 'approved',
    methodology: 'تدقيق شامل للأداء وإصدار تقرير تشخيصي مع التوصيات.',
    attachmentName: 'Performance_Audit_SR1018.pdf',
    attachmentSize: '2.9 ميجابايت',
  },
]

const statusLabels: Record<OfferStatus, string> = {
  pending_review: 'قيد المراجعة',
  approved:       'مقبول',
  rejected:       'مرفوض',
}

const statusClasses: Record<OfferStatus, string> = {
  pending_review: 'bg-solar-yellow/20 text-amber-800 border-solar-yellow/40',
  approved:       'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected:       'bg-red-100 text-red-700 border-red-200',
}

export function useEngineerOffers() {
  const search = ref('')
  const statusFilter = ref<OfferStatus | 'all'>('all')

  const filtered = computed(() => {
    let list = mockOffers
    if (statusFilter.value !== 'all') {
      list = list.filter(o => o.status === statusFilter.value)
    }
    if (search.value.trim()) {
      const q = search.value.toLowerCase()
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.requestId.toLowerCase().includes(q) ||
        o.requestTitle.toLowerCase().includes(q)
      )
    }
    return list
  })

  const pageSize = 6
  const currentPage = ref(1)
  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
  const paginated = computed(() =>
    filtered.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
  )
  function setPage(p: number) { currentPage.value = p }
  watch([search, statusFilter], () => { currentPage.value = 1 })

  return {
    search,
    statusFilter,
    filtered,
    paginated,
    currentPage,
    totalPages,
    pageSize,
    setPage,
    statusLabels,
    statusClasses,
    total: computed(() => filtered.value.length),
  }
}
