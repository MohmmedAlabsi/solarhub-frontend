import type { EngineerProfile, EngineerProfileTab } from '../../types/engineer'
import { engineersData } from './useEngineers'

const profileDetails: Record<number, Pick<EngineerProfile, 'licenseNumber' | 'experienceYears' | 'verifiedReviews' | 'responseTime' | 'professionalBio' | 'expertise'>> = {
  1: {
    licenseNumber: 'SCE-849201', experienceYears: 8, verifiedReviews: 48, responseTime: 'ساعتان',
    professionalBio: 'مهندس استشاري معتمد من الهيئة السعودية للمهندسين بخبرة تفوق 8 سنوات في قطاع الطاقة المتجددة والهندسة الكهروضوئية في المملكة العربية السعودية. حاصل على اعتمادات دولية في سلامة وتركيب المحطات، ومتخصص في تصميم الأنظمة ودراسات الجدوى الفنية والاقتصادية ومخططات التنفيذ لمشاريع الطاقة الشمسية التجارية والصناعية والزراعية وفق اشتراطات كود البناء السعودي ومتطلبات شركة الكهرباء السعودية.',
    expertise: [
      { title: 'أنظمة الربط مع الشبكة (On-Grid)', description: 'تصميم وتدقيق محطات الأسقف الصناعية والتجارية وتجهيز ملفات الربط لاعتماد مزود الخدمة.', icon: 'grid' },
      { title: 'منظومات الضخ والري الزراعي', description: 'حساب وتحجيم مضخات الآبار العميقة والاحتياجات الآنية للمزارع مع أنظمة VFD.', icon: 'droplet' },
      { title: 'تخزين الطاقة بالبطاريات (BESS & Hybrid)', description: 'دراسات استقرار الأحمال وتصميم وحدات الليثيوم للمواقع السكنية والصناعية الحساسة للانقطاع.', icon: 'battery' },
      { title: 'الفحص الحراري وتدقيق الأداء', description: 'فحص النقاط الساخنة بالكاميرات الحرارية واختبارات قياس منحنى الجهد والتيار والعزل الكهربائي.', icon: 'thermal' },
    ],
  },
  2: {
    licenseNumber: 'SCE-781452', experienceYears: 7, verifiedReviews: 56, responseTime: 'ساعة واحدة',
    professionalBio: 'مهندسة واستشارية طاقة متجددة معتمدة ومتخصصة في حلول الضخ الشمسي والري الذكي للمشاريع الزراعية. تمتلك خبرة عملية في تحليل الاحتياج المائي، اختيار المضخات وتصميم المصفوفات الشمسية بما يحقق استدامة التشغيل وتقليل تكاليف الوقود والصيانة.',
    expertise: [
      { title: 'أنظمة الضخ الشمسي', description: 'تصميم منظومات الضخ للآبار والخزانات وفق معدلات التدفق والرفع المطلوبة.', icon: 'droplet' },
      { title: 'حلول الري الذكي', description: 'دمج التحكم والمراقبة مع شبكات الري الزراعي لرفع كفاءة استهلاك المياه.', icon: 'grid' },
      { title: 'الأنظمة الهجينة للمزارع', description: 'موازنة الإنتاج الشمسي مع البطاريات والمولدات لضمان استمرارية التشغيل.', icon: 'battery' },
      { title: 'اختبارات الأداء الميداني', description: 'قياس كفاءة المنظومة وتشخيص الفاقد وإعداد تقارير التحسين.', icon: 'thermal' },
    ],
  },
  3: {
    licenseNumber: 'SCE-663908', experienceYears: 11, verifiedReviews: 73, responseTime: '3 ساعات',
    professionalBio: 'مهندس كهربائي معتمد بخبرة واسعة في أنظمة تخزين الطاقة والمنظومات الهجينة للمصانع والمنشآت الحيوية. يقود دراسات جودة الطاقة والحماية ومزامنة مصادر التوليد ويشرف على الاختبارات والتشغيل وفق المعايير المحلية والدولية.',
    expertise: [
      { title: 'أنظمة تخزين الطاقة BESS', description: 'تحليل الأحمال واختيار تقنيات البطاريات وأنظمة إدارة الطاقة المناسبة.', icon: 'battery' },
      { title: 'المنظومات الهجينة', description: 'تكامل الطاقة الشمسية والبطاريات والمولدات مع استراتيجيات تشغيل اقتصادية.', icon: 'grid' },
      { title: 'الحماية وجودة الطاقة', description: 'دراسات القصر والانتقائية والتوافقيات للمرافق الصناعية.', icon: 'thermal' },
      { title: 'التشغيل والاختبارات', description: 'إجراءات القبول والتشغيل التجريبي وتسليم الوثائق الفنية.', icon: 'droplet' },
    ],
  },
  4: {
    licenseNumber: 'SCE-594327', experienceYears: 9, verifiedReviews: 39, responseTime: 'ساعتان',
    professionalBio: 'مهندس صيانة وفحص معتمد متخصص في تقييم أداء محطات الطاقة الشمسية القائمة، الكشف الحراري، اختبارات العزل ومنحنيات الجهد والتيار. يقدم خطط صيانة وتأهيل عملية للمحطات التجارية والصناعية لرفع الاعتمادية والإنتاجية.',
    expertise: [
      { title: 'الفحص الحراري', description: 'تحديد النقاط الساخنة والعيوب الخفية في الألواح والوصلات الكهربائية.', icon: 'thermal' },
      { title: 'تدقيق الأداء', description: 'مقارنة الإنتاج الفعلي بالنماذج التصميمية وتحديد مصادر الفاقد.', icon: 'grid' },
      { title: 'الصيانة الوقائية', description: 'إعداد جداول الفحص والتنظيف والقياسات الدورية للمحطات.', icon: 'droplet' },
      { title: 'إعادة تأهيل الأنظمة', description: 'تقييم واستبدال المكونات المتقادمة وتحسين الحماية والمراقبة.', icon: 'battery' },
    ],
  },
}

const profileProjects: Record<number, EngineerProfile['projects']> = {
  1: [
    { id: 'factory', title: 'محطة شمسية لمصنع مواد بناء', description: 'تصميم وتنفيذ نظام ربط شبكي معتمد مع خفض 42% من استهلاك الطاقة الصناعية.', image: '/images/hero-solar.png', statusLabel: 'مكتمل ومربوط', capacityLabel: 'On-Grid 450 kWp', location: 'الرياض - المنطقة الصناعية', completionYear: 2024, category: 'industrial' },
    { id: 'farm', title: 'منظومة ضخ مياه زراعية متكاملة', description: 'تحجيم وتشغيل محطة مضخات آبار زراعية عميقة مع عاكس ترددي ذكي وتغذية المرشات المحورية.', image: '/images/product-panel.png', statusLabel: 'مكتمل ومفحوص', capacityLabel: 'Solar Pumping 75 kW', location: 'الخرج - مشروع زراعي', completionYear: 2023, category: 'agricultural' },
    { id: 'mall', title: 'محطة سقفية تجارية لمجمع تسوق', description: 'نظام شمسي متصل بالشبكة مع تدقيق اتزان الأحمال الإنشائية واعتماد شركة الكهرباء.', image: '/images/product-kit.png', statusLabel: 'معتمد من كود البناء', capacityLabel: 'Commercial Roof 250 kWp', location: 'جدة - حي الزهراء', completionYear: 2024, category: 'commercial' },
    { id: 'bess', title: 'نظام تخزين طاقة هجين BESS', description: 'وحدة بطاريات فوسفات حديد الليثيوم مهيأة لتغطية طاقة طوارئ للمنشآت الحساسة وسد ذروة الأحمال.', image: '/images/product-battery.png', statusLabel: 'تشغيل مستمر 24/7', capacityLabel: 'BESS 200 kWh', location: 'الدمام - المدينة الصناعية الثانية', completionYear: 2023, category: 'storage' },
  ],
  2: [
    { id: 'irrigation', title: 'مشروع ري شمسي لمزرعة نخيل', description: 'منظومة ضخ وتحكم ذكية لتغذية شبكة الري بالتنقيط وتقليل الاعتماد على مولدات الوقود.', image: '/images/product-panel.png', statusLabel: 'مكتمل ومفحوص', capacityLabel: 'Solar Pumping 90 kW', location: 'القصيم - بريدة', completionYear: 2024, category: 'agricultural' },
    { id: 'greenhouse', title: 'تغذية بيوت محمية بالطاقة الشمسية', description: 'نظام هجين لتشغيل التهوية والتبريد والمراقبة الزراعية باستمرارية عالية.', image: '/images/product-kit.png', statusLabel: 'تشغيل مستمر', capacityLabel: 'Hybrid 120 kWp', location: 'القصيم - عنيزة', completionYear: 2023, category: 'agricultural' },
  ],
  3: [
    { id: 'industrial-bess', title: 'منظومة تخزين لمرفق صناعي', description: 'حل تخزين وموازنة أحمال مع نظام إدارة طاقة للمحافظة على استقرار خطوط الإنتاج.', image: '/images/product-battery.png', statusLabel: 'مكتمل ومختبر', capacityLabel: 'BESS 500 kWh', location: 'الدمام - المنطقة الصناعية', completionYear: 2024, category: 'storage' },
    { id: 'hybrid', title: 'محطة هجينة لمنشأة لوجستية', description: 'تكامل الطاقة الشمسية والبطاريات والمولد الاحتياطي ضمن منظومة تحكم مركزية.', image: '/images/product-inverter.png', statusLabel: 'مكتمل ومربوط', capacityLabel: 'Hybrid 320 kWp', location: 'الخبر - المنطقة اللوجستية', completionYear: 2023, category: 'industrial' },
  ],
  4: [],
}
const profileCertificates: Record<number, EngineerProfile['certificates']> = {
  1: [
    { id: 'sce', title: 'الهيئة السعودية للمهندسين (SCE)', issuer: 'رخصة استشاري طاقة متجددة معتمد', credentialNumber: 'SCE-849201', validUntil: '2026', status: 'verified', icon: 'shield' },
    { id: 'sbc', title: 'كود البناء السعودي (SBC)', issuer: 'شهادة اعتماد تصميم وتنفيذ أنظمة الطاقة الشمسية', credentialNumber: 'SBC-SOL-2022-419', status: 'verified', icon: 'code' },
    { id: 'sec', title: 'الشركة السعودية للكهرباء (SEC)', issuer: 'اعتماد الربط الكهربي للأنظمة الشمسية الصغيرة Net-Metering', credentialNumber: 'SEC-PV-CERT-0922', status: 'verified', icon: 'power' },
    { id: 'pvst', title: 'معهد الطاقة ومحاكاة النظم (بيسيرا)', issuer: 'شهادة مصمم محترف للأنظمة الشمسية (PVSystem Certified)', credentialNumber: 'PVST-EXP-7714', status: 'verified', icon: 'award' },
  ],
  2: [
    { id: 'sce', title: 'الهيئة السعودية للمهندسين (SCE)', issuer: 'رخصة مهندسة طاقة متجددة معتمدة', credentialNumber: 'SCE-781452', validUntil: '2027', status: 'verified', icon: 'shield' },
    { id: 'pump', title: 'اعتماد تصميم أنظمة الضخ الشمسي', issuer: 'برنامج كفاءة الطاقة الزراعية', credentialNumber: 'SP-DESIGN-3188', status: 'verified', icon: 'award' },
  ],
  3: [
    { id: 'sce', title: 'الهيئة السعودية للمهندسين (SCE)', issuer: 'رخصة مهندس كهربائي استشاري', credentialNumber: 'SCE-663908', validUntil: '2026', status: 'verified', icon: 'shield' },
    { id: 'bess', title: 'اعتماد أنظمة تخزين الطاقة BESS', issuer: 'برنامج تكامل مصادر الطاقة الصناعية', credentialNumber: 'BESS-CERT-5504', status: 'verified', icon: 'power' },
  ],
  4: [],
}
function routeId(value: string | string[] | undefined) { return Number(Array.isArray(value) ? value[0] : value) }
function routeTab(value: string | null | Array<string | null> | undefined): EngineerProfileTab {
  const tab = Array.isArray(value) ? value[0] : value
  return tab === 'certificates' || tab === 'projects' ? tab : 'overview'
}

export function useEngineerProfile() {
  const route = useRoute()
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined
  const engineerId = computed(() => routeId(route.params.id))
  const activeTab = computed<EngineerProfileTab>(() => routeTab(route.query.tab))
  const engineer = computed<EngineerProfile | undefined>(() => {
    const base = engineersData.find(item => item.id === engineerId.value)
    const details = profileDetails[engineerId.value]
    return base && details ? { ...base, ...details, certificates: profileCertificates[engineerId.value] ?? [], projects: profileProjects[engineerId.value] ?? [] } : undefined
  })
  const backQuery = computed(() => Object.fromEntries(Object.entries(route.query).filter(([key]) => key !== 'tab')))

  function showTemporaryNotice(message: string) {
    noticeMessage.value = message
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => { noticeMessage.value = '' }, 3500)
  }
  function selectTab(tab: EngineerProfileTab) {
    if (tab === 'overview' || tab === 'certificates' || tab === 'projects') {
      const query = { ...route.query }
      if (tab === 'overview') delete query.tab
      else query.tab = tab
      return navigateTo({ path: route.path, query })
    }
    showTemporaryNotice('سيُنفذ محتوى هذا التبويب في شاشة لاحقة.')
  }
  function requestService() { if (engineer.value) showTemporaryNotice(`طلب خدمة هندسية من ${engineer.value.name} سيتاح عند ربط خدمة الطلبات.`) }
  function sendMessage() { if (engineer.value) showTemporaryNotice(`المراسلة مع ${engineer.value.name} ستتاح عند ربط خدمة المحادثات.`) }

  onBeforeUnmount(() => { if (noticeTimer) clearTimeout(noticeTimer) })
  return { engineer, activeTab, backQuery, noticeMessage, selectTab, requestService, sendMessage }
}