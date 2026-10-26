// بيانات تجريبية لطلبات الخدمات المتاحة للمهندس
// TODO: استبدل بـ useFetch('/api/engineer/service-requests?status=available')

export type ServiceRequestStatus =
  | 'awaiting_offers'   // بانتظار العروض
  | 'available'         // متاح للتقديم
  | 'urgent'            // عاجل - ينتهي قريباً

export interface EngineerServiceRequest {
  id: string                   // SR-2025-1042
  serviceType: string          // نوع الخدمة (نص عرض)
  serviceIcon: 'grid' | 'inspect' | 'droplet' | 'compliance' | 'bess' | 'monitor'
  governorate: string          // المحافظة
  location: string             // تفاصيل الموقع
  capacityLabel: string        // السعة التقديرية
  createdAt: string            // تاريخ الإنشاء
  status: ServiceRequestStatus
  offersCount?: number         // عدد العروض المقدمة حتى الآن
  // تفاصيل الطلب (تُعرض في المودال)
  scopeDescription: string     // نطاق العمل ومواصفات الطلب
  additionalLocation: string   // تفاصيل الموقع الإضافية
  locationTag?: string         // وسم الموقع
  attachmentName?: string      // اسم الملف المرفق
  attachmentSize?: string      // حجم الملف
}

export interface SubmitOfferForm {
  totalCost: string
  durationDays: string
  methodology: string
  attachmentFile: File | null
}

// --- بيانات تجريبية ---
const mockRequests: EngineerServiceRequest[] = [
  {
    id: 'SR-2025-1042',
    serviceType: 'دراسة جدوى وتصميم محطة On-Grid',
    serviceIcon: 'grid',
    governorate: 'الرياض',
    location: 'الرياض - حي الملقا (مبنى تجاري مستوى)',
    capacityLabel: '25 kWp',
    createdAt: '25 أكتوبر 2025',
    status: 'awaiting_offers',
    offersCount: 3,
    scopeDescription: 'مطلوب إعداد دراسة الجدوى الهندسية الكهروضوئية الكاملة للمحطة، واحتساب سعة المدولات والتأكد من مطابقة قواعد البناء السعودي SBC ومتطلبات شركة الكهرباء',
    additionalLocation: 'الرياض - حي الملقا (مبنى تجاري معرّض وجاهز للتركيب)',
    locationTag: 'سطح تجاري مستوٍ',
    attachmentName: 'Building_Electrical_Load.pdf',
    attachmentSize: '4.8 ميجابايت',
  },
  {
    id: 'SR-2025-1038',
    serviceType: 'إشراف وفحص هندسي ميداني',
    serviceIcon: 'inspect',
    governorate: 'القصيم (بريدة)',
    location: 'بريدة - الموقع الصناعي الشمالية',
    capacityLabel: '150 kWp',
    createdAt: '24 أكتوبر 2025',
    status: 'available',
    offersCount: 0,
    scopeDescription: 'إشراف ميداني على تركيب وتوصيل المحطة الكهروضوئية والتأكد من سلامة التوصيلات الكهربائية والإنشائية',
    additionalLocation: 'القصيم - بريدة - الموقع الصناعي الشمالية',
    attachmentName: undefined,
    attachmentSize: undefined,
  },
  {
    id: 'SR-2025-1035',
    serviceType: 'تصميم منظومة ضخ مياه زراعية Off-Grid',
    serviceIcon: 'droplet',
    governorate: 'المنطقة الشرقية (الإحساء)',
    location: 'الإحساء - مزرعة هجولة - تار إيزاوي',
    capacityLabel: '50 مضخة HP',
    createdAt: '22 أكتوبر 2025',
    status: 'awaiting_offers',
    offersCount: 1,
    scopeDescription: 'تصميم منظومة طاقة شمسية Off-Grid لتشغيل مضخة مياه بقدرة 50 HP مع احتساب بطاريات التخزين وضمان الاستمرارية',
    additionalLocation: 'الإحساء - مزرعة هجولة - طريق إيزاوي',
    attachmentName: 'Farm_Location_Map.pdf',
    attachmentSize: '2.1 ميجابايت',
  },
  {
    id: 'SR-2025-1029',
    serviceType: 'فحص واختيار توافق مع كود البناء SBC',
    serviceIcon: 'compliance',
    governorate: 'مكة المكرمة (جدة)',
    location: 'جدة - مجمع مشروعات تجارية',
    capacityLabel: '500 kWp',
    createdAt: '20 أكتوبر 2025',
    status: 'urgent',
    offersCount: 0,
    scopeDescription: 'مراجعة المخططات الكهربائية وضمان توافقها مع اشتراطات الكود السعودي للبناء (SBC) ومتطلبات شركة الكهرباء',
    additionalLocation: 'جدة - مجمع مشروعات تجارية - حي النزهة',
    attachmentName: 'SBC_Review_Request.pdf',
    attachmentSize: '1.5 ميجابايت',
  },
  {
    id: 'SR-2025-1024',
    serviceType: 'استشارة هندسية لنظام تخزين هجين BESS',
    serviceIcon: 'bess',
    governorate: 'المدينة المنورة (ينبع)',
    location: 'ينبع - مجمع صناعي',
    capacityLabel: '15 MWh',
    createdAt: '18 أكتوبر 2025',
    status: 'available',
    offersCount: 0,
    scopeDescription: 'استشارة هندسية متخصصة في تصميم وتكامل أنظمة تخزين الطاقة الهجينة (BESS) لمجمع صناعي بتقنية بطاريات ليثيوم',
    additionalLocation: 'ينبع - المجمع الصناعي - قسيمة D-14',
    attachmentName: 'BESS_Technical_Brief.pdf',
    attachmentSize: '3.2 ميجابايت',
  },
  {
    id: 'SR-2025-1018',
    serviceType: 'إشراف وتدقيق أداء محطة قائمة',
    serviceIcon: 'monitor',
    governorate: 'عسير (أبها)',
    location: 'أبها - محطة سولاري لايف',
    capacityLabel: '80 kWp',
    createdAt: '15 أكتوبر 2025',
    status: 'awaiting_offers',
    offersCount: 4,
    scopeDescription: 'تدقيق شامل لأداء محطة كهروضوئية قائمة بسعة 80 kWp وتحليل مؤشرات الأداء وإصدار تقرير مفصّل مع التوصيات',
    additionalLocation: 'أبها - محطة سولاري لايف - طريق الملك فهد',
    attachmentName: 'Plant_Performance_Data.xlsx',
    attachmentSize: '980 كيلوبايت',
  },
]

const statusLabels: Record<ServiceRequestStatus, string> = {
  awaiting_offers: 'بانتظار العروض',
  available:       'متاح للتقديم',
  urgent:          'عاجل - ينتهي قريباً',
}

const statusClasses: Record<ServiceRequestStatus, string> = {
  awaiting_offers: 'bg-solar-yellow/20 text-amber-800 border-solar-yellow/40',
  available:       'bg-emerald-100 text-emerald-800 border-emerald-200',
  urgent:          'bg-red-100 text-red-700 border-red-200',
}

export function useEngineerServiceRequests() {
  const search = ref('')
  const statusFilter = ref<ServiceRequestStatus | 'all'>('all')

  const filtered = computed(() => {
    let list = mockRequests
    if (statusFilter.value !== 'all') {
      list = list.filter(r => r.status === statusFilter.value)
    }
    if (search.value.trim()) {
      const q = search.value.toLowerCase()
      list = list.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.serviceType.toLowerCase().includes(q)
      )
    }
    return list
  })

  // --- Pagination ---
  const pageSize = 6
  const currentPage = ref(1)
  const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize))
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
