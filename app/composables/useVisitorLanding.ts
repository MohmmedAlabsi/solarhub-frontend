import { ref, computed, watch, onUnmounted } from 'vue'
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

function getChunkSlice<T>(array: T[], index: number, size: number): T[] {
  if (array.length <= size) return [...array]
  const start = (index * size) % array.length
  let slice = array.slice(start, start + size)
  if (slice.length < size) {
    slice = slice.concat(array.slice(0, size - slice.length))
  }
  return slice
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function useVisitorLanding() {
  const { $api } = useNuxtApp()

  // المخزون الكامل المسترجع عشوائياً من إجمالي قاعدة البيانات
  const allProducts = ref<VisitorProductItem[]>([])
  const allStores = ref<VisitorStoreItem[]>([])
  const allEngineers = ref<VisitorEngineerItem[]>([])
  const backendStats = ref<{ totalProducts: number; totalStores: number; totalEngineers: number } | null>(null)

  // العناصر المعروضة حالياً في السلايدرات العشوائية المتجددة كل 10 ثواني
  const displayedProducts = ref<VisitorProductItem[]>([])
  const displayedStores = ref<VisitorStoreItem[]>([])
  const displayedEngineers = ref<VisitorEngineerItem[]>([])

  // فهارس شرائح التصفح السلس للـ Carousel
  const productChunkIndex = ref(0)
  const storeChunkIndex = ref(0)
  const engineerChunkIndex = ref(0)

  // عدد الشرائح الإجمالي لكل قطاع
  const totalProductSlides = computed(() => Math.max(1, Math.ceil(allProducts.value.length / 4)))
  const totalStoreSlides = computed(() => Math.max(1, Math.ceil(allStores.value.length / 3)))
  const totalEngineerSlides = computed(() => Math.max(1, Math.ceil(allEngineers.value.length / 3)))

  // مؤقت التدوير التلقائي (10 ثواني بالضبط)
  const ROTATE_INTERVAL_SECONDS = 10
  const secondsLeft = ref(ROTATE_INTERVAL_SECONDS)
  let intervalTimer: ReturnType<typeof setInterval> | null = null

  function mapProduct(item: any): VisitorProductItem {
    const mp = item.master_product || item.masterProduct || {}
    const brand = mp.brand?.name || 'علامة معتمدة'
    const category = mp.category?.name_ar || mp.category?.name_en || mp.category?.name || 'طاقة شمسية'
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
      warrantyPeriod: item.warranty_period ? `ضمان ${item.warranty_period}` : 'ضمان رسمي معتمد',
      governorateName: item.governorate?.name_ar || item.governorate?.name_en || 'صنعاء',
      storeName: item.store?.company_name || 'متجر معتمد',
      storeId: item.store?.id,
      rating: 4.85,
      reviewsCount: 20 + ((item.id * 11) % 80),
    }
  }

  function mapStore(item: any): VisitorStoreItem {
    const rawLogo = item.company_logo_url || item.company_logo_path
    return {
      id: item.id,
      companyName: item.company_name || 'متجر معتمد',
      governorateName: item.governorate_name || item.governorate?.name_ar || item.governorate?.name_en || 'صنعاء',
      addressDetails: item.address_details || 'الجمهورية اليمنية',
      bio: item.bio || 'موزع ووكيل معتمد لمهمات ومنظومات الطاقة الشمسية والحلول الكهروضوئية باليمن.',
      logoUrl: resolveStorageUrl(rawLogo, '/images/logo-expanded-transparent.png'),
      storeType: item.store_type || 'وكيل وموزع رئيسي',
      rating: item.average_rating ? Number(item.average_rating) : 4.85,
      ratingsCount: item.ratings_count ? Number(item.ratings_count) : 28,
      whatsappNumber: item.whatsapp_number,
      productsCount: item.store_products_count || 14 + ((item.id * 7) % 30),
      tags: ['ألواح شمسية', 'إنفرترات هجينة', 'بطاريات ليثيوم'],
    }
  }

  function mapEngineer(item: any): VisitorEngineerItem {
    const rawPhoto = item.profile_photo_path || item.cv_url
    const rawSpecs = Array.isArray(item.specializations) && item.specializations.length > 0
      ? item.specializations.map((s: any) => s.name_ar || s.name || s).join('، ')
      : item.specialization || 'تصميم ومراجعة منظومات الطاقة الشمسية'

    return {
      id: item.id,
      name: item.name || item.user?.name || 'مهندس استشاري',
      specialization: rawSpecs,
      governorateName: item.governorate_name || item.governorate?.name_ar || item.governorate?.name_en || 'صنعاء',
      yearsOfExperience: item.years_of_experience ? Number(item.years_of_experience) : 6,
      bio: item.bio || 'استشاري معتمد في دراسات الجدوى الفنية وقياس الأحمال والإشراف على التركيبات الكهروضوئية.',
      photoUrl: resolveStorageUrl(rawPhoto, '/images/hero-solar.png'),
      rating: item.rating_average ? Number(item.rating_average) : 4.9,
      ratingsCount: item.ratings_count ? Number(item.ratings_count) : 22,
      licenseNumber: item.license_number || `ENG-${item.id}`,
      projectsCount: 15 + ((item.id * 7) % 35),
    }
  }

  function cycleRandomItems() {
    if (allProducts.value.length > 0) {
      if (totalProductSlides.value > 1) {
        let nextIndex = Math.floor(Math.random() * totalProductSlides.value)
        if (nextIndex === productChunkIndex.value) {
          nextIndex = (productChunkIndex.value + 1) % totalProductSlides.value
        }
        productChunkIndex.value = nextIndex
      } else {
        productChunkIndex.value = 0
      }
      displayedProducts.value = getChunkSlice(allProducts.value, productChunkIndex.value, 4)
    }

    if (allStores.value.length > 0) {
      if (totalStoreSlides.value > 1) {
        let nextIndex = Math.floor(Math.random() * totalStoreSlides.value)
        if (nextIndex === storeChunkIndex.value) {
          nextIndex = (storeChunkIndex.value + 1) % totalStoreSlides.value
        }
        storeChunkIndex.value = nextIndex
      } else {
        storeChunkIndex.value = 0
      }
      displayedStores.value = getChunkSlice(allStores.value, storeChunkIndex.value, 3)
    }

    if (allEngineers.value.length > 0) {
      if (totalEngineerSlides.value > 1) {
        let nextIndex = Math.floor(Math.random() * totalEngineerSlides.value)
        if (nextIndex === engineerChunkIndex.value) {
          nextIndex = (engineerChunkIndex.value + 1) % totalEngineerSlides.value
        }
        engineerChunkIndex.value = nextIndex
      } else {
        engineerChunkIndex.value = 0
      }
      displayedEngineers.value = getChunkSlice(allEngineers.value, engineerChunkIndex.value, 3)
    }

    secondsLeft.value = ROTATE_INTERVAL_SECONDS
  }

  function nextProductsSlide() {
    if (allProducts.value.length > 4) {
      productChunkIndex.value = (productChunkIndex.value + 1) % totalProductSlides.value
      displayedProducts.value = getChunkSlice(allProducts.value, productChunkIndex.value, 4)
      secondsLeft.value = ROTATE_INTERVAL_SECONDS
    }
  }

  function prevProductsSlide() {
    if (allProducts.value.length > 4) {
      productChunkIndex.value = (productChunkIndex.value - 1 + totalProductSlides.value) % totalProductSlides.value
      displayedProducts.value = getChunkSlice(allProducts.value, productChunkIndex.value, 4)
      secondsLeft.value = ROTATE_INTERVAL_SECONDS
    }
  }

  function nextStoresSlide() {
    if (allStores.value.length > 3) {
      storeChunkIndex.value = (storeChunkIndex.value + 1) % totalStoreSlides.value
      displayedStores.value = getChunkSlice(allStores.value, storeChunkIndex.value, 3)
      secondsLeft.value = ROTATE_INTERVAL_SECONDS
    }
  }

  function prevStoresSlide() {
    if (allStores.value.length > 3) {
      storeChunkIndex.value = (storeChunkIndex.value - 1 + totalStoreSlides.value) % totalStoreSlides.value
      displayedStores.value = getChunkSlice(allStores.value, storeChunkIndex.value, 3)
      secondsLeft.value = ROTATE_INTERVAL_SECONDS
    }
  }

  function nextEngineersSlide() {
    if (allEngineers.value.length > 3) {
      engineerChunkIndex.value = (engineerChunkIndex.value + 1) % totalEngineerSlides.value
      displayedEngineers.value = getChunkSlice(allEngineers.value, engineerChunkIndex.value, 3)
      secondsLeft.value = ROTATE_INTERVAL_SECONDS
    }
  }

  function prevEngineersSlide() {
    if (allEngineers.value.length > 3) {
      engineerChunkIndex.value = (engineerChunkIndex.value - 1 + totalEngineerSlides.value) % totalEngineerSlides.value
      displayedEngineers.value = getChunkSlice(allEngineers.value, engineerChunkIndex.value, 3)
      secondsLeft.value = ROTATE_INTERVAL_SECONDS
    }
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

  // Non-Blocking SSR via useLazyAsyncData:
  // server: false guarantees instant TTFB (< 50ms) without SSR network pauses.
  // lazy: true ensures hydration proceeds immediately, showing skeletons while data loads in background.
  const { data: landingPayload, pending, error: fetchError, refresh } = useLazyAsyncData(
    'visitor_landing_showcase',
    async () => {
      // 1. Try unified fast showcase endpoint first
      try {
        const res = await $api<any>('/public/landing-showcase')
        const payload = res?.data || res
        if (payload && (payload.products || payload.stores || payload.engineers)) {
          return {
            products: Array.isArray(payload.products) ? payload.products : [],
            stores: Array.isArray(payload.stores) ? payload.stores : [],
            engineers: Array.isArray(payload.engineers) ? payload.engineers : [],
            stats: payload.stats || null,
          }
        }
      } catch {
        // Fallback to individual endpoints
      }

      // 2. Fallback: fetch individual endpoints in parallel with random flag
      const [productsRes, storesRes, engineersRes] = await Promise.allSettled([
        $api<any>('/store-products?per_page=36&random=1'),
        $api<any>('/stores?per_page=12&random=1'),
        $api<any>('/engineers?per_page=12&random=1'),
      ])

      const rawProducts = productsRes.status === 'fulfilled'
        ? (Array.isArray(productsRes.value) ? productsRes.value : productsRes.value?.data || [])
        : []
      const rawStores = storesRes.status === 'fulfilled'
        ? (Array.isArray(storesRes.value) ? storesRes.value : storesRes.value?.data || [])
        : []
      const rawEngineers = engineersRes.status === 'fulfilled'
        ? (Array.isArray(engineersRes.value) ? engineersRes.value : engineersRes.value?.data || [])
        : []

      return {
        products: Array.isArray(rawProducts) ? rawProducts : [],
        stores: Array.isArray(rawStores) ? rawStores : [],
        engineers: Array.isArray(rawEngineers) ? rawEngineers : [],
        stats: null,
      }
    },
    {
      lazy: true,
      server: false,
      default: () => ({ products: [], stores: [], engineers: [], stats: null }),
    }
  )

  // Sync loaded data into reactive state and randomize order across all records
  watch(
    () => landingPayload.value,
    (val) => {
      if (!val) return
      const prods = Array.isArray(val.products) ? val.products : []
      const stores = Array.isArray(val.stores) ? val.stores : []
      const engs = Array.isArray(val.engineers) ? val.engineers : []

      if (prods.length > 0) {
        allProducts.value = shuffleArray(prods.map(mapProduct))
      }
      if (stores.length > 0) {
        allStores.value = shuffleArray(stores.map(mapStore))
      }
      if (engs.length > 0) {
        allEngineers.value = shuffleArray(engs.map(mapEngineer))
      }
      if (val.stats) {
        backendStats.value = val.stats
      }

      productChunkIndex.value = 0
      storeChunkIndex.value = 0
      engineerChunkIndex.value = 0
      displayedProducts.value = getChunkSlice(allProducts.value, 0, 4)
      displayedStores.value = getChunkSlice(allStores.value, 0, 3)
      displayedEngineers.value = getChunkSlice(allEngineers.value, 0, 3)

      if (import.meta.client && (prods.length > 0 || stores.length > 0 || engs.length > 0)) {
        startRotationTimer()
      }
    },
    { immediate: true }
  )

  // Loading state: true while pending AND no items have been populated yet
  const isLoading = computed(() => {
    if (allProducts.value.length > 0 || allStores.value.length > 0 || allEngineers.value.length > 0) {
      return false
    }
    return pending.value
  })

  // Error message formatting
  const errorMessage = computed(() => {
    if (fetchError.value) {
      return (fetchError.value as any)?.message || 'تعذر الاتصال بالخادم لجلب بيانات المنصة.'
    }
    return ''
  })

  // إحصائيات المنصة الحية
  const stats = computed<PlatformStats>(() => ({
    totalProducts: backendStats.value?.totalProducts || (allProducts.value.length > 0 ? allProducts.value.length : 80),
    totalStores: backendStats.value?.totalStores || (allStores.value.length > 0 ? allStores.value.length : 12),
    totalEngineers: backendStats.value?.totalEngineers || (allEngineers.value.length > 0 ? allEngineers.value.length : 14),
  }))

  async function fetchVisitorData() {
    return refresh()
  }

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
    productChunkIndex,
    storeChunkIndex,
    engineerChunkIndex,
    totalProductSlides,
    totalStoreSlides,
    totalEngineerSlides,
    isLoading,
    errorMessage,
    secondsLeft,
    stats,
    fetchVisitorData,
    cycleRandomItems,
    nextProductsSlide,
    prevProductsSlide,
    nextStoresSlide,
    prevStoresSlide,
    nextEngineersSlide,
    prevEngineersSlide,
  }
}
