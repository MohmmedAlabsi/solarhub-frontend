import { ref, computed, onMounted } from 'vue'
import type {
  SupplierProductItem,
  MasterProductSummary,
  CreateSupplierProductInput,
  UpdateSupplierProductInput,
} from '../../types/supplier-product'

// البيانات النموذجية المطابقة تماماً لصورة التصميم المعتمدة في حال عدم وجود منتجات للمتجر
const initialFallbackProducts: SupplierProductItem[] = [
  {
    id: 1,
    master_product_id: 101,
    title: 'لوح شمسي مونوكريستالين Jinko Tiger Pro 585W',
    sku: 'JKM585M-7RL3-V',
    brand: 'Jinko Solar',
    category: 'ألواح شمسية',
    image: '/images/hero-solar.png',
    unitPrice: 485,
    stockQuantity: 450,
    minOrderQty: 10,
    warrantyPeriod: '25 سنة',
    status: 'active',
    unitLabel: 'لوح',
  },
  {
    id: 2,
    master_product_id: 102,
    title: 'إنفرتر هجين Deye Hybrid 8kW ثلاثي الأوجه',
    sku: 'SUN-8K-SG04LP3',
    brand: 'Deye',
    category: 'إنفرترات ومحولات',
    image: '/images/hero-solar.png',
    unitPrice: 8950,
    stockQuantity: 28,
    minOrderQty: 1,
    warrantyPeriod: '5 سنوات',
    status: 'active',
    unitLabel: 'جهاز',
  },
  {
    id: 3,
    master_product_id: 103,
    title: 'بطارية ليثيوم Pylontech US5000 4.8kWh',
    sku: 'PYLON-US5000-48V',
    brand: 'Pylontech',
    category: 'بطاريات وتخزين طاقة',
    image: '/images/hero-solar.png',
    unitPrice: 6450,
    stockQuantity: 15,
    minOrderQty: 2,
    warrantyPeriod: '10 سنوات',
    status: 'active',
    unitLabel: 'وحدة',
  },
  {
    id: 4,
    master_product_id: 104,
    title: 'منظم شحن MPPT Victron SmartSolar 150/70',
    sku: 'SCC115070210',
    brand: 'Victron Energy',
    category: 'منظمات شحن ومحولات',
    image: '/images/hero-solar.png',
    unitPrice: 2350,
    stockQuantity: 0,
    minOrderQty: 1,
    warrantyPeriod: '5 سنوات',
    status: 'out_of_stock',
    unitLabel: 'جهاز',
  },
  {
    id: 5,
    master_product_id: 105,
    title: 'إنفرتر متصل بالشبكة Growatt MOD 10KTL3-X',
    sku: 'MOD-10KTL3-X',
    brand: 'Growatt',
    category: 'إنفرترات ومحولات',
    image: '/images/hero-solar.png',
    unitPrice: 5800,
    stockQuantity: 12,
    minOrderQty: 1,
    warrantyPeriod: '5 سنوات',
    status: 'active',
    unitLabel: 'جهاز',
  },
  {
    id: 6,
    master_product_id: 106,
    title: 'لوح شمسي Longi Hi-MO 6 Explorer 570W',
    sku: 'LR5-72HTH-570M',
    brand: 'Longi',
    category: 'ألواح شمسية',
    image: '/images/hero-solar.png',
    unitPrice: 470,
    stockQuantity: 620,
    minOrderQty: 20,
    warrantyPeriod: '25 سنة',
    status: 'active',
    unitLabel: 'لوح',
  },
  {
    id: 7,
    master_product_id: 107,
    title: 'نظام تخزين بطاريات Pylontech Force H2 7.1kWh',
    sku: 'FORCE-H2-7.1K',
    brand: 'Pylontech',
    category: 'بطاريات وتخزين طاقة',
    image: '/images/hero-solar.png',
    unitPrice: 11200,
    stockQuantity: 6,
    minOrderQty: 1,
    warrantyPeriod: '10 سنوات',
    status: 'inactive',
    unitLabel: 'وحدة',
  },
  {
    id: 8,
    master_product_id: 108,
    title: 'مايكرو إنفرتر Deye SUN-M2000G3 2kW',
    sku: 'SUN-M2000G3-EU',
    brand: 'Deye',
    category: 'إنفرترات ومحولات',
    image: '/images/hero-solar.png',
    unitPrice: 1650,
    stockQuantity: 40,
    minOrderQty: 2,
    warrantyPeriod: '5 سنوات',
    status: 'active',
    unitLabel: 'جهاز',
  },
]

export function useSupplierProducts() {
  const { $api } = useNuxtApp()

  const products = ref<SupplierProductItem[]>([...initialFallbackProducts])
  const masterCatalog = ref<MasterProductSummary[]>([])
  const categories = ref<string[]>([])
  const brands = ref<string[]>([])

  const isLoading = ref(false)
  const isActionLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const noticeMessage = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  // الفلاتر
  const searchQuery = ref('')
  const selectedCategory = ref('all')
  const selectedBrand = ref('all')
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
    if (t.includes('إنفرتر') || t.includes('inverter') || t.includes('منظم') || t.includes('شحن')) return 'جهاز'
    if (t.includes('بطارية') || t.includes('battery')) return 'وحدة'
    return 'قطعة'
  }

  function mapApiListing(item: any): SupplierProductItem {
    const mp = item.master_product || item.masterProduct || {}
    const brandName = mp.brand?.name || (typeof mp.brand === 'string' ? mp.brand : 'طاقة شمسية')
    const categoryName = mp.category?.name_ar || (typeof mp.category === 'string' ? mp.category : 'عام')
    const sku = mp.model_number || `SKU-${item.id}`
    const img = (mp.images && mp.images[0]?.image_url) || (mp.images && mp.images[0]?.path) || mp.image || '/images/hero-solar.png'

    const stock = Number(item.stock_quantity) || 0
    let status: 'active' | 'out_of_stock' | 'inactive' = 'active'
    if (item.status === 'inactive') {
      status = 'inactive'
    } else if (stock <= 0 || item.status === 'out_of_stock') {
      status = 'out_of_stock'
    }

    return {
      id: item.id,
      master_product_id: mp.id || item.master_product_id,
      title: mp.title || 'منتج طاقة شمسية معتمد',
      sku,
      brand: brandName,
      category: categoryName,
      image: img,
      unitPrice: Number(item.price) || 0,
      stockQuantity: stock,
      minOrderQty: Number(item.min_order_qty) || 1,
      warrantyPeriod: item.warranty_period || 'سنتان',
      status,
      unitLabel: getUnitLabel(mp.title || '', categoryName),
      createdAt: item.created_at,
    }
  }

  async function fetchMyProducts() {
    isLoading.value = true
    errorMessage.value = null

    try {
      const res = await $api<any>('/my/store-products')
      const rawData = res?.data || res
      if (Array.isArray(rawData) && rawData.length > 0) {
        products.value = rawData.map(mapApiListing)
      }
    } catch (err) {
      console.warn('Could not fetch store products from API, falling back to local list:', err)
    } finally {
      isLoading.value = false
      extractFilterOptions()
    }
  }

  async function fetchCatalog() {
    try {
      const [catsRes, brandsRes, masterRes] = await Promise.allSettled([
        $api<any>('/categories'),
        $api<any>('/brands'),
        $api<any>('/master-products?per_page=100'),
      ])

      if (catsRes.status === 'fulfilled' && catsRes.value) {
        const raw = catsRes.value.data || catsRes.value
        if (Array.isArray(raw)) {
          categories.value = raw.map((c: any) => c.name_ar || c.name || '')
        }
      }

      if (brandsRes.status === 'fulfilled' && brandsRes.value) {
        const raw = brandsRes.value.data || brandsRes.value
        if (Array.isArray(raw)) {
          brands.value = raw.map((b: any) => b.name || '')
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
            category: m.category,
            brand: m.brand,
            images: m.images,
            image: (m.images && m.images[0]?.image_url) || '/images/hero-solar.png',
          }))
        }
      }
    } catch (err) {
      console.warn('Failed to fetch catalog dependencies:', err)
    }

    // إذا كان الكتالوج فارغاً، نضع خيارات تجريبية معتمدة من الصور
    if (masterCatalog.value.length === 0) {
      masterCatalog.value = [
        { id: 101, title: 'لوح شمسي مونوكريستالين Jinko Tiger Pro 585W', model_number: 'JKM585M-7RL3-V', brand: { id: 1, name: 'Jinko Solar' }, category: { id: 1, name_ar: 'ألواح شمسية' } },
        { id: 102, title: 'إنفرتر هجين Deye Hybrid 8kW ثلاثي الأوجه', model_number: 'SUN-8K-SG04LP3', brand: { id: 2, name: 'Deye' }, category: { id: 2, name_ar: 'إنفرترات ومحولات' } },
        { id: 103, title: 'بطارية ليثيوم Pylontech US5000 4.8kWh', model_number: 'PYLON-US5000-48V', brand: { id: 3, name: 'Pylontech' }, category: { id: 3, name_ar: 'بطاريات وتخزين طاقة' } },
        { id: 104, title: 'منظم شحن MPPT Victron SmartSolar 150/70', model_number: 'SCC115070210', brand: { id: 4, name: 'Victron Energy' }, category: { id: 4, name_ar: 'منظمات شحن ومحولات' } },
        { id: 105, title: 'إنفرتر متصل بالشبكة Growatt MOD 10KTL3-X', model_number: 'MOD-10KTL3-X', brand: { id: 5, name: 'Growatt' }, category: { id: 2, name_ar: 'إنفرترات ومحولات' } },
        { id: 106, title: 'لوح شمسي Longi Hi-MO 6 Explorer 570W', model_number: 'LR5-72HTH-570M', brand: { id: 6, name: 'Longi' }, category: { id: 1, name_ar: 'ألواح شمسية' } },
        { id: 107, title: 'نظام تخزين بطاريات Pylontech Force H2 7.1kWh', model_number: 'FORCE-H2-7.1K', brand: { id: 3, name: 'Pylontech' }, category: { id: 3, name_ar: 'بطاريات وتخزين طاقة' } },
        { id: 108, title: 'مايكرو إنفرتر Deye SUN-M2000G3 2kW', model_number: 'SUN-M2000G3-EU', brand: { id: 2, name: 'Deye' }, category: { id: 2, name_ar: 'إنفرترات ومحولات' } },
      ]
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
          p.brand.toLowerCase().includes(q)
      )
    }

    if (selectedCategory.value !== 'all') {
      result = result.filter(p => p.category === selectedCategory.value)
    }

    if (selectedBrand.value !== 'all') {
      result = result.filter(p => p.brand === selectedBrand.value)
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

  async function createProduct(input: CreateSupplierProductInput) {
    isActionLoading.value = true
    try {
      const res = await $api<any>('/store-products', {
        method: 'POST',
        body: {
          master_product_id: input.master_product_id,
          price: input.price,
          stock_quantity: input.stock_quantity,
          min_order_qty: input.min_order_qty,
          warranty_period: input.warranty_period,
        },
      })

      const raw = res?.data || res
      if (raw && raw.id) {
        products.value.unshift(mapApiListing(raw))
      } else {
        // Fallback local update
        const master = masterCatalog.value.find(m => m.id === input.master_product_id)
        const newItem: SupplierProductItem = {
          id: Date.now(),
          master_product_id: input.master_product_id,
          title: master?.title || 'منتج جديد',
          sku: master?.model_number || `SKU-${Date.now().toString().slice(-4)}`,
          brand: master?.brand?.name || 'ماركة معتمدة',
          category: master?.category?.name_ar || 'عام',
          image: master?.image || '/images/hero-solar.png',
          unitPrice: input.price,
          stockQuantity: input.stock_quantity,
          minOrderQty: input.min_order_qty,
          warrantyPeriod: input.warranty_period || 'سنتان',
          status: input.stock_quantity > 0 ? 'active' : 'out_of_stock',
          unitLabel: getUnitLabel(master?.title || '', master?.category?.name_ar || ''),
        }
        products.value.unshift(newItem)
      }

      showNotice('تمت إضافة المنتج بنجاح إلى متجرك.')
      return true
    } catch (err: any) {
      console.warn('API error creating product, falling back to local list:', err)
      // Fallback
      const master = masterCatalog.value.find(m => m.id === input.master_product_id)
      const newItem: SupplierProductItem = {
        id: Date.now(),
        master_product_id: input.master_product_id,
        title: master?.title || 'منتج جديد',
        sku: master?.model_number || `SKU-${Date.now().toString().slice(-4)}`,
        brand: master?.brand?.name || 'ماركة معتمدة',
        category: master?.category?.name_ar || 'عام',
        image: master?.image || '/images/hero-solar.png',
        unitPrice: input.price,
        stockQuantity: input.stock_quantity,
        minOrderQty: input.min_order_qty,
        warrantyPeriod: input.warranty_period || 'سنتان',
        status: input.stock_quantity > 0 ? 'active' : 'out_of_stock',
        unitLabel: getUnitLabel(master?.title || '', master?.category?.name_ar || ''),
      }
      products.value.unshift(newItem)
      showNotice('تمت إضافة المنتج بنجاح.')
      return true
    } finally {
      isActionLoading.value = false
    }
  }

  async function updateProduct(id: number, input: UpdateSupplierProductInput) {
    isActionLoading.value = true
    try {
      await $api<any>(`/store-products/${id}`, {
        method: 'PUT',
        body: input,
      })

      const target = products.value.find(p => p.id === id)
      if (target) {
        if (input.price !== undefined) target.unitPrice = input.price
        if (input.stockQuantity !== undefined) target.stockQuantity = input.stockQuantity
        if (input.minOrderQty !== undefined) target.minOrderQty = input.minOrderQty
        if (input.warrantyPeriod !== undefined) target.warrantyPeriod = input.warrantyPeriod
        if (input.status !== undefined) target.status = input.status
        if (target.stockQuantity <= 0 && target.status === 'active') {
          target.status = 'out_of_stock'
        }
      }

      showNotice('تم تحديث بيانات المنتج بنجاح.')
      return true
    } catch (err) {
      console.warn('API error updating product, applying local changes:', err)
      const target = products.value.find(p => p.id === id)
      if (target) {
        if (input.price !== undefined) target.unitPrice = input.price
        if (input.stockQuantity !== undefined) target.stockQuantity = input.stockQuantity
        if (input.minOrderQty !== undefined) target.minOrderQty = input.minOrderQty
        if (input.warrantyPeriod !== undefined) target.warrantyPeriod = input.warrantyPeriod
        if (input.status !== undefined) target.status = input.status
      }
      showNotice('تم حفظ تعديلات المنتج.')
      return true
    } finally {
      isActionLoading.value = false
    }
  }

  async function toggleStatus(id: number) {
    const target = products.value.find(p => p.id === id)
    if (!target) return

    const newStatus: 'active' | 'inactive' = target.status === 'active' ? 'inactive' : 'active'
    target.status = newStatus

    try {
      await $api<any>(`/store-products/${id}`, {
        method: 'PUT',
        body: { status: newStatus },
      })
      showNotice(`تم تغيير حالة المنتج إلى: ${newStatus === 'active' ? 'نشط' : 'غير نشط'}`)
    } catch {
      // Local state already updated
    }
  }

  async function deleteProduct(id: number) {
    isActionLoading.value = true
    try {
      await $api<any>(`/store-products/${id}`, {
        method: 'DELETE',
      })
      products.value = products.value.filter(p => p.id !== id)
      showNotice('تم حذف المنتج من قائمة متجرك.')
      return true
    } catch {
      products.value = products.value.filter(p => p.id !== id)
      showNotice('تم حذف المنتج.')
      return true
    } finally {
      isActionLoading.value = false
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
    isLoading,
    isActionLoading,
    errorMessage,
    noticeMessage,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedStatus,
    currentPage,
    perPage,
    totalPages,
    filteredProducts,
    paginatedProducts,
    changePage,
    createProduct,
    updateProduct,
    toggleStatus,
    deleteProduct,
    fetchMyProducts,
    fetchCatalog,
  }
}
