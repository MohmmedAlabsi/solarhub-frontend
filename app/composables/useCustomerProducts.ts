import { onBeforeUnmount, ref, watch } from 'vue'
import type {
  Brand,
  Category,
  Governorate,
  MasterProduct,
  PaginationMeta,
} from '../../types/api'
import type { Product } from '../../types/ecommerce'
import { useAuthStore } from '../stores/auth'
import { fetchAllApiRows } from '../utils/apiCollection'

export type CustomerProductKind = 'store' | 'master'

export interface CustomerProductView {
  id: number
  kind: CustomerProductKind
  detailsTo: string

  storeProductId?: number
  masterProductId: number

  categoryId: number | null
  brandId: number | null
  governorateId: number | null

  name: string
  category: string
  categoryType: Product['categoryType']
  brand: string
  model: string

  storeId?: number
  storeName: string
  storeCity: string
  storeRating: number | null

  price: number | null
  priceKnown: boolean
  currency: string

  rating: number | null
  reviewsCount: number | null

  image: string
  images: string[]
  badge?: string
  specs: Record<string, string>

  stockQuantity: number | null
  minOrderQty: number
  warrantyPeriod?: string

  inStock: boolean
  isQuoteOnly: boolean

  datasheetUrl: string | null
  description: string | null
}

export interface StoreOfferItem {
  id: number
  storeId: number
  storeName: string
  storeCity: string

  price: number | null
  stockQuantity: number | null
  minOrderQty: number

  warrantyPeriod?: string | null
  status: string

  product: CustomerProductView
}

interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

interface ApiStoreProduct {
  id: number
  master_product: MasterProduct

  store?: {
    id: number
    company_name?: string | null
  }

  governorate?: {
    id: number
    name_ar?: string | null
  }

  price: number | string | null
  stock_quantity: number | string | null
  min_order_qty: number | string | null
  warranty_period?: string | null
  status: string
}

interface ApiCollection<T> {
  status: string
  message?: string

  data:
    | T[]
    | {
        data: T[]
        last_page?: number
        meta?: { last_page?: number }
      }

  meta?: { last_page?: number }
}

interface StoreFilters {
  governorate_id?: number | string | null
  category_id?: number | string | null
  store_id?: number | string | null
  brand_id?: number | string | null
  search?: string
}

interface MasterFilters {
  page?: number
  per_page?: number
  category_id?: number | string | null
  brand_id?: number | string | null
  search?: string
}

function fail(message: string): Error {
  return Object.assign(new Error(message), {
    userMessage: message,
  })
}

function idValue(value: unknown): number {
  const id = Number(value)

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw fail('معرّف المنتج أو الفلتر غير صالح.')
  }

  return id
}

function optionalId(value: unknown): number | null {
  const id = Number(value)

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null
}

function numberValue(value: unknown): number | null {
  if (
    value === null
    || value === undefined
    || String(value).trim() === ''
  ) {
    return null
  }

  const number = Number(value)

  return Number.isFinite(number) && number >= 0
    ? number
    : null
}

function integerValue(value: unknown): number | null {
  const number = numberValue(value)

  return number !== null && Number.isSafeInteger(number)
    ? number
    : null
}

function httpUrl(value?: string | null): string | null {
  if (!value) return null

  try {
    const url = new URL(value)

    if (
      !['http:', 'https:'].includes(url.protocol)
      || url.username
      || url.password
    ) {
      return null
    }

    return url.href
  } catch {
    return null
  }
}

function categoryType(name: string): Product['categoryType'] {
  const value = name.toLowerCase()

  if (/panel|ألواح|لوح/.test(value)) return 'panel'
  if (/invert|محول|عاكس/.test(value)) return 'inverter'
  if (/batter|بطار/.test(value)) return 'battery'
  if (/pump|مضخ|غطاس/.test(value)) return 'pump'
  if (/control|منظم|mppt/.test(value)) return 'controller'

  return 'accessories'
}

export function useCustomerProducts() {
  const { $api } = useNuxtApp()
  const auth = useAuthStore()

  const categories = useState<Category[]>(
    'customer_catalog_categories',
    () => [],
  )

  const brands = useState<Brand[]>(
    'customer_catalog_brands',
    () => [],
  )

  const governorates = useState<Governorate[]>(
    'customer_catalog_governorates',
    () => [],
  )

  const cached = useState(
    'customer_catalog_loaded',
    () => ({
      categories: false,
      brands: false,
      governorates: false,
    }),
  )

  const isLoading = ref(false)
  const isActionLoading = ref(false)

  const error = ref<string | null>(null)
  const offersError = ref<string | null>(null)
  const detailsWarning = ref<string | null>(null)

  const quoteError = ref<string | null>(null)
  const quoteValidationErrors = ref<Record<string, string>>({})
  const quoteNeedsVerification = ref(false)

  let pendingReads = 0
  let detailVersion = 0
  let mutationVersion = 0
  let disposed = false

  async function read<T>(
    work: () => Promise<T>,
    fallback: string,
    current = () => true,
  ): Promise<T> {
    pendingReads++
    isLoading.value = true

    if (current()) error.value = null

    try {
      return await work()
    } catch (failure: any) {
      const message = failure?.userMessage || fallback

      if (current() && !disposed) {
        error.value = message
      }

      throw fail(message)
    } finally {
      pendingReads--
      isLoading.value = pendingReads > 0
    }
  }

  async function get<T>(
    path: string,
    query?: Record<string, unknown>,
  ): Promise<T> {
    const response = await $api<ApiResponse<T>>(path, {
      query,
    })

    if (response.status !== 'success') {
      throw fail('صيغة استجابة الخادم غير متوقعة.')
    }

    return response.data
  }

  async function fetchCategories(): Promise<Category[]> {
    if (cached.value.categories) return categories.value

    return read(async () => {
      const rows = await get<Category[]>('/categories')

      if (!Array.isArray(rows)) {
        throw fail('بيانات التصنيفات غير صالحة.')
      }

      categories.value = rows
      cached.value.categories = true

      return rows
    }, 'تعذر تحميل التصنيفات.')
  }

  async function fetchBrands(): Promise<Brand[]> {
    if (cached.value.brands) return brands.value

    return read(async () => {
      const rows = await get<Brand[]>('/brands')

      if (!Array.isArray(rows)) {
        throw fail('بيانات العلامات التجارية غير صالحة.')
      }

      brands.value = rows
      cached.value.brands = true

      return rows
    }, 'تعذر تحميل العلامات التجارية.')
  }

  async function fetchGovernorates(): Promise<Governorate[]> {
    if (cached.value.governorates) {
      return governorates.value
    }

    return read(async () => {
      const rows = await get<Governorate[]>('/governorates')

      if (!Array.isArray(rows)) {
        throw fail('بيانات المحافظات غير صالحة.')
      }

      governorates.value = rows
      cached.value.governorates = true

      return rows
    }, 'تعذر تحميل المحافظات.')
  }

  function mapMasterProductToView(
    master: MasterProduct,
  ): CustomerProductView {
    const id = idValue(master?.id)

    const category =
      master.category?.name_ar
      || master.category?.name_en
      || 'غير محدد'

    const rawImages = Array.isArray(master.images)
      ? master.images
      : []

    const sortedImages = [...rawImages].sort(
      (first, second) =>
        Number(Boolean(second.is_featured))
        - Number(Boolean(first.is_featured)),
    )

    const images = [
      ...new Set(
        sortedImages
          .map(image => httpUrl(image.url))
          .filter((url): url is string => Boolean(url)),
      ),
    ]

    const specs: Record<string, string> = {}

    for (
      const [index, spec]
      of (master.specifications || []).entries()
    ) {
      if (
        !spec.name
        || spec.value === null
        || spec.value === undefined
      ) {
        continue
      }

      const key = Object.prototype.hasOwnProperty.call(
        specs,
        spec.name,
      )
        ? `${spec.name} (${index + 1})`
        : spec.name

      specs[key] =
        `${spec.value} ${spec.unit || ''}`.trim()
    }

    return {
      id,
      kind: 'master',
      detailsTo: `/customer/products/${id}?kind=master`,

      masterProductId: id,

      categoryId: optionalId(master.category?.id),
      brandId: optionalId(master.brand?.id),
      governorateId: null,

      name: master.title || 'منتج',
      category,
      categoryType: categoryType(category),
      brand: master.brand?.name || '',
      model: master.model_number || '',

      storeName: '',
      storeCity: '',
      storeRating: null,

      price: null,
      priceKnown: false,
      currency: '',

      rating: null,
      reviewsCount: null,

      image: images[0] || '',
      images,
      specs,

      stockQuantity: null,
      minOrderQty: 1,

      inStock: false,
      isQuoteOnly: true,

      datasheetUrl: httpUrl(master.datasheet_url),
      description: master.description || null,
    }
  }

  function mapStoreProductToView(
    source: ApiStoreProduct,
  ): CustomerProductView {
    const base = mapMasterProductToView(
      source.master_product,
    )

    const id = idValue(source.id)
    const price = numberValue(source.price)
    const stock = integerValue(source.stock_quantity)
    const minimum = integerValue(source.min_order_qty)
    const storeId = optionalId(source.store?.id)

    return {
      ...base,

      id,
      kind: 'store',
      detailsTo: `/customer/products/${id}?kind=store`,

      storeProductId: id,
      storeId: storeId ?? undefined,
      governorateId: optionalId(source.governorate?.id),

      storeName: source.store?.company_name || '',
      storeCity: source.governorate?.name_ar || '',

      price,
      priceKnown: price !== null,

      stockQuantity: stock,
      minOrderQty: minimum && minimum > 0
        ? minimum
        : 1,

      warrantyPeriod:
        source.warranty_period || undefined,

      inStock:
        source.status === 'active'
        && stock !== null
        && stock > 0,

      isQuoteOnly: price === null || price <= 0,
    }
  }

  function filterQuery(
    filters: Record<string, unknown>,
    names: string[],
  ): Record<string, unknown> {
    const query: Record<string, unknown> = {}

    for (const name of names) {
      const value = filters[name]

      if (
        value !== undefined
        && value !== null
        && value !== ''
        && value !== 'all'
      ) {
        query[name] = idValue(value)
      }
    }

    return query
  }

  function storeRows(
    filters: StoreFilters = {},
  ): Promise<ApiStoreProduct[]> {
    const filtersQuery = filterQuery(
      { ...filters },
      ['governorate_id', 'category_id', 'store_id'],
    )

    return fetchAllApiRows<ApiStoreProduct>(
      query => $api<ApiCollection<ApiStoreProduct>>(
        '/store-products',
        {
          query: {
            ...filtersQuery,
            ...query,
          },
        },
      ),
      100,
    )
  }

  function fetchStoreProducts(
    filters: StoreFilters = {},
  ): Promise<CustomerProductView[]> {
    return read(async () => {
      const rows = await storeRows(filters)

      const brand =
        filters.brand_id && filters.brand_id !== 'all'
          ? idValue(filters.brand_id)
          : null

      const query =
        filters.search?.trim().toLocaleLowerCase('ar') || ''

      return rows
        .map(mapStoreProductToView)
        .filter(product => {
          if (
            brand !== null
            && product.brandId !== brand
          ) {
            return false
          }

          if (!query) return true

          return [
            product.name,
            product.brand,
            product.model,
            product.storeName,
          ]
            .join(' ')
            .toLocaleLowerCase('ar')
            .includes(query)
        })
    }, 'تعذر تحميل عروض المتاجر.')
  }

  function fetchMasterProducts(
    params: MasterFilters = {},
  ): Promise<{
    products: CustomerProductView[]
    meta: PaginationMeta
  }> {
    return read(async () => {
      const query = filterQuery(
        { ...params },
        ['category_id', 'brand_id'],
      )

      query.page = idValue(params.page ?? 1)

      query.per_page = Math.min(
        100,
        idValue(params.per_page ?? 12),
      )

      if (params.search?.trim()) {
        query.search = params.search.trim()
      }

      const response = await $api<
        ApiResponse<MasterProduct[]>
        & { meta: PaginationMeta }
      >('/master-products', { query })

      const meta = response.meta

      if (
        response.status !== 'success'
        || !Array.isArray(response.data)
        || !meta
        || ![
          meta.current_page,
          meta.last_page,
          meta.per_page,
        ].every(value =>
          Number.isSafeInteger(value) && value > 0,
        )
        || !Number.isSafeInteger(meta.total)
        || meta.total < 0
      ) {
        throw fail('بيانات صفحات الكتالوج غير صالحة.')
      }

      return {
        products: response.data.map(
          mapMasterProductToView,
        ),
        meta,
      }
    }, 'تعذر تحميل الكتالوج المرجعي.')
  }

  async function fetchProductDetails(
    id: string | number,
    kind: CustomerProductKind = 'store',
  ): Promise<{
    product: CustomerProductView
    offers: StoreOfferItem[]
    selectedOfferId?: number
  } | null> {
    const version = ++detailVersion

    const current = () =>
      version === detailVersion && !disposed

    offersError.value = null
    detailsWarning.value = null

    try {
      return await read(async () => {
        const productId = idValue(id)

        if (!['store', 'master'].includes(kind)) {
          throw fail('نوع المنتج غير صالح.')
        }

        let source: ApiStoreProduct | undefined
        let master: MasterProduct

        if (kind === 'store') {
          source = await get<ApiStoreProduct>(
            `/store-products/${productId}`,
          )

          if (Number(source?.id) !== productId) {
            throw fail(
              'بيانات عرض المتجر غير متطابقة.',
            )
          }

          const masterId = idValue(
            source.master_product?.id,
          )

          master = source.master_product

          try {
            const full = await get<MasterProduct>(
              `/master-products/${masterId}`,
            )

            if (Number(full?.id) !== masterId) {
              throw fail(
                'بيانات المنتج المرجعي غير متطابقة.',
              )
            }

            master = { ...master, ...full }
          } catch {
            if (current()) {
              detailsWarning.value =
                'تعذر تحميل بعض تفاصيل المنتج المرجعي.'
            }
          }
        } else {
          master = await get<MasterProduct>(
            `/master-products/${productId}`,
          )

          if (
            Number(master?.id) !== productId
            || master.is_active === false
          ) {
            throw fail('المنتج المرجعي غير متاح.')
          }
        }

        const masterId = idValue(master.id)

        let rows: ApiStoreProduct[] = []

        try {
          rows = (
            await storeRows({
              category_id: optionalId(
                master.category?.id,
              ),
            })
          ).filter(row =>
            Number(row.master_product?.id) === masterId,
          )
        } catch {
          if (current()) {
            offersError.value =
              'تعذر تحميل جميع عروض المتاجر لهذا المنتج.'
          }
        }

        if (!current()) return null

        if (source) {
          rows = rows.filter(
            row => Number(row.id) !== Number(source!.id),
          )

          rows.unshift(source)
        }

        const offers = rows.map(row => {
          const product = mapStoreProductToView({
            ...row,
            master_product: master,
          })

          return {
            id: idValue(row.id),
            storeId: idValue(row.store?.id),

            storeName: product.storeName,
            storeCity: product.storeCity,

            price: product.price,
            stockQuantity: product.stockQuantity,
            minOrderQty: product.minOrderQty,
            warrantyPeriod: product.warrantyPeriod,

            status: row.status,
            product,
          }
        })

        return {
          product: source
            ? mapStoreProductToView({
                ...source,
                master_product: master,
              })
            : mapMasterProductToView(master),

          offers,

          selectedOfferId: source
            ? idValue(source.id)
            : undefined,
        }
      }, 'تعذر تحميل تفاصيل المنتج. تحقق من الرابط والاتصال.', current)
    } catch {
      return null
    }
  }

  async function sendQuoteRequest(data: {
    store_product_id: number

    // للتحقق في الفرونت فقط؛ لا يُرسل إلى الباك إند.
    master_product_id?: number

    quantity: number
    customer_target_price?: number | null
    customer_notes?: string | null
  }) {
    if (isActionLoading.value) {
      throw fail('جارٍ إرسال طلب التسعير.')
    }

    if (quoteNeedsVerification.value) {
      throw fail(
        'راجع سجل عروض الأسعار قبل إرسال الطلب مجددًا.',
      )
    }

    const token = auth.token
    const owner = String(auth.user?.id ?? '')

    if (
      !token
      || !owner
      || auth.user?.role !== 'customer'
    ) {
      throw fail(
        'سجّل الدخول بحساب عميل لطلب التسعير.',
      )
    }

    const version = ++mutationVersion

    const current = () =>
      !disposed
      && version === mutationVersion
      && auth.token === token
      && String(auth.user?.id ?? '') === owner

    let requestSent = false

    isActionLoading.value = true
    quoteError.value = null
    quoteValidationErrors.value = {}

    try {
      const id = idValue(data.store_product_id)

      if (!optionalId(data.master_product_id)) {
        throw fail(
          'اختر عرض متجر محددًا للمنتج قبل إرسال طلب التسعير.',
        )
      }

      const masterId = idValue(data.master_product_id)
      const quantity = idValue(data.quantity)

      const payload: Record<string, number | string> = {
        store_product_id: id,
        quantity,
      }

      if (
        data.customer_target_price !== null
        && data.customer_target_price !== undefined
      ) {
        const target = numberValue(
          data.customer_target_price,
        )

        if (target === null) {
          throw fail('السعر المستهدف غير صالح.')
        }

        payload.customer_target_price = target
      }

      const notes = data.customer_notes?.trim() || ''

      if (notes.length > 1000) {
        throw fail(
          'الملاحظات يجب ألا تتجاوز 1000 حرف.',
        )
      }

      if (notes) {
        payload.customer_notes = notes
      }

      // التحقق من أن معرّف العرض يخص المنتج المطلوب.
      const source = await get<ApiStoreProduct>(
        `/store-products/${id}`,
      )

      if (!current()) {
        throw fail('تغيرت جلسة الحساب.')
      }

      if (
        Number(source.id) !== id
        || Number(source.master_product?.id) !== masterId
        || source.status !== 'active'
      ) {
        throw fail(
          'عرض المتجر لا يطابق المنتج المحدد أو لم يعد متاحًا.',
        )
      }

      requestSent = true

      const response = await $api<ApiResponse<any>>(
        '/quote-requests',
        {
          method: 'POST',
          retry: 0,
          body: payload,
        },
      )

      if (!current()) {
        throw fail('تغيرت جلسة الحساب.')
      }

      if (
        response.status !== 'success'
        || !optionalId(response.data?.id)
        || Number(response.data.store_product?.id) !== id
        || Number(response.data.quantity) !== quantity
        || String(response.data.customer?.id) !== owner
        || response.data.status !== 'pending'
      ) {
        throw fail(
          'تعذر تأكيد حفظ طلب التسعير. راجع سجل عروض الأسعار.',
        )
      }

      return response
    } catch (failure: any) {
      if (!current()) {
        throw fail(
          'تغيرت جلسة الحساب أو أُغلقت الصفحة.',
        )
      }

      const status =
        failure?.statusCode ?? failure?.status

      const fields = [
        'store_product_id',
        'quantity',
        'customer_target_price',
        'customer_notes',
      ]

      if (status === 422) {
        for (const field of fields) {
          const messages = failure?.data?.errors?.[field]

          const message = Array.isArray(messages)
            ? messages[0]
            : messages

          if (typeof message === 'string') {
            quoteValidationErrors.value[field] = message
          }
        }
      }

      quoteNeedsVerification.value =
        requestSent
        && !Object.keys(
          quoteValidationErrors.value,
        ).length
        && ![401, 403].includes(status)

      quoteError.value =
        failure?.userMessage
        || 'تعذر تأكيد إرسال طلب التسعير. تحقق من البيانات وسجل عروض الأسعار.'

      throw fail(quoteError.value!)
    } finally {
      if (current()) {
        isActionLoading.value = false
      }
    }
  }

  watch(
    [
      () => auth.token,
      () => String(auth.user?.id ?? ''),
    ],
    () => {
      mutationVersion++

      isActionLoading.value = false
      quoteError.value = null
      quoteValidationErrors.value = {}
      quoteNeedsVerification.value = false
    },
  )

  onBeforeUnmount(() => {
    disposed = true
    detailVersion++
    mutationVersion++
  })

  return {
    categories,
    brands,
    governorates,

    isLoading,
    isActionLoading,
    error,
    offersError,
    detailsWarning,

    quoteError,
    quoteValidationErrors,
    quoteNeedsVerification,

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