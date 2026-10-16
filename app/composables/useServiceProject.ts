import type { ServiceOfferWithEngineer, ServiceProject } from '../../types/service-request'
import { getEngineerProfile } from './useEngineerProfile'

const projects: Record<string, ServiceProject> = {
  'PRJ-4091': {
    id: 'PRJ-4091', title: 'تصميم وإشراف منظومة طاقة شمسية هجينة مع بطاريات تخزين', serviceType: 'design', serviceLabel: 'تصميم وإشراف هندسي متكامل',
    region: 'الرياض', location: 'حي النرجس', capacity: '15 كيلوواط (kW) هجين + بطاريات', publishedLabel: 'منذ يومين',
    description: 'فيلا سكنية جديدة، أرغب في تركيب منظومة طاقة شمسية هجينة بسعة 15 كيلوواط مرتبطة بالشبكة مع نظام بطاريات ليثيوم لتغطية الأحمال الحساسة والإنارة أثناء الانقطاعات أو فترات الذروة. نحتاج إلى دراسة هندسية ومخططات معتمدة للمعدات وتنسيق فحص شركة الكهرباء (SEC).',
    attachments: [
      { id: 'roof', name: 'صورة_سطح_الفيلا_الرئيسي.jpg', sizeLabel: '2.4 MB', kind: 'image' },
      { id: 'plan', name: 'مخطط_السطح_والقواطع_الكهربائية.pdf', sizeLabel: '4.1 MB', kind: 'pdf' },
    ],
    acceptedOfferId: 'offer-ahmad',
    offers: [
      { id: 'offer-ahmad', engineerId: 1, price: 3400, durationDays: 6, summary: 'إعداد دراسة الظلال ومحاكاة التظليل ثلاثية الأبعاد ببرنامج PVsyst. تصميم المخطط أحادي الخط (SLD) المعتمد لنظام 15kW الهجين مع بطاريات Pylontech، وإصدار جدول الكميات الفني (BOQ) وإعداد ملف الاعتماد الكامل لشركة الكهرباء السعودية (SEC).', attachment: { id: 'ahmad-pdf', name: 'العرض_الفني_المفصل_م_أحمد_الشمري.pdf', sizeLabel: '1.8 MB', kind: 'pdf' } },
      { id: 'offer-tareq', engineerId: 4, price: 2950, durationDays: 8, summary: 'تقديم دراسة تدفق الطاقة وحساب السعة التخزينية الملائمة للمنزل. مراجعة متطلبات السلامة وتأريض المنظومة وفق كود البناء السعودي (SBC 401)، وتجهيز مخططات الكابلات والحمايات الكهربائية مع تسليم وثائق الفحص الفني.', attachment: { id: 'tareq-pdf', name: 'المقترح_الهندسي_الفني_م_طارق_العتيبي.pdf', sizeLabel: '2.1 MB', kind: 'pdf' } },
      { id: 'offer-sarah', engineerId: 2, price: 3800, durationDays: 5, summary: 'دراسة تفصيلية متقدمة لتوليد الطاقة السنوي المتوقع. فحص التوافقية الحرارية للبطاريات وعزلها، وإعداد مخططات الربط التفصيلية وزيارة ميدانية للموقع للتحقق من زوايا الميلان والظلال، مع الدعم الكامل حتى إطلاق التيار.', attachment: { id: 'sarah-pdf', name: 'كراسة_العرض_الهندسي_م_سارة_القحطاني.pdf', sizeLabel: '3.4 MB', kind: 'pdf' } },
    ],
  },
  'SR-302': {
    id: 'SR-302', title: 'دراسة جدوى وتوافق كود SBC', serviceType: 'feasibility', serviceLabel: 'دراسة جدوى هندسية', region: 'الرياض', location: 'حي النرجس', capacity: '15 كيلوواط (kW)', publishedLabel: 'أمس',
    description: 'دراسة جدوى لمنظومة شمسية سكنية تشمل تحليل الأحمال ومراجعة توافق المخططات والحمايات مع كود البناء السعودي قبل التنفيذ.', attachments: [],
    offers: [{ id: 'offer-study', engineerId: 1, price: 1800, durationDays: 3, summary: 'تحليل الأحمال ودراسة الإنتاج المتوقع وتكاليف التنفيذ، مع مراجعة اشتراطات كود البناء السعودي وتسليم تقرير التوصيات.' }],
  },
  'PRJ-4092': {
    id: 'PRJ-4092', title: 'دراسة منظومة ضخ شمسي لمزرعة', serviceType: 'feasibility', serviceLabel: 'دراسة جدوى', region: 'القصيم', location: 'بريدة', capacity: 'مضخة 10 حصان', publishedLabel: 'اليوم',
    description: 'دراسة احتياجات مزرعة من المياه وتحجيم مصفوفة شمسية لتشغيل مضخة الري مع مراجعة سهولة الصيانة والوصول إلى البئر.', attachments: [], offers: [],
  },
}

export function useServiceProject() {
  const route = useRoute()
  // Local to this page instance: refresh restores the demo fixture, never a server mutation.
  const acceptedOffers = reactive<Record<string, string>>({})
  const pendingOfferId = ref<string>()
  const noticeMessage = ref('')
  const projectId = computed(() => String(Array.isArray(route.params.id) ? route.params.id[0] ?? '' : route.params.id ?? ''))
  const project = computed(() => Object.hasOwn(projects, projectId.value) ? projects[projectId.value] : undefined)
  const acceptedOfferId = computed(() => project.value ? acceptedOffers[project.value.id] ?? project.value.acceptedOfferId : undefined)
  const offers = computed<ServiceOfferWithEngineer[]>(() => (project.value?.offers ?? []).flatMap(offer => {
    const engineer = getEngineerProfile(offer.engineerId)
    return engineer ? [{ ...offer, engineer }] : []
  }))
  const pendingOffer = computed(() => offers.value.find(offer => offer.id === pendingOfferId.value))
  const statusLabel = computed(() => acceptedOfferId.value ? 'تم قبول العرض وتعميد المشروع' : 'مفتوح لتلقي العروض')

  function requestAcceptance(offerId: string) {
    if (acceptedOfferId.value || !offers.value.some(offer => offer.id === offerId)) return
    pendingOfferId.value = offerId
    noticeMessage.value = ''
  }
  function cancelAcceptance() { pendingOfferId.value = undefined }
  function confirmAcceptance() {
    if (!project.value || !pendingOffer.value || acceptedOfferId.value) return
    acceptedOffers[projectId.value] = pendingOffer.value.id
    pendingOfferId.value = undefined
    noticeMessage.value = 'تم قبول العرض تجريبيًا في هذه الصفحة فقط. لم يتم تعميد مشروع أو إرسال إشعار فعلي. تحديث الصفحة يعيد البيانات التجريبية.'
  }
  watch(projectId, () => { pendingOfferId.value = undefined; noticeMessage.value = '' })
  return { project, offers, acceptedOfferId, pendingOffer, statusLabel, noticeMessage, requestAcceptance, cancelAcceptance, confirmAcceptance }
}
