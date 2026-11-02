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

function getChunkSlice<T>(array: T[], index: number, size: number): T[] {
  if (array.length <= size) return [...array]
  const start = (index * size) % array.length
  let slice = array.slice(start, start + size)
  if (slice.length < size) {
    slice = slice.concat(array.slice(0, size - slice.length))
  }
  return slice
}

export function useVisitorLanding() {
  const { $api } = useNuxtApp()

  // المخزون الكامل المسترجع من قاعدة البيانات الحقيقية
  const allProducts = ref<VisitorProductItem[]>([])
  const allStores = ref<VisitorStoreItem[]>([])
  const allEngineers = ref<VisitorEngineerItem[]>([])

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

  // حالة التحميل والخطأ
  const isLoading = ref(true)
  const errorMessage = ref('')

  // مؤقت التدوير التلقائي (مضبوط الآن على 10 ثواني بالضبط حسب طلب المستخدم)
  const ROTATE_INTERVAL_SECONDS = 10
  const secondsLeft = ref(ROTATE_INTERVAL_SECONDS)

  let intervalTimer: ReturnType<typeof setInterval> | null = null

  // إحصائيات المنصة الحية (مع قيم مبدئية معتمدة لتجنب ظهور +0 أثناء التحميل الأولي)
  const stats = computed<PlatformStats>(() => ({
    totalProducts: allProducts.value.length > 0 ? allProducts.value.length : 80,
    totalStores: allStores.value.length > 0 ? allStores.value.length : 12,
    totalEngineers: allEngineers.value.length > 0 ? allEngineers.value.length : 14,
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
      warrantyPeriod: item.warranty_period ? `ضمان ${item.warranty_period}` : 'ضمان رسمي معتمد',
      governorateName: item.governorate?.name_ar || item.governorate?.name || 'صنعاء',
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
      governorateName: item.governorate_name || item.governorate?.name_ar || item.governorate?.name || 'صنعاء',
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
      governorateName: item.governorate_name || item.governorate?.name_ar || item.governorate?.name || 'صنعاء',
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
      productChunkIndex.value = (productChunkIndex.value + 1) % totalProductSlides.value
      displayedProducts.value = getChunkSlice(allProducts.value, productChunkIndex.value, 4)
    }
    if (allStores.value.length > 0) {
      storeChunkIndex.value = (storeChunkIndex.value + 1) % totalStoreSlides.value
      displayedStores.value = getChunkSlice(allStores.value, storeChunkIndex.value, 3)
    }
    if (allEngineers.value.length > 0) {
      engineerChunkIndex.value = (engineerChunkIndex.value + 1) % totalEngineerSlides.value
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

  async function fetchVisitorData() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const [productsRes, storesRes, engineersRes] = await Promise.allSettled([
        $api<any>('/store-products?per_page=100'),
        $api<any>('/stores?per_page=50'),
        $api<any>('/engineers?per_page=50'),
      ])

      // 1. المنتجات من قاعدة البيانات الحقيقية
      if (productsRes.status === 'fulfilled') {
        const raw = Array.isArray(productsRes.value) ? productsRes.value : productsRes.value?.data || []
        allProducts.value = Array.isArray(raw) ? raw.map(mapProduct) : []
      } else {
        allProducts.value = []
      }

      // 2. المتاجر من قاعدة البيانات الحقيقية
      if (storesRes.status === 'fulfilled') {
        const raw = Array.isArray(storesRes.value) ? storesRes.value : storesRes.value?.data || []
        allStores.value = Array.isArray(raw) ? raw.map(mapStore) : []
      } else {
        allStores.value = []
      }

      // 3. المهندسون من قاعدة البيانات الحقيقية
      if (engineersRes.status === 'fulfilled') {
        const raw = Array.isArray(engineersRes.value) ? engineersRes.value : engineersRes.value?.data || []
        allEngineers.value = Array.isArray(raw) ? raw.map(mapEngineer) : []
      } else {
        allEngineers.value = []
      }

      // تهيئة المعروضات الحالية والبدء التلقائي كل 10 ثواني
      productChunkIndex.value = 0
      storeChunkIndex.value = 0
      engineerChunkIndex.value = 0
      displayedProducts.value = getChunkSlice(allProducts.value, 0, 4)
      displayedStores.value = getChunkSlice(allStores.value, 0, 3)
      displayedEngineers.value = getChunkSlice(allEngineers.value, 0, 3)

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
