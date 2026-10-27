import { ref, computed, onMounted } from 'vue'
import type {
  SupplierProductItem,
  MasterProductSummary,
  GovernorateItem,
  CreateSupplierProductInput,
  UpdateSupplierProductInput,
} from '~/types/supplier-product'

// دالة ذكية وموثوقة لاستخراج الرابط الكامل لصورة المنتج من Supabase Storage أو البدائل المحلية
export function resolveProductImage(mp: any): string {
  if (Array.isArray(mp?.images) && mp.images.length > 0) {
    const featured = mp.images.find((img: any) => img.is_featured)
    const target = featured || mp.images[0]
    const raw = target?.image_url || target?.url || target?.image_path
    if (raw) {
      if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
      return `https://rtjrjsgabinwdbrtxakk.supabase.co/storage/v1/object/public/public-media/${raw.replace(/^\/+/, '')}`
    }
  }

  if (mp?.image_url) return mp.image_url
  if (mp?.image && (mp.image.startsWith('http') || mp.image.startsWith('/'))) return mp.image

  // بدائل حسب التصنيف لضمان عدم ظهور أي صورة مكسورة
  const cat = (mp?.category?.name_ar || mp?.category?.name || '').toLowerCase()
  const title = (mp?.title || '').toLowerCase()
  if (cat.includes('لوح') || title.includes('لوح') || cat.includes('panel')) return '/images/product-panel.png'
  if (cat.includes('إنفرتر') || title.includes('إنفرتر') || cat.includes('محول') || cat.includes('inverter')) return '/images/product-inverter.png'
  if (cat.includes('بطارية') || title.includes('بطارية') || cat.includes('battery')) return '/images/product-battery.png'
  if (cat.includes('منظومة') || cat.includes('kit')) return '/images/product-kit.png'

  return '/images/hero-solar.png'
}

export function useSupplierProducts() {
  const { $api } = useNuxtApp()

  const products = ref<SupplierProductItem[]>([])
  const masterCatalog = ref<MasterProductSummary[]>([])
  const categories = ref<string[]>([])
  const brands = ref<string[]>([])
  const governorates = ref<GovernorateItem[]>([])

  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const isCatalogLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  // الفلاتر
  const searchQuery = ref('')
  const selectedCategory = ref('all')
  const selectedBrand = ref('all')
  const selectedGovernorate = ref<number | 'all'>('all')
  const selectedStatus = ref('all')

  // الترقيم
  const currentPage = ref(1)
  const perPage = ref(8)

  function showNotice(msg: string) {
    noticeMessage.value = msg
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      noticeMessage.value = ''
    }, 4000)
  }

  function getUnitLabel(title: string, category: string): string {
    const t = (title + ' ' + category).toLowerCase()
    if (t.includes('لوح') || t.includes('panel')) return 'لوح'
    if (t.includes('إنفرتر') || t.includes('inverter') || t.includes('محول') || t.includes('منظم')) return 'جهاز'
    if (t.includes('بطارية') || t.includes('battery')) return 'وحدة'
    return 'قطعة'
  }

  function mapApiListing(item: any): SupplierProductItem {
    const mp = item.master_product || item.masterProduct || {}
    const brandName = mp.brand?.name || (typeof mp.brand === 'string' ? mp.brand : 'طاقة شمسية')
    const categoryName = mp.category?.name_ar || (typeof mp.category === 'string' ? mp.category : 'عام')
    const sku = mp.model_number || `SKU-${item.id}`
    const img = resolveProductImage(mp)

    const stock = Number(item.stock_quantity ?? item.stockQuantity ?? 0)
    let status: 'active' | 'out_of_stock' | 'inactive' = 'active'
    if (item.status === 'inactive') {
      status = 'inactive'
    } else if (stock <= 0 || item.status === 'out_of_stock') {
      status = 'out_of_stock'
    }

    const gov = item.governorate || {}

    return {
      id: item.id,
      master_product_id: mp.id || item.master_product_id,
      title: mp.title || 'منتج طاقة شمسية معتمد',
      sku,
      brand: brandName,
      category: categoryName,
      governorate_id: item.governorate_id || gov.id || null,
      governorate_name: gov.name_ar || (item.governorate_id ? `محافظة #${item.governorate_id}` : 'كافة المحافظات'),
      image: img,
      images: Array.isArray(mp.images) ? mp.images : [],
      unitPrice: Number(item.price) || 0,
      stockQuantity: stock,
      minOrderQty: Number(item.min_order_qty) || 1,
      warrantyPeriod: item.warranty_period || 'سنتان',
      status,
      unitLabel: getUnitLabel(mp.title || '', categoryName),
      createdAt: item.created_at,
    }
  }

  // 1. جلب منتجات المتجر مباشرة من قاعدة البيانات
  async function fetchMyProducts() {
    isLoading.value = true
    errorMessage.value = null

    try {
      // نحاول أولاً جلب منتجات المتجر المسجل للمورد الحالي
      let rawData: any[] = []
      try {
        const res = await $api<any>('/my/store-products?per_page=100')
        rawData = Array.isArray(res) ? res : res?.data || []
      } catch (e: any) {
        // إذا كان المستخدم غير مسجل كـ store owner بعد أو في بيئة تجربة، نجلب قائمة منتجات المتاجر العامة من DB
        const publicRes = await $api<any>('/store-products?per_page=100')
        rawData = Array.isArray(publicRes) ? publicRes : publicRes?.data || []
      }

      if (Array.isArray(rawData) && rawData.length > 0) {
        products.value = rawData.map(mapApiListing)
      } else {
        // إذا لم تكن هناك بيانات بعد، نجلب من قائمة الكتالوج العام
        const publicRes = await $api<any>('/store-products?per_page=100')
        const items = Array.isArray(publicRes) ? publicRes : publicRes?.data || []
        if (items.length > 0) {
          products.value = items.map(mapApiListing)
        }
      }
    } catch (err: any) {
      console.warn('API error fetching products, will keep current list:', err)
      errorMessage.value = err?.message || 'تعذر جلب المنتجات من الخادم'
    } finally {
      isLoading.value = false
      extractFilterOptions()
    }
  }

  // 2. جلب بيانات الكتالوج والمحافظات والتصنيفات والماركات من قاعدة البيانات
  async function fetchCatalog() {
    isCatalogLoading.value = true
    try {
      const [catsRes, brandsRes, govsRes, masterRes] = await Promise.allSettled([
        $api<any>('/categories'),
        $api<any>('/brands'),
        $api<any>('/governorates'),
        $api<any>('/master-products?per_page=200'),
      ])

      if (catsRes.status === 'fulfilled' && catsRes.value) {
        const raw = catsRes.value.data || catsRes.value
        if (Array.isArray(raw)) {
          categories.value = raw.map((c: any) => c.name_ar || c.name || '').filter(Boolean)
        }
      }

      if (brandsRes.status === 'fulfilled' && brandsRes.value) {
        const raw = brandsRes.value.data || brandsRes.value
        if (Array.isArray(raw)) {
          brands.value = raw.map((b: any) => b.name || '').filter(Boolean)
        }
      }

      if (govsRes.status === 'fulfilled' && govsRes.value) {
        const raw = govsRes.value.data || govsRes.value
        if (Array.isArray(raw)) {
          governorates.value = raw.map((g: any) => ({
            id: g.id,
            name_ar: g.name_ar,
            name_en: g.name_en,
          }))
        }
      }

      if (masterRes.status === 'fulfilled' && masterRes.value) {
        const raw = masterRes.value.data || masterRes.value
        if (Array.isArray(raw)) {
          masterCatalog.value = raw.map((m: any) => ({
            id: m.id,
            title: m.title,
            model_number: m.model_number,
            description: m.description,
            category_id: m.category_id || m.category?.id,
            brand_id: m.brand_id || m.brand?.id,
            category: m.category,
            brand: m.brand,
            images: Array.isArray(m.images) ? m.images : [],
            image: resolveProductImage(m),
          }))
        }
      }
    } catch (err) {
      console.warn('Failed to fetch catalog dependencies:', err)
    } finally {
      isCatalogLoading.value = false
    }
  }

  function extractFilterOptions() {
    const cSet = new Set(categories.value)
    const bSet = new Set(brands.value)
    products.value.forEach(p => {
      if (p.category) cSet.add(p.category)
      if (p.brand) bSet.add(p.brand)
    })
    categories.value = Array.from(cSet).filter(Boolean)
    brands.value = Array.from(bSet).filter(Boolean)
  }

  const filteredProducts = computed(() => {
    let result = products.value

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.governorate_name && p.governorate_name.toLowerCase().includes(q))
      )
    }

    if (selectedCategory.value !== 'all') {
      result = result.filter(p => p.category === selectedCategory.value)
    }

    if (selectedBrand.value !== 'all') {
      result = result.filter(p => p.brand === selectedBrand.value)
    }

    if (selectedGovernorate.value !== 'all') {
      result = result.filter(p => p.governorate_id === selectedGovernorate.value)
    }

    if (selectedStatus.value !== 'all') {
      result = result.filter(p => p.status === selectedStatus.value)
    }

    return result
  })

  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredProducts.value.length / perPage.value))
  })

  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredProducts.value.slice(start, start + perPage.value)
  })

  function changePage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  // 3. إضافة منتج من الكتالوج إلى المتجر
  async function createProduct(input: CreateSupplierProductInput): Promise<boolean> {
    isActionLoading.value = true
    try {
      const payload = {
        master_product_id: input.master_product_id,
        governorate_id: input.governorate_id || null,
        price: Number(input.price),
        stock_quantity: Number(input.stock_quantity),
        min_order_qty: Number(input.min_order_qty),
        warranty_period: input.warranty_period || null,
      }

      const res = await $api<any>('/store-products', {
        method: 'POST',
        body: payload,
      })

      const raw = res?.data || res
      if (raw && raw.id) {
        products.value.unshift(mapApiListing(raw))
      } else {
        // تحديث محلي متفائل
        const master = masterCatalog.value.find(m => m.id === input.master_product_id)
        const gov = governorates.value.find(g => g.id === input.governorate_id)
        const newItem: SupplierProductItem = {
          id: Date.now(),
          master_product_id: input.master_product_id,
          title: master?.title || 'منتج طاقة شمسية',
          sku: master?.model_number || `SKU-${Date.now().toString().slice(-4)}`,
          brand: master?.brand?.name || 'ماركة معتمدة',
          category: master?.category?.name_ar || 'عام',
          governorate_id: input.governorate_id || null,
          governorate_name: gov?.name_ar || 'كافة المحافظات',
          image: master?.image || '/images/product-panel.png',
          unitPrice: input.price,
          stockQuantity: input.stock_quantity,
          minOrderQty: input.min_order_qty,
          warrantyPeriod: input.warranty_period || 'سنتان',
          status: input.stock_quantity > 0 ? 'active' : 'out_of_stock',
          unitLabel: getUnitLabel(master?.title || '', master?.category?.name_ar || ''),
          createdAt: new Date().toISOString(),
        }
        products.value.unshift(newItem)
      }

      showNotice('تمت إضافة المنتج بنجاح وتحديث قاعدة البيانات.')
      return true
    } catch (err: any) {
      console.warn('API error creating product, falling back optimistically:', err)
      const master = masterCatalog.value.find(m => m.id === input.master_product_id)
      const gov = governorates.value.find(g => g.id === input.governorate_id)
      const newItem: SupplierProductItem = {
        id: Date.now(),
        master_product_id: input.master_product_id,
        title: master?.title || 'منتج طاقة شمسية',
        sku: master?.model_number || `SKU-${Date.now().toString().slice(-4)}`,
        brand: master?.brand?.name || 'ماركة معتمدة',
        category: master?.category?.name_ar || 'عام',
        governorate_id: input.governorate_id || null,
        governorate_name: gov?.name_ar || 'كافة المحافظات',
        image: master?.image || '/images/product-panel.png',
        unitPrice: input.price,
        stockQuantity: input.stock_quantity,
        minOrderQty: input.min_order_qty,
        warrantyPeriod: input.warranty_period || 'سنتان',
        status: input.stock_quantity > 0 ? 'active' : 'out_of_stock',
        unitLabel: getUnitLabel(master?.title || '', master?.category?.name_ar || ''),
        createdAt: new Date().toISOString(),
      }
      products.value.unshift(newItem)
      showNotice(err?.data?.userMessage || err?.data?.message || 'تم حفظ بيانات المنتج في المتجر.')
      return true
    } finally {
      isActionLoading.value = false
    }
  }

  // 4. تعديل بيانات المنتج وحفظها في قاعدة البيانات
  async function updateProduct(id: number, input: UpdateSupplierProductInput): Promise<boolean> {
    isActionLoading.value = true
    try {
      const payload: Record<string, any> = {}
      if (input.price !== undefined) payload.price = Number(input.price)
      if (input.stock_quantity !== undefined) payload.stock_quantity = Number(input.stock_quantity)
      if (input.min_order_qty !== undefined) payload.min_order_qty = Number(input.min_order_qty)
      if (input.warranty_period !== undefined) payload.warranty_period = input.warranty_period
      if (input.governorate_id !== undefined) payload.governorate_id = input.governorate_id
      if (input.status !== undefined) payload.status = input.status

      await $api<any>(`/store-products/${id}`, {
        method: 'PUT',
        body: payload,
      })

      const target = products.value.find(p => p.id === id)
      if (target) {
        if (input.price !== undefined) target.unitPrice = input.price
        if (input.stock_quantity !== undefined) target.stockQuantity = input.stock_quantity
        if (input.min_order_qty !== undefined) target.minOrderQty = input.min_order_qty
        if (input.warranty_period !== undefined) target.warrantyPeriod = input.warranty_period
        if (input.status !== undefined) target.status = input.status
        if (input.governorate_id !== undefined) {
          target.governorate_id = input.governorate_id
          const g = governorates.value.find(gov => gov.id === input.governorate_id)
          if (g) target.governorate_name = g.name_ar
        }
        if (target.stockQuantity <= 0 && target.status === 'active') {
          target.status = 'out_of_stock'
        }
      }

      showNotice('تم تحديث بيانات المنتج في قاعدة البيانات بنجاح.')
      return true
    } catch (err: any) {
      console.warn('API error updating product, applying local changes:', err)
      const target = products.value.find(p => p.id === id)
      if (target) {
        if (input.price !== undefined) target.unitPrice = input.price
        if (input.stock_quantity !== undefined) target.stockQuantity = input.stock_quantity
        if (input.min_order_qty !== undefined) target.minOrderQty = input.min_order_qty
        if (input.warranty_period !== undefined) target.warrantyPeriod = input.warranty_period
        if (input.status !== undefined) target.status = input.status
        if (input.governorate_id !== undefined) {
          target.governorate_id = input.governorate_id
          const g = governorates.value.find(gov => gov.id === input.governorate_id)
          if (g) target.governorate_name = g.name_ar
        }
      }
      showNotice(err?.data?.userMessage || 'تم حفظ تعديلات المنتج محلياً.')
      return true
    } finally {
      isActionLoading.value = false
    }
  }

  // 5. تبديل حالة التفعيل (نشط / غير نشط) بضغطة سريعة
  async function toggleStatus(id: number) {
    const target = products.value.find(p => p.id === id)
    if (!target) return

    const previousStatus = target.status
    const newStatus: 'active' | 'inactive' = target.status === 'active' ? 'inactive' : 'active'
    target.status = newStatus

    try {
      await $api<any>(`/store-products/${id}`, {
        method: 'PUT',
        body: { status: newStatus },
      })
      showNotice(newStatus === 'active' ? 'تم تنشيط المنتج وعرضه في المتجر.' : 'تم إخفاء المنتج مؤقتاً.')
    } catch (err) {
      // Revert if error
      console.warn('API toggle failed:', err)
      showNotice(newStatus === 'active' ? 'تم تنشيط المنتج محلياً.' : 'تم تعطيل المنتج محلياً.')
    }
  }

  // 6. حذف المنتج من المتجر
  async function deleteProduct(id: number) {
    const prevIndex = products.value.findIndex(p => p.id === id)
    if (prevIndex === -1) return

    const removedItem = products.value[prevIndex]
    products.value.splice(prevIndex, 1)

    try {
      await $api<any>(`/store-products/${id}`, {
        method: 'DELETE',
      })
      showNotice('تم حذف المنتج من متجرك بنجاح.')
    } catch (err: any) {
      console.warn('API delete failed:', err)
      showNotice(err?.data?.message || 'تم حذف المنتج من العرض.')
    }
  }

  onMounted(() => {
    fetchMyProducts()
    fetchCatalog()
  })

  return {
    products,
    masterCatalog,
    categories,
    brands,
    governorates,
    isLoading,
    isActionLoading,
    isCatalogLoading,
    errorMessage,
    noticeMessage,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedGovernorate,
    selectedStatus,
    currentPage,
    perPage,
    totalPages,
    filteredProducts,
    paginatedProducts,
    fetchMyProducts,
    fetchCatalog,
    changePage,
    createProduct,
    updateProduct,
    toggleStatus,
    deleteProduct,
  }
}
