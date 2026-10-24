import type { Brand, Category, Governorate, MasterProduct, PaginationMeta, StoreProduct } from '../../types/api'
import type { Product } from '~~/types/ecommerce'

export interface CustomerProductView {
  id: number | string // store_product_id (or master_product_id if fallback)
  storeProductId?: number
  masterProductId: number
  name: string
  category: string
  categoryType: 'panel' | 'inverter' | 'battery' | 'pump' | 'controller' | 'accessories'
  brand: string
  model: string
  storeId?: number
  storeName: string
  storeCity: string
  storeRating?: number
  price: number
  currency: string
  rating: number
  reviewsCount: number
  image: string
  images: string[]
  badge?: string
  specs: Record<string, string>
  stockQuantity: number
  minOrderQty: number
  warrantyPeriod?: string
  inStock: boolean
  isQuoteOnly: boolean
  datasheetUrl?: string | null
  description?: string | null
}

export interface StoreOfferItem {
  id: number // store_product_id
  storeId: number
  storeName: string
  storeCity: string
  storeLogo?: string | null
  price: number
  stockQuantity: number
  minOrderQty: number
  warrantyPeriod?: string | null
  status: string
}

function resolveCategoryType(name?: string, slug?: string): CustomerProductView['categoryType'] {
  const text = `${name || ''} ${slug || ''}`.toLowerCase()
  if (text.includes('panel') || text.includes('ألو') || text.includes('لوح')) return 'panel'
  if (text.includes('invert') || text.includes('محو') || text.includes('هجين')) return 'inverter'
  if (text.includes('batter') || text.includes('بطار') || text.includes('ليث')) return 'battery'
  if (text.includes('pump') || text.includes('مضخ')) return 'pump'
  if (text.includes('control') || text.includes('منظم') || text.includes('mppt')) return 'controller'
  return 'accessories'
}

function resolveFallbackImage(type: CustomerProductView['categoryType']): string {
  switch (type) {
    case 'panel':
      return '/images/product-panel.png'
    case 'inverter':
      return '/images/product-inverter.png'
    case 'battery':
      return '/images/product-battery.png'
    case 'pump':
      return '/images/hero-solar.png'
    default:
      return '/images/product-kit.png'
  }
}

export const useCustomerProducts = () => {
  const { $api } = useNuxtApp()

  const categories = useState<Category[]>('customer_catalog_categories', () => [])
  const brands = useState<Brand[]>('customer_catalog_brands', () => [])
  const governorates = useState<Governorate[]>('customer_catalog_governorates', () => [])

  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * جلب التصنيفات
   */
  const fetchCategories = async (): Promise<Category[]> => {
    if (categories.value.length > 0) return categories.value
    try {
      const res: any = await $api('/categories')
      categories.value = Array.isArray(res) ? res : (res?.data || [])
      return categories.value
    } catch (err: any) {
      console.error('Failed to load categories:', err)
      return []
    }
  }

  /**
   * جلب الماركات / العلامات التجارية
   */
  const fetchBrands = async (): Promise<Brand[]> => {
    if (brands.value.length > 0) return brands.value
    try {
      const res: any = await $api('/brands')
      brands.value = Array.isArray(res) ? res : (res?.data || [])
      return brands.value
    } catch (err: any) {
      console.error('Failed to load brands:', err)
      return []
    }
  }

  /**
   * جلب المحافظات / المناطق
   */
  const fetchGovernorates = async (): Promise<Governorate[]> => {
    if (governorates.value.length > 0) return governorates.value
    try {
      const res: any = await $api('/governorates')
      governorates.value = Array.isArray(res) ? res : (res?.data || [])
      return governorates.value
    } catch (err: any) {
      console.error('Failed to load governorates:', err)
      return []
    }
  }

  /**
   * تحويل StoreProduct أو MasterProduct إلى كائن عرض موحد CustomerProductView
   */
  const mapStoreProductToView = (sp: any): CustomerProductView => {
    const mp = sp.master_product || sp.masterProduct || {}
    const catName = mp.category?.name_ar || mp.category?.name_en || 'معدات طاقة شمسية'
    const catType = resolveCategoryType(catName, mp.category?.slug)
    const brandName = mp.brand?.name || 'SolarHub Tier 1'

    const imagesList: string[] = []
    if (Array.isArray(mp.images)) {
      mp.images.forEach((img: any) => {
        const u = img.url || img.image_url || img.image_path
        if (u && typeof u === 'string') {
          imagesList.push(u)
        }
      })
    }
    const featuredImg = Array.isArray(mp.images) ? mp.images.find((i: any) => i.is_featured) : null
    let imageUrl = featuredImg?.url || featuredImg?.image_url || imagesList[0] || resolveFallbackImage(catType)
    if (imagesList.length === 0) {
      imagesList.push(imageUrl)
    }

    const price = Number(sp.price) || 0
    const stockQty = Number(sp.stock_quantity) || 0
    const minQty = Number(sp.min_order_qty) || 1
    const inStock = stockQty > 0 && sp.status === 'active'

    const specsRecord: Record<string, string> = {}
    if (Array.isArray(mp.specifications)) {
      mp.specifications.forEach((s: any) => {
        if (s.name && s.value) {
          specsRecord[s.name] = `${s.value} ${s.unit || ''}`.trim()
        }
      })
    }

    return {
      id: sp.id, // Store Product ID (ready for cart and RFQ)
      storeProductId: sp.id,
      masterProductId: mp.id || sp.master_product_id,
      name: mp.title || 'منتج طاقة شمسية معتمد',
      category: catName,
      categoryType: catType,
      brand: brandName,
      model: mp.model_number || 'معتمد قياسياً',
      storeId: sp.store?.id,
      storeName: sp.store?.company_name || 'وكيل معتمد',
      storeCity: sp.governorate?.name_ar || 'اليمن',
      storeRating: 4.9,
      price,
      currency: 'ر.س',
      rating: 4.9,
      reviewsCount: 38,
      image: imageUrl,
      images: imagesList,
      badge: sp.warranty_period ? `ضمان ${sp.warranty_period}` : 'Tier 1 Global',
      specs: specsRecord,
      stockQuantity: stockQty,
      minOrderQty: minQty,
      warrantyPeriod: sp.warranty_period,
      inStock,
      isQuoteOnly: price <= 0,
      datasheetUrl: mp.datasheet_url,
      description: mp.description,
    }
  }

  /**
   * تحويل MasterProduct إلى كائن عرض
   */
  const mapMasterProductToView = (mp: any): CustomerProductView => {
    const catName = mp.category?.name_ar || mp.category?.name_en || 'معدات طاقة شمسية'
    const catType = resolveCategoryType(catName, mp.category?.slug)
    const brandName = mp.brand?.name || 'علامة معتمدة'

    const imagesList: string[] = []
    if (Array.isArray(mp.images)) {
      mp.images.forEach((img: any) => {
        const u = img.url || img.image_url || img.image_path
        if (u && typeof u === 'string') {
          imagesList.push(u)
        }
      })
    }
    const featuredImg = Array.isArray(mp.images) ? mp.images.find((i: any) => i.is_featured) : null
    let imageUrl = featuredImg?.url || featuredImg?.image_url || imagesList[0] || resolveFallbackImage(catType)
    if (imagesList.length === 0) {
      imagesList.push(imageUrl)
    }

    const specsRecord: Record<string, string> = {}
    if (Array.isArray(mp.specifications)) {
      mp.specifications.forEach((s: any) => {
        if (s.name && s.value) {
          specsRecord[s.name] = `${s.value} ${s.unit || ''}`.trim()
        }
      })
    }

    return {
      id: mp.id,
      masterProductId: mp.id,
      name: mp.title || 'منتج طاقة شمسية',
      category: catName,
      categoryType: catType,
      brand: brandName,
      model: mp.model_number || 'موديل قياسي',
      storeName: mp.stores_count ? `${mp.stores_count} متاجر توفره` : 'متاح للطلب',
      storeCity: 'كافة المحافظات',
      price: 0,
      currency: 'ر.س',
      rating: 4.8,
      reviewsCount: 24,
      image: imageUrl,
      images: imagesList,
      badge: mp.stores_count ? `${mp.stores_count} عروض متاحة` : 'كتالوج SolarHub',
      specs: specsRecord,
      stockQuantity: 100,
      minOrderQty: 1,
      inStock: true,
      isQuoteOnly: true,
      datasheetUrl: mp.datasheet_url,
      description: mp.description,
    }
  }

  /**
   * جلب منتجات المتاجر المتاحة (Store Products)
   */
  const fetchStoreProducts = async (filters: {
    governorate_id?: number | string | null
    category_id?: number | string | null
    store_id?: number | string | null
  } = {}): Promise<CustomerProductView[]> => {
    try {
      const query: Record<string, any> = { per_page: 100 }
      if (filters.governorate_id && filters.governorate_id !== 'all') query.governorate_id = filters.governorate_id
      if (filters.category_id && filters.category_id !== 'all') query.category_id = filters.category_id
      if (filters.store_id && filters.store_id !== 'all') query.store_id = filters.store_id

      const res: any = await $api('/store-products', { query })
      const list = Array.isArray(res) ? res : (res?.data || [])
      return list.map(mapStoreProductToView)
    } catch (err: any) {
      console.error('Failed to load store products:', err)
      return []
    }
  }

  /**
   * جلب منتجات الكتالوج المرجعي (Master Products)
   */
  const fetchMasterProducts = async (params: {
    page?: number
    per_page?: number
    category_id?: number | string | null
    brand_id?: number | string | null
    search?: string
  } = {}): Promise<{ products: CustomerProductView[]; meta: PaginationMeta }> => {
    try {
      const perPage = params.per_page || 12
      const query: Record<string, any> = { per_page: perPage }
      if (params.page) query.page = params.page
      if (params.category_id && params.category_id !== 'all') query.category_id = params.category_id
      if (params.brand_id && params.brand_id !== 'all') query.brand_id = params.brand_id
      if (params.search && params.search.trim()) query.search = params.search.trim()

      const res: any = await $api('/master-products', { query })
      const list: any[] = Array.isArray(res) ? res : (res?.data || [])

      const currentPage = Number(res?.meta?.current_page || params.page || 1)
      const total = Number(res?.meta?.total ?? list.length)
      const lastPage = Number(res?.meta?.last_page || Math.ceil(total / perPage) || 1)

      const meta: PaginationMeta = {
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPage,
        total,
      }

      return {
        products: list.map(mapMasterProductToView),
        meta,
      }
    } catch (err: any) {
      console.error('Failed to load master products:', err)
      return {
        products: [],
        meta: { current_page: 1, last_page: 1, per_page: 12, total: 0 },
      }
    }
  }

  /**
   * جلب تفاصيل منتج محدد مع كافة عروض المتاجر المتاحة له
   */
  const fetchProductDetails = async (
    id: string | number
  ): Promise<{
    product: CustomerProductView
    offers: StoreOfferItem[]
    selectedOfferId?: number
  } | null> => {
    isLoading.value = true
    error.value = null

    try {
      let storeProduct: any = null
      let masterProduct: any = null
      let allStoreProducts: any[] = []

      // أولاً: نحاول جلبه كـ store-product
      try {
        const spRes: any = await $api(`/store-products/${id}`)
        storeProduct = spRes?.data || spRes
      } catch {
        // ليس store_product أو لا يمكن الوصول إليه مباشرة
      }

      // جلب كافة عروض المتاجر لمقارنة العروض المتاحة لنفس المنتج
      try {
        const allSpRes: any = await $api('/store-products?per_page=100')
        allStoreProducts = Array.isArray(allSpRes) ? allSpRes : (allSpRes?.data || [])
      } catch {
        allStoreProducts = []
      }

      if (storeProduct) {
        masterProduct = storeProduct.master_product || storeProduct.masterProduct
        const masterId = masterProduct?.id || storeProduct.master_product_id

        // جلب تفاصيل المواصفات الفنية والصور الكاملة من master-product إن لم تكن مكتملة
        if (masterId && (!masterProduct?.specifications || masterProduct.specifications.length === 0 || !masterProduct?.images || masterProduct.images.length === 0)) {
          try {
            const mpRes: any = await $api(`/master-products/${masterId}`)
            const fullMp = mpRes?.data || mpRes
            if (fullMp?.specifications) {
              masterProduct.specifications = fullMp.specifications
            }
            if (fullMp?.images?.length) {
              masterProduct.images = fullMp.images
            }
            if (fullMp?.datasheet_url) {
              masterProduct.datasheet_url = fullMp.datasheet_url
            }
          } catch {
            /* ignore */
          }
        }
        storeProduct.master_product = masterProduct

        // تصفية كافة عروض المتاجر التي توفر هذا الموديل / المنتج
        const matchingOffers: StoreOfferItem[] = allStoreProducts
          .filter((item: any) => {
            const itemMpId = item.master_product?.id || item.master_product_id || item.masterProduct?.id
            return Number(itemMpId) === Number(masterId)
          })
          .map((item: any) => ({
            id: item.id,
            storeId: item.store?.id || 0,
            storeName: item.store?.company_name || 'وكيل معتمد',
            storeCity: item.governorate?.name_ar || 'اليمن',
            storeLogo: item.store?.company_logo_path,
            price: Number(item.price) || 0,
            stockQuantity: Number(item.stock_quantity) || 0,
            minOrderQty: Number(item.min_order_qty) || 1,
            warrantyPeriod: item.warranty_period,
            status: item.status,
          }))

        // إذا لم يكن العرض الحالي ضمن القائمة نضيفه
        if (!matchingOffers.some(o => o.id === storeProduct.id)) {
          matchingOffers.unshift({
            id: storeProduct.id,
            storeId: storeProduct.store?.id || 0,
            storeName: storeProduct.store?.company_name || 'وكيل معتمد',
            storeCity: storeProduct.governorate?.name_ar || 'اليمن',
            storeLogo: storeProduct.store?.company_logo_path,
            price: Number(storeProduct.price) || 0,
            stockQuantity: Number(storeProduct.stock_quantity) || 0,
            minOrderQty: Number(storeProduct.min_order_qty) || 1,
            warrantyPeriod: storeProduct.warranty_period,
            status: storeProduct.status,
          })
        }

        const viewProduct = mapStoreProductToView(storeProduct)

        return {
          product: viewProduct,
          offers: matchingOffers,
          selectedOfferId: storeProduct.id,
        }
      }

      // ثانياً: إذا لم يكن store-product نحاول جلبه كـ master-product
      try {
        const mpRes: any = await $api(`/master-products/${id}`)
        masterProduct = mpRes?.data || mpRes
      } catch {
        masterProduct = null
      }

      if (!masterProduct) {
        error.value = 'المنتج غير موجود أو تم إلغاء تفعيله.'
        return null
      }

      // البحث عن أي عروض متاجر توفر هذا الـ MasterProduct
      const matchingOffers: StoreOfferItem[] = allStoreProducts
        .filter((item: any) => {
          const itemMpId = item.master_product?.id || item.master_product_id || item.masterProduct?.id
          return Number(itemMpId) === Number(masterProduct.id)
        })
        .map((item: any) => ({
          id: item.id,
          storeId: item.store?.id || 0,
          storeName: item.store?.company_name || 'وكيل معتمد',
          storeCity: item.governorate?.name_ar || 'اليمن',
          storeLogo: item.store?.company_logo_path,
          price: Number(item.price) || 0,
          stockQuantity: Number(item.stock_quantity) || 0,
          minOrderQty: Number(item.min_order_qty) || 1,
          warrantyPeriod: item.warranty_period,
          status: item.status,
        }))

      // إذا كان هناك عروض متاجر، نستخدم العرض الأول كأساس
      let viewProduct: CustomerProductView
      if (matchingOffers.length > 0 && matchingOffers[0]) {
        const firstOffer = matchingOffers[0]
        const matchingSp = allStoreProducts.find((i: any) => i.id === firstOffer.id)
        viewProduct = mapStoreProductToView(matchingSp || { ...masterProduct, price: firstOffer.price, id: firstOffer.id })
      } else {
        viewProduct = mapMasterProductToView(masterProduct)
      }

      return {
        product: viewProduct,
        offers: matchingOffers,
        selectedOfferId: matchingOffers[0]?.id,
      }
    } catch (err: any) {
      error.value = err?.userMessage || err?.message || 'تعذر تحميل بيانات المنتج.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * إرسال طلب عرض سعر مخصص (RFQ)
   */
  const sendQuoteRequest = async (data: {
    store_product_id: number
    quantity: number
    customer_target_price?: number | null
    customer_notes?: string | null
  }) => {
    isActionLoading.value = true
    try {
      const payload: Record<string, any> = {
        store_product_id: Number(data.store_product_id),
        quantity: Number(data.quantity) || 1,
      }
      if (data.customer_target_price) {
        payload.customer_target_price = Number(data.customer_target_price)
      }
      if (data.customer_notes?.trim()) {
        payload.customer_notes = data.customer_notes.trim()
      }

      const res: any = await $api('/quote-requests', {
        method: 'POST',
        body: payload,
      })

      return res
    } finally {
      isActionLoading.value = false
    }
  }

  return {
    categories,
    brands,
    governorates,
    isLoading,
    isActionLoading,
    error,
    fetchCategories,
    fetchBrands,
    fetchGovernorates,
    fetchStoreProducts,
    fetchMasterProducts,
    fetchProductDetails,
    sendQuoteRequest,
    mapStoreProductToView,
    mapMasterProductToView,
  }
}
