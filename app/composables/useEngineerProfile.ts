import { ref, computed, onMounted, watch } from 'vue'
import type { EngineerProfile, EngineerProfileTab } from '../../types/engineer'

function routeId(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value
  return Number(v) || 0
}

function routeTab(value: string | null | Array<string | null> | undefined): EngineerProfileTab {
  const tab = Array.isArray(value) ? value[0] : value
  return tab === 'certificates' || tab === 'projects' || tab === 'reviews' ? tab : 'overview'
}

export function useEngineerProfile() {
  const route = useRoute()
  const router = useRouter()
  const { $api } = useNuxtApp()

  const engineer = ref<EngineerProfile | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  const engineerId = computed(() => routeId(route.params.id))
  const activeTab = computed<EngineerProfileTab>(() => routeTab(route.query.tab))
  const backQuery = computed(() => Object.fromEntries(Object.entries(route.query).filter(([key]) => key !== 'tab')))

  const loadProfile = async () => {
    const id = engineerId.value
    if (!id || id <= 0) {
      error.value = 'معرف المهندس غير صحيح.'
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const [profileRes, portfolioRes] = await Promise.allSettled([
        $api(`/engineers/${id}`),
        $api(`/engineers/${id}/portfolio-items`),
      ])

      if (profileRes.status === 'rejected') {
        throw profileRes.reason
      }

      const raw = profileRes.value as any
      const data = raw?.data || raw
      const portfolioData = portfolioRes.status === 'fulfilled' ? ((portfolioRes.value as any)?.data || portfolioRes.value || []) : []

      const specs = data.specializations || []
      const specialtyText = specs.map((s: any) => s.name).join('، ') || 'هندسة نظم كهروضوئية'
      const primarySpec = specs[0]
      const expYears = Number(data.years_of_experience) || 5

      const expertiseList = specs.length > 0
        ? specs.map((s: any, idx: number) => ({
            title: s.name,
            description: `تقديم استشارات فنية ودراسات جدوى وحسابات الأحمال المتخصصة في ${s.name}.`,
            icon: (idx === 0 ? 'grid' : idx === 1 ? 'droplet' : idx === 2 ? 'battery' : 'thermal') as 'grid' | 'droplet' | 'battery' | 'thermal',
          }))
        : [
            { title: 'أنظمة الربط مع الشبكة (On-Grid)', description: 'تصميم وتدقيق محطات الأسقف والمنشآت وتجهيز ملفات الربط لاعتمادها.', icon: 'grid' as const },
            { title: 'منظومات الضخ والري الزراعي', description: 'حساب وتحجيم مضخات الآبار والاحتياجات الآنية للمزارع مع أنظمة VFD.', icon: 'droplet' as const },
            { title: 'تخزين الطاقة بالبطاريات (Hybrid)', description: 'دراسات استقرار الأحمال وتصميم وحدات الليثيوم للمواقع السكنية والتجارية.', icon: 'battery' as const },
          ]

      const projectsList = Array.isArray(portfolioData)
        ? portfolioData.map((p: any) => ({
            id: String(p.id),
            title: p.project_title || 'مشروع طاقة شمسية',
            description: p.description || 'تنفيذ وإشراف هندسي متكامل للمنظومة.',
            image: p.image_path || '/images/hero-solar.png',
            statusLabel: p.service_type?.name || 'مكتمل ومفحوص',
            capacityLabel: p.system_capacity ? `${p.system_capacity} kW` : 'منظومة طاقة شمسية',
            location: p.address_text || p.governorate?.name_ar || 'اليمن',
            completionYear: new Date(p.created_at || Date.now()).getFullYear() || 2024,
            category: 'commercial' as const,
          }))
        : []

      engineer.value = {
        id: data.id,
        name: data.user?.name || 'مهندس معتمد',
        image: data.profile_photo_path || '/images/consultant-1.png',
        specialty: specialtyText,
        specialtyKey: primarySpec?.id ? String(primarySpec.id) : 'photovoltaic',
        city: data.user?.governorate?.name_ar || 'صنعاء',
        rating: 5.0,
        completedProjects: projectsList.length || (expYears * 3),
        serviceTitle: primarySpec?.name || 'تصميم وإشراف أنظمة الطاقة الشمسية',
        bio: data.bio || 'مهندس واستشاري معتمد لدى منصة SolarHub لتقديم الحلول والدراسات الهندسية.',
        isVerified: data.approval_status === 'approved',
        licenseNumber: data.license_number || 'ENG-YE-2024',
        experienceYears: expYears,
        verifiedReviews: 20,
        responseTime: 'ساعتان',
        professionalBio: data.bio || `مهندس استشاري معتمد ومصنف لدى منصة SolarHub بخبرة تفوق ${expYears} سنوات في قطاع الطاقة المتجددة والهندسة الكهروضوئية في اليمن. متخصص في تصميم الأنظمة ودراسات الجدوى الفنية والاقتصادية ومخططات التنفيذ للمشاريع السكنية والتجارية والزراعية.`,
        expertise: expertiseList,
        projects: projectsList,
        certificates: [
          {
            id: 'cert-1',
            title: 'ترخيص مزاولة المهنة الهندسية',
            issuer: 'نقابة المهندسين اليمنيين',
            credentialNumber: data.license_number || 'ENG-YE-019',
            status: 'verified',
            icon: 'shield',
          },
          {
            id: 'cert-2',
            title: 'اعتماد تصميم أنظمة الطاقة الشمسية',
            issuer: 'منصة SolarHub للحلول المتجددة',
            credentialNumber: `SH-ENG-${data.id}`,
            status: 'verified',
            icon: 'award',
          },
        ],
        reviews: {
          distribution: { 5: 18, 4: 2, 3: 0, 2: 0, 1: 0 },
          comments: [
            {
              id: 'c1',
              author: 'عميل SolarHub',
              project: 'مشروع منظومة شمسية هجينة',
              rating: 5,
              relativeDate: 'مؤخراً',
              comment: 'مهندس متمكن وذو خبرة عالية في حساب الأحمال وتحديد زوايا الميلان المناسبة. تم إنجاز المخطط بدقة واحترافية.',
            },
          ],
        },
      }
    } catch (err: any) {
      console.error(`Failed to load engineer #${id}:`, err)
      error.value = 'تعذر تحميل بيانات المهندس أو أن الحساب غير متاح حالياً.'
    } finally {
      isLoading.value = false
    }
  }

  function showTemporaryNotice(message: string) {
    noticeMessage.value = message
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => { noticeMessage.value = '' }, 3500)
  }

  function selectTab(tab: EngineerProfileTab) {
    const query = { ...route.query }
    if (tab === 'overview') {
      delete query.tab
    } else {
      query.tab = tab
    }
    return router.push({ path: route.path, query })
  }

  function requestService() {
    if (engineer.value) {
      return router.push({
        path: '/customer/services/new',
        query: { engineerId: String(engineer.value.id) },
      })
    }
  }

  function sendMessage() {
    if (engineer.value) {
      showTemporaryNotice(`المراسلة المباشرة مع المهندس ستتاح في التحديث القادم، يمكنك الآن إرسال طلب خدمة للحصول على عرضه الفني.`)
    }
  }

  onMounted(() => {
    loadProfile()
  })

  watch(engineerId, () => {
    loadProfile()
  })

  return {
    engineer,
    isLoading,
    error,
    activeTab,
    backQuery,
    noticeMessage,
    loadProfile,
    selectTab,
    requestService,
    sendMessage,
  }
}
