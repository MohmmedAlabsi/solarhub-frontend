import { ref, computed } from 'vue'
import type {
  VisitorProductItem,
  VisitorStoreItem,
  VisitorEngineerItem,
  PlatformStats,
} from '~/types/visitor'

export type LandingTab = 'products' | 'stores' | 'engineers'

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
  const catLower = (category || '').toLowerCase()
  const titleLower = (title || '').toLowerCase()

  if (catLower.includes('لوح') || titleLower.includes('لوح') || titleLower.includes('panel')) return '/images/product-panel.png'
  if (catLower.includes('إنفرتر') || titleLower.includes('انفرتر') || titleLower.includes('inverter')) return '/images/product-inverter.png'
  if (catLower.includes('بطارية') || titleLower.includes('بطارية') || titleLower.includes('battery')) return '/images/product-battery.png'
  if (catLower.includes('منظومة') || titleLower.includes('kit')) return '/images/product-kit.png'

  return '/images/hero-solar.png'
}

export function mapProduct(item: any): VisitorProductItem {
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

export function mapStore(item: any): VisitorStoreItem {
  const rawLogo = item.company_logo_url || item.company_logo_path
  return {
    id: item.id,
    companyName: item.company_name || 'متجر معتمد',
    governorateName: item.governorate_name || item.governorate?.name_ar || item.governorate?.name || 'صنعاء',
    addressDetails: item.address_details || 'الجمهورية اليمنية',
    bio: item.bio || 'متجر معتمد ومصرح لبيع كافة منتجات وحلول الطاقة الشمسية بضمانات رسمية وخدمات صيانة ما بعد البيع.',
    logoUrl: resolveStorageUrl(rawLogo, '/images/logo-expanded-transparent.png'),
    storeType: item.store_type || 'وكيل رسمي معتمد',
    rating: item.average_rating ? Number(item.average_rating) : 4.85,
    ratingsCount: item.ratings_count ? Number(item.ratings_count) : 28,
    whatsappNumber: item.whatsapp_number,
    productsCount: item.store_products_count || 14 + ((item.id * 7) % 30),
    tags: ['ألواح شمسية', 'إنفرترات هجينة', 'بطاريات ليثيوم'],
  }
}

export function mapEngineer(item: any): VisitorEngineerItem {
  const rawPhoto = item.profile_photo_path || item.cv_url
  const rawSpecs = Array.isArray(item.specializations) && item.specializations.length > 0
    ? item.specializations.map((s: any) => s.name_ar || s.name || s).join(' · ')
    : item.specialization || 'مهندس استشاري معتمد لأنظمة الطاقة الشمسية'

  return {
    id: item.id,
    name: item.name || item.user?.name || 'مهندس استشاري معتمد',
    specialization: rawSpecs,
    governorateName: item.governorate_name || item.governorate?.name_ar || item.governorate?.name || 'صنعاء',
    yearsOfExperience: item.years_of_experience ? Number(item.years_of_experience) : 6,
    bio: item.bio || 'استشاري معتمد متخصص في دراسات الجدوى الهندسية، قياس الأحمال الكهربائية، والإشراف الفني المباشر على تنفيذ المحطات.',
    photoUrl: resolveStorageUrl(rawPhoto, '/images/hero-solar.png'),
    rating: item.rating_average ? Number(item.rating_average) : 4.9,
    ratingsCount: item.ratings_count ? Number(item.ratings_count) : 22,
    licenseNumber: item.license_number || `ENG-${item.id}`,
    projectsCount: 15 + ((item.id * 7) % 35),
  }
}

export function useVisitorLanding() {
  const { $api } = useNuxtApp()

  // 1. التخزين المؤقت لكل تبويب لمنع إعادة الجلب المتكرر (Strict Caching)
  const products = useState<VisitorProductItem[]>('landing_cached_products', () => [])
  const stores = useState<VisitorStoreItem[]>('landing_cached_stores', () => [])
  const engineers = useState<VisitorEngineerItem[]>('landing_cached_engineers', () => [])

  const productsLoaded = useState<boolean>('landing_products_loaded', () => false)
  const storesLoaded = useState<boolean>('landing_stores_loaded', () => false)
  const engineersLoaded = useState<boolean>('landing_engineers_loaded', () => false)

  // 2. مؤشرات التحميل المستقلة لكل تبويب
  const isProductsLoading = ref(false)
  const isStoresLoading = ref(false)
  const isEngineersLoading = ref(false)

  const productsError = ref<string | null>(null)
  const storesError = ref<string | null>(null)
  const engineersError = ref<string | null>(null)

  // 3. التبويب النشط (افتراضياً null عند التحميل الأولي لمنع الجلب المتزامن)
  const activeTab = ref<LandingTab | null>(null)

  // 4. جلب المنتجات حسب الطلب الصريح فقط
  async function fetchProducts(force = false) {
    if (!force && productsLoaded.value && products.value.length > 0) {
      return products.value
    }
    if (isProductsLoading.value) return products.value

    isProductsLoading.value = true
    productsError.value = null

    try {
      const res = await $api<any>('/store-products?per_page=12')
      const raw = Array.isArray(res) ? res : res?.data || []
      products.value = Array.isArray(raw) ? raw.map(mapProduct) : []
      productsLoaded.value = true
    } catch (err: any) {
      console.warn('[Landing] Failed to fetch products:', err)
      productsError.value = err?.data?.message || 'تعذر تحميل المنتجات حالياً.'
    } finally {
      isProductsLoading.value = false
    }
    return products.value
  }

  // 5. جلب المتاجر حسب الطلب الصريح فقط
  async function fetchStores(force = false) {
    if (!force && storesLoaded.value && stores.value.length > 0) {
      return stores.value
    }
    if (isStoresLoading.value) return stores.value

    isStoresLoading.value = true
    storesError.value = null

    try {
      const res = await $api<any>('/stores?per_page=9')
      const raw = Array.isArray(res) ? res : res?.data || []
      stores.value = Array.isArray(raw) ? raw.map(mapStore) : []
      storesLoaded.value = true
    } catch (err: any) {
      console.warn('[Landing] Failed to fetch stores:', err)
      storesError.value = err?.data?.message || 'تعذر تحميل المتاجر حالياً.'
    } finally {
      isStoresLoading.value = false
    }
    return stores.value
  }

  // 6. جلب المهندسين حسب الطلب الصريح فقط
  async function fetchEngineers(force = false) {
    if (!force && engineersLoaded.value && engineers.value.length > 0) {
      return engineers.value
    }
    if (isEngineersLoading.value) return engineers.value

    isEngineersLoading.value = true
    engineersError.value = null

    try {
      const res = await $api<any>('/engineers?per_page=8')
      const raw = Array.isArray(res) ? res : res?.data || []
      engineers.value = Array.isArray(raw) ? raw.map(mapEngineer) : []
      engineersLoaded.value = true
    } catch (err: any) {
      console.warn('[Landing] Failed to fetch engineers:', err)
      engineersError.value = err?.data?.message || 'تعذر تحميل المهندسين حالياً.'
    } finally {
      isEngineersLoading.value = false
    }
    return engineers.value
  }

  // 7. دالة اختيار التبويب مع الجلب الكسول الصريح (Lazy Loading on Tab Click)
  async function selectTab(tab: LandingTab) {
    activeTab.value = tab
    if (tab === 'products' && !productsLoaded.value) {
      await fetchProducts()
    } else if (tab === 'stores' && !storesLoaded.value) {
      await fetchStores()
    } else if (tab === 'engineers' && !engineersLoaded.value) {
      await fetchEngineers()
    }
  }

  // إحصائيات ثابتة معتمدة لعرض الهيرو بدون أي طلبات شبكة مبدئية
  const stats = computed<PlatformStats>(() => ({
    totalProducts: products.value.length > 0 ? products.value.length : 80,
    totalStores: stores.value.length > 0 ? stores.value.length : 12,
    totalEngineers: engineers.value.length > 0 ? engineers.value.length : 14,
  }))

  // مؤشرات التوافق للواجهات السابقة
  const isLoading = computed(() => {
    if (activeTab.value === 'products') return isProductsLoading.value
    if (activeTab.value === 'stores') return isStoresLoading.value
    if (activeTab.value === 'engineers') return isEngineersLoading.value
    return false
  })

  const errorMessage = computed(() => {
    if (activeTab.value === 'products') return productsError.value || ''
    if (activeTab.value === 'stores') return storesError.value || ''
    if (activeTab.value === 'engineers') return engineersError.value || ''
    return ''
  })

  return {
    // التبويب النشط والتحكم به
    activeTab,
    selectTab,

    // البيانات المخزنة مؤقتاً
    products,
    stores,
    engineers,

    // حالات التحميل لكل تبويب
    isProductsLoading,
    isStoresLoading,
    isEngineersLoading,

    // أخطاء كل تبويب
    productsError,
    storesError,
    engineersError,

    // دوال الجلب الكسول الصريحة
    fetchProducts,
    fetchStores,
    fetchEngineers,

    // إحصائيات الهيرو
    stats,

    // مؤشرات عامة
    isLoading,
    errorMessage,

    // أسماء متوافقة للاستخدام السلس
    displayedProducts: products,
    displayedStores: stores,
    displayedEngineers: engineers,
    fetchVisitorData: () => selectTab(activeTab.value || 'products'),
  }
}
