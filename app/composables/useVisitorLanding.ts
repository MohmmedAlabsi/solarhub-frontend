import { ref, computed, onMounted, onUnmounted } from 'vue'
import type {
  VisitorProductItem,
  VisitorStoreItem,
  VisitorEngineerItem,
  PlatformStats,
} from '~/types/visitor'

const SUPABASE_STORAGE_URL = 'https://rtjrjsgabinwdbrtxakk.supabase.co/storage/v1/object/public/public-media/'

export function resolveStorageUrl(path: string | null | undefined, fallback: string): string {
  if (!path) return fallback
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SUPABASE_STORAGE_URL}${path.replace(/^\/+/, '')}`
}

export function resolveProductImage(rawImage: string | null | undefined, category = '', title = ''): string {
  if (rawImage) {
    return resolveStorageUrl(rawImage, '/images/hero-solar.png')
  }
  const catLower = category.toLowerCase()
  const titleLower = title.toLowerCase()

  if (catLower.includes('لوح') || titleLower.includes('لوح') || titleLower.includes('panel')) return '/images/product-panel.png'
  if (catLower.includes('إنفرتر') || titleLower.includes('انفرتر') || titleLower.includes('inverter')) return '/images/product-inverter.png'
  if (catLower.includes('بطارية') || titleLower.includes('بطارية') || titleLower.includes('battery')) return '/images/product-battery.png'
  if (catLower.includes('منظومة') || titleLower.includes('kit')) return '/images/product-kit.png'

  return '/images/hero-solar.png'
}

function getRandomSlice<T>(array: T[], count: number): T[] {
  if (array.length <= count) return [...array]
  const shuffled = [...array].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function useVisitorLanding() {
  const { $api } = useNuxtApp()

  // المخزون الكامل من قاعدة البيانات
  const allProducts = ref<VisitorProductItem[]>([])
  const allStores = ref<VisitorStoreItem[]>([])
  const allEngineers = ref<VisitorEngineerItem[]>([])

  // العناصر المعروضة حالياً في السلايدر
  const displayedProducts = ref<VisitorProductItem[]>([])
  const displayedStores = ref<VisitorStoreItem[]>([])
  const displayedEngineers = ref<VisitorEngineerItem[]>([])

  // حالة التحميل والخطأ
  const isLoading = ref(true)
  const errorMessage = ref('')

  // مؤقت التدوير التلقائي (كل 50 ثانية)
  const ROTATE_INTERVAL_SECONDS = 50
  const secondsLeft = ref(ROTATE_INTERVAL_SECONDS)
  const timerProgress = computed(() => {
    return Math.round(((ROTATE_INTERVAL_SECONDS - secondsLeft.value) / ROTATE_INTERVAL_SECONDS) * 100)
  })

  let intervalTimer: ReturnType<typeof setInterval> | null = null

  // إحصائيات المنصة الحية
  const stats = computed<PlatformStats>(() => ({
    totalProducts: allProducts.value.length,
    totalStores: allStores.value.length,
    totalEngineers: allEngineers.value.length,
  }))

  function mapProduct(item: any): VisitorProductItem {
    const mp = item.master_product || item.masterProduct || {}
    const brand = mp.brand?.name || 'علامة معتمدة'
    const category = mp.category?.name_ar || mp.category?.name || 'طاقة شمسية'
    const title = mp.title || 'منتج طاقة شمسية معتمد'
    const imagePath = mp.images?.[0]?.image_path || mp.images?.[0]?.image_url || mp.image_url || item.image

    return {
      id: item.id,
      title,
      modelNumber: mp.model_number || `SH-${item.id}`,
      sku: item.sku || mp.sku || `SKU-${item.id}`,
      brand,
      category,
      imageUrl: resolveProductImage(imagePath, category, title),
      price: item.price ? Number(item.price) : null,
      stockQuantity: item.stock_quantity ? Number(item.stock_quantity) : 0,
      warrantyPeriod: item.warranty_period || 'ضمان معتمد',
      governorateName: item.governorate?.name_ar || item.governorate?.name || 'اليمن',
      storeName: item.store?.company_name || 'متجر معتمد',
      storeId: item.store?.id,
    }
  }

  function mapStore(item: any): VisitorStoreItem {
    const rawLogo = item.company_logo_url || item.company_logo_path
    return {
      id: item.id,
      companyName: item.company_name || 'متجر معتمد',
      governorateName: item.governorate_name || item.governorate?.name_ar || item.governorate?.name || 'صنعاء',
      addressDetails: item.address_details || 'الجمهورية اليمنية',
      bio: item.bio || 'موزع ووكيل معتمد لمهمات ومنظومات الطاقة الشمسية باليمن.',
      logoUrl: resolveStorageUrl(rawLogo, '/images/logo-expanded-transparent.png'),
      storeType: item.store_type || 'وكيل وموزع رئيسي',
      rating: item.average_rating ? Number(item.average_rating) : 4.8,
      ratingsCount: item.ratings_count ? Number(item.ratings_count) : 24,
      whatsappNumber: item.whatsapp_number,
    }
  }

  function mapEngineer(item: any): VisitorEngineerItem {
    const rawPhoto = item.profile_photo_path || item.cv_url
    const rawSpecs = Array.isArray(item.specializations)
      ? item.specializations.map((s: any) => s.name_ar || s.name || s).join('، ')
      : item.specialization || 'تصميم ومراجعة منظومات الطاقة الشمسية'

    return {
      id: item.id,
      name: item.name || item.user?.name || 'مهندس استشاري',
      specialization: rawSpecs,
      governorateName: item.governorate_name || item.governorate?.name_ar || item.governorate?.name || 'صنعاء',
      yearsOfExperience: item.years_of_experience ? Number(item.years_of_experience) : 5,
      bio: item.bio || 'استشاري معتمد في دراسات الجدوى الفنية وقياس الأحمال والإشراف على التركيبات الكهروضوئية.',
      photoUrl: resolveStorageUrl(rawPhoto, '/images/hero-solar.png'),
      rating: item.rating_average ? Number(item.rating_average) : 4.9,
      ratingsCount: item.ratings_count ? Number(item.ratings_count) : 18,
      licenseNumber: item.license_number || `ENG-${item.id}`,
    }
  }

  function cycleRandomItems() {
    if (allProducts.value.length > 0) {
      displayedProducts.value = getRandomSlice(allProducts.value, 4)
    }
    if (allStores.value.length > 0) {
      displayedStores.value = getRandomSlice(allStores.value, 3)
    }
    if (allEngineers.value.length > 0) {
      displayedEngineers.value = getRandomSlice(allEngineers.value, 3)
    }
    secondsLeft.value = ROTATE_INTERVAL_SECONDS
  }

  function startRotationTimer() {
    stopRotationTimer()
    secondsLeft.value = ROTATE_INTERVAL_SECONDS
    intervalTimer = setInterval(() => {
      secondsLeft.value -= 1
      if (secondsLeft.value <= 0) {
        cycleRandomItems()
      }
    }, 1000)
  }

  function stopRotationTimer() {
    if (intervalTimer) {
      clearInterval(intervalTimer)
      intervalTimer = null
    }
  }

  async function fetchVisitorData() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      // جلب متوازي للمنتجات والمتاجر والمهندسين من الـ API
      const [productsRes, storesRes, engineersRes] = await Promise.allSettled([
        $api<any>('/store-products?per_page=100'),
        $api<any>('/stores?per_page=50'),
        $api<any>('/engineers?per_page=50'),
      ])

      // 1. المنتجات
      if (productsRes.status === 'fulfilled') {
        const raw = Array.isArray(productsRes.value) ? productsRes.value : productsRes.value?.data || []
        allProducts.value = Array.isArray(raw) ? raw.map(mapProduct) : []
      } else {
        console.error('Failed to load products for visitor:', productsRes.reason)
        allProducts.value = []
      }

      // 2. المتاجر
      if (storesRes.status === 'fulfilled') {
        const raw = Array.isArray(storesRes.value) ? storesRes.value : storesRes.value?.data || []
        allStores.value = Array.isArray(raw) ? raw.map(mapStore) : []
      } else {
        console.error('Failed to load stores for visitor:', storesRes.reason)
        allStores.value = []
      }

      // 3. المهندسون
      if (engineersRes.status === 'fulfilled') {
        const raw = Array.isArray(engineersRes.value) ? engineersRes.value : engineersRes.value?.data || []
        allEngineers.value = Array.isArray(raw) ? raw.map(mapEngineer) : []
      } else {
        console.error('Failed to load engineers for visitor:', engineersRes.reason)
        allEngineers.value = []
      }

      // تهيئة المعروضات العشوائية الأولى
      cycleRandomItems()
      startRotationTimer()
    } catch (err: any) {
      console.error('Visitor landing page fetch error:', err)
      errorMessage.value = err?.data?.message || 'تعذر الاتصال بالخادم لجلب بيانات المنصة.'
      allProducts.value = []
      allStores.value = []
      allEngineers.value = []
      displayedProducts.value = []
      displayedStores.value = []
      displayedEngineers.value = []
    } finally {
      isLoading.value = false
    }
  }

  // أزرار التحكم اليدوي للسلايدر
  function shuffleProductsNow() {
    if (allProducts.value.length > 0) {
      displayedProducts.value = getRandomSlice(allProducts.value, 4)
      secondsLeft.value = ROTATE_INTERVAL_SECONDS
    }
  }

  function shuffleStoresNow() {
    if (allStores.value.length > 0) {
      displayedStores.value = getRandomSlice(allStores.value, 3)
      secondsLeft.value = ROTATE_INTERVAL_SECONDS
    }
  }

  function shuffleEngineersNow() {
    if (allEngineers.value.length > 0) {
      displayedEngineers.value = getRandomSlice(allEngineers.value, 3)
      secondsLeft.value = ROTATE_INTERVAL_SECONDS
    }
  }

  onMounted(() => {
    fetchVisitorData()
  })

  onUnmounted(() => {
    stopRotationTimer()
  })

  return {
    allProducts,
    allStores,
    allEngineers,
    displayedProducts,
    displayedStores,
    displayedEngineers,
    isLoading,
    errorMessage,
    secondsLeft,
    timerProgress,
    stats,
    fetchVisitorData,
    cycleRandomItems,
    shuffleProductsNow,
    shuffleStoresNow,
    shuffleEngineersNow,
  }
}
