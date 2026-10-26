import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Product } from '~~/types/ecommerce'
import { fetchAllApiRows } from '../utils/apiCollection'

export interface CartProduct extends Product {
  storeProductId: number
  stockQuantity?: number
  minOrderQty: number
  priceKnown: boolean
}

export interface CartStoreItem {
  id?: number
  product: CartProduct
  quantity: number
  line_total?: number
}

interface SessionContext {
  token: string | null
  version: number
}

function userError(message: string): Error {
  return Object.assign(new Error(message), {
    userMessage: message,
  })
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
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

function positiveInteger(value: unknown): number {
  const number = Number(value)

  if (!Number.isSafeInteger(number) || number <= 0) {
    throw userError('معرّف العنصر أو الكمية غير صالح.')
  }

  return number
}

function productImage(source: any): string {
  const images = source?.master_product?.images

  if (Array.isArray(images)) {
    const featured = images.find(
      image => image?.is_featured && image?.url,
    )

    const image = featured || images.find(image => image?.url)

    if (image) return textValue(image.url)
  }

  return textValue(source?.image)
}

function mapProduct(source: any): CartProduct {
  const master = source?.master_product || {}

  const price = numberValue(source?.price)

  const stock = numberValue(
    source?.stock_quantity ?? source?.stockQuantity,
  )

  const minimum = numberValue(
    source?.min_order_qty ?? source?.minOrderQty,
  )

  const id = positiveInteger(
    source?.storeProductId ?? source?.id,
  )

  const category =
    master.category?.name_ar
    || master.category?.name_en
    || source?.category

  const types = [
    'panel',
    'inverter',
    'battery',
    'pump',
    'controller',
    'accessories',
  ]

  return {
    id,
    storeProductId: id,

    name:
      textValue(source?.title)
      || textValue(master.title)
      || textValue(source?.name)
      || 'منتج',

    category: textValue(category) || 'غير محدد',

    categoryType: types.includes(source?.categoryType)
      ? source.categoryType
      : 'accessories',

    brand:
      textValue(master.brand?.name)
      || textValue(source?.brand),

    model:
      textValue(master.model_number)
      || textValue(source?.model),

    storeName:
      textValue(source?.store?.company_name)
      || textValue(source?.storeName),

    storeCity:
      textValue(source?.governorate?.name_ar)
      || textValue(source?.storeCity),

    // الصفر هنا للتوافق مع النوع القديم.
    // priceKnown يحدد هل السعر متاح فعلًا.
    price: price ?? 0,
    priceKnown: source?.priceKnown !== false && price !== null,

    currency: '',

    // الباك إند لا يعيد تقييمًا للمنتج ضمن هذه الاستجابات.
    rating: 0,
    reviewsCount: 0,

    image: productImage(source),
    specs: {},

    stockQuantity:
      stock !== null && Number.isSafeInteger(stock)
        ? stock
        : undefined,

    minOrderQty:
      minimum !== null
      && Number.isSafeInteger(minimum)
      && minimum > 0
        ? minimum
        : 1,

    inStock:
      stock !== null
        ? stock > 0
        : source?.inStock === true,

    isQuoteOnly:
      source?.isQuoteOnly === true
      || price === null
      || price <= 0,
  }
}

export const useCartStore = defineStore('cart', () => {
  const { $api } = useNuxtApp()
  const tokenCookie = useCookie<string | null>('auth_token')

  const items = ref<CartStoreItem[]>([])
  const wishlist = ref<CartProduct[]>([])

  const isLoading = ref(false)
  const isUpdating = ref<Record<string | number, boolean>>({})
  const errorMessage = ref<string | null>(null)
  const isInitialized = ref(false)

  const wishlistLoading = ref(false)
  const wishlistError = ref<string | null>(null)
  const wishlistInitialized = ref(false)

  const serverTotal = ref<number | null>(null)

  let version = 0
  let cartTask: Promise<boolean> | null = null
  let wishlistTask: Promise<boolean> | null = null

  function sessionToken(): string | null {
    if (tokenCookie.value) return tokenCookie.value

    if (!import.meta.client) return null

    try {
      return localStorage.getItem('solarhub_token')
        || localStorage.getItem('auth_token')
    } catch {
      return null
    }
  }

  let ownerToken = sessionToken()

  function syncSession(): SessionContext {
    const token = sessionToken()

    if (token !== ownerToken) {
      version++
      ownerToken = token

      items.value = []
      wishlist.value = []
      serverTotal.value = null

      isLoading.value = false
      wishlistLoading.value = false
      isUpdating.value = {}

      isInitialized.value = false
      wishlistInitialized.value = false

      errorMessage.value = null
      wishlistError.value = null

      cartTask = null
      wishlistTask = null
    }

    return { token, version }
  }

  function isCurrent(context: SessionContext): boolean {
    return context.version === version
      && context.token === sessionToken()
  }

  function requireCurrent(context: SessionContext) {
    if (!isCurrent(context)) {
      throw userError(
        'تغيرت جلسة الحساب. أعد تحميل البيانات.',
      )
    }
  }

  const totalItemsCount = computed(() =>
    items.value.reduce(
      (sum, row) => sum + row.quantity,
      0,
    ),
  )

  const subtotal = computed(() =>
    serverTotal.value
    ?? Math.round(
      items.value.reduce(
        (sum, row) =>
          sum + (
            row.line_total
            ?? row.product.price * row.quantity
          ),
        0,
      ) * 100,
    ) / 100,
  )

  const hasCompletePricing = computed(() =>
    items.value.every(row => row.product.priceKnown),
  )

  // للتوافق مع الصفحات القديمة فقط.
  // الباك إند لا يعيد معلومات الضريبة والشحن.
  const vat = computed(() => 0)
  const shippingFee = computed(() => 0)

  const hasTaxInformation = computed(() => false)
  const hasShippingInformation = computed(() => false)

  // إجمالي المنتجات، دون إضافة رسوم مفترضة.
  const total = computed(() => subtotal.value)

  const canCheckout = computed(() =>
    Boolean(
      sessionToken()
      && isInitialized.value
      && !isLoading.value
      && !errorMessage.value
      && items.value.length
      && hasCompletePricing.value
      && items.value.every(row =>
        row.product.price > 0
        && row.product.stockQuantity !== undefined
        && row.quantity <= row.product.stockQuantity
        && row.quantity >= row.product.minOrderQty,
      ),
    ),
  )

  function run(
    kind: 'cart' | 'wishlist',
    work: (context: SessionContext) => Promise<void> | void,
    fallback: string,
    reading = false,
  ): Promise<boolean> {
    const context = syncSession()

    const active = kind === 'cart'
      ? cartTask
      : wishlistTask

    if (active) {
      return reading
        ? active.catch(() => false)
        : Promise.reject(
          userError('جارٍ حفظ عملية أخرى. انتظر قليلًا.'),
        )
    }

    const loading = kind === 'cart'
      ? isLoading
      : wishlistLoading

    const error = kind === 'cart'
      ? errorMessage
      : wishlistError

    const initialized = kind === 'cart'
      ? isInitialized
      : wishlistInitialized

    if (
      kind === 'cart'
      && !reading
      && !initialized.value
      && error.value
    ) {
      return Promise.reject(
        userError(
          'حدّث السلة للتحقق من حالتها قبل إجراء تعديل آخر.',
        ),
      )
    }

    loading.value = true
    error.value = null

    const task = Promise.resolve()
      .then(() => {
        requireCurrent(context)
        return work(context)
      })
      .then(() => true)
      .catch((failure: any) => {
        const status =
          failure?.statusCode ?? failure?.status

        const message =
          failure?.userMessage
          || (
            status === 401
              ? 'انتهت جلسة الدخول. سجّل الدخول مجددًا.'
              : fallback
          )

        if (isCurrent(context)) {
          error.value = message
          initialized.value = false
        }

        if (!reading) {
          throw userError(message)
        }

        return false
      })
      .finally(() => {
        if (!isCurrent(context)) return

        loading.value = false

        if (kind === 'cart') {
          cartTask = null
          isUpdating.value = {}
        } else {
          wishlistTask = null
        }
      })

    if (kind === 'cart') {
      cartTask = task
    } else {
      wishlistTask = task
    }

    return task
  }

  function readArray(key: string): any[] {
    if (!import.meta.client) {
      throw userError('التخزين المحلي غير متاح.')
    }

    const raw = localStorage.getItem(key)
    const rows = raw ? JSON.parse(raw) : []

    if (!Array.isArray(rows)) {
      throw userError(
        'بيانات التخزين المحلي غير صالحة.',
      )
    }

    return rows
  }

  function readGuestCart(): CartStoreItem[] {
    const seen = new Set<number>()

    return readArray('solarhub_guest_cart').map(row => {
      const product = mapProduct(row?.product)

      if (seen.has(Number(product.id))) {
        throw userError('تكررت عناصر السلة المحلية.')
      }

      seen.add(Number(product.id))

      const quantity = positiveInteger(row?.quantity)

      return {
        product,
        quantity,
        line_total: product.priceKnown
          ? product.price * quantity
          : undefined,
      }
    })
  }

  function saveGuestCart(
    context: SessionContext,
    rows: CartStoreItem[],
  ) {
    requireCurrent(context)

    if (!import.meta.client) {
      throw userError('التخزين المحلي غير متاح.')
    }

    localStorage.setItem(
      'solarhub_guest_cart',
      JSON.stringify(rows),
    )

    items.value = rows
    serverTotal.value = null
    isInitialized.value = true
  }

  function applyServerCart(
    context: SessionContext,
    response: any,
  ) {
    requireCurrent(context)

    if (
      response?.status !== 'success'
      || !Array.isArray(response?.data?.items)
    ) {
      throw userError(
        'تعذر تأكيد بيانات السلة. حدّثها للتحقق.',
      )
    }

    const seen = new Set<number>()

    const mapped: CartStoreItem[] =
      response.data.items.map((row: any) => {
        const id = positiveInteger(row?.id)

        if (seen.has(id)) {
          throw userError('تكررت عناصر السلة المستلمة.')
        }

        seen.add(id)

        const quantity = positiveInteger(row?.quantity)
        const product = mapProduct(row?.store_product)

        return {
          id,
          product,
          quantity,
          line_total:
            numberValue(row?.line_total) ?? undefined,
        }
      })

    const amount = numberValue(
      response.data.total_amount,
    )

    if (amount === null) {
      throw userError('تعذر تأكيد إجمالي السلة.')
    }

    items.value = mapped
    serverTotal.value = amount
    isInitialized.value = true
  }

  function fetchCart(): Promise<boolean> {
    return run(
      'cart',
      async context => {
        isInitialized.value = false
        items.value = []
        serverTotal.value = null

        if (context.token) {
          const response = await $api('/my/cart')
          applyServerCart(context, response)
        } else {
          const rows = readGuestCart()

          requireCurrent(context)

          items.value = rows
          isInitialized.value = true
        }
      },
      'تعذر تحميل السلة. تحقق من الاتصال وأعد المحاولة.',
      true,
    )
  }

  function addToCart(
    product: Product | any,
    quantity = 1,
  ): Promise<boolean> {
    return run(
      'cart',
      async context => {
        const id = positiveInteger(
          product?.storeProductId ?? product?.id,
        )

        const qty = positiveInteger(quantity)

        if (context.token) {
          const response: any = await $api(
            '/my/cart/items',
            {
              method: 'POST',
              retry: 0,
              body: {
                store_product_id: id,
                quantity: qty,
              },
            },
          )

          const added = response?.data?.items?.find(
            (row: any) =>
              Number(row?.store_product?.id) === id,
          )

          if (!added || Number(added.quantity) < qty) {
            throw userError(
              'تعذر تأكيد إضافة المنتج. حدّث السلة للتحقق.',
            )
          }

          applyServerCart(context, response)
        } else {
          const rows = readGuestCart()

          const mapped = mapProduct({
            ...product,
            id,
            storeProductId: id,
          })

          if (!mapped.priceKnown) {
            throw userError('سعر المنتج غير متاح.')
          }

          const existing = rows.find(
            row => Number(row.product.id) === id,
          )

          const newQuantity = positiveInteger(
            qty + (existing?.quantity ?? 0),
          )

          if (existing) {
            Object.assign(existing, {
              product: mapped,
              quantity: newQuantity,
              line_total: newQuantity * mapped.price,
            })
          } else {
            rows.push({
              product: mapped,
              quantity: qty,
              line_total: qty * mapped.price,
            })
          }

          saveGuestCart(context, rows)
        }
      },
      'تعذر تأكيد الإضافة. حدّث السلة قبل إعادة المحاولة.',
    )
  }

  function findItem(
    context: SessionContext,
    identifier: string | number,
    rows: CartStoreItem[],
  ): CartStoreItem {
    const item = rows.find(row =>
      String(
        context.token ? row.id : row.product.id,
      ) === String(identifier),
    )

    if (!item) {
      throw userError(
        'العنصر غير موجود في السلة الحالية. أعد تحميلها.',
      )
    }

    return item
  }

  function updateQuantity(
    identifier: string | number,
    quantity: number,
  ): Promise<boolean> {
    if (Number(quantity) === 0) {
      return removeFromCart(identifier)
    }

    return run(
      'cart',
      async context => {
        const qty = positiveInteger(quantity)

        const rows = context.token
          ? items.value
          : readGuestCart()

        const item = findItem(context, identifier, rows)

        if (context.token) {
          const id = positiveInteger(item.id)

          isUpdating.value[id] = true

          const response: any = await $api(
            `/my/cart/items/${id}`,
            {
              method: 'PUT',
              retry: 0,
              body: { quantity: qty },
            },
          )

          const updated = response?.data?.items?.find(
            (row: any) => Number(row.id) === id,
          )

          if (
            !updated
            || Number(updated.quantity) !== qty
          ) {
            throw userError(
              'تعذر تأكيد تعديل الكمية.',
            )
          }

          applyServerCart(context, response)
        } else {
          item.quantity = qty

          item.line_total = item.product.priceKnown
            ? item.product.price * qty
            : undefined

          saveGuestCart(context, rows)
        }
      },
      'تعذر تعديل الكمية. تحقق من المخزون والحد الأدنى ثم حدّث السلة.',
    )
  }

  function removeFromCart(
    identifier: string | number,
  ): Promise<boolean> {
    return run(
      'cart',
      async context => {
        const rows = context.token
          ? items.value
          : readGuestCart()

        const item = findItem(context, identifier, rows)

        if (context.token) {
          const id = positiveInteger(item.id)

          isUpdating.value[id] = true

          const response: any = await $api(
            `/my/cart/items/${id}`,
            {
              method: 'DELETE',
              retry: 0,
            },
          )

          const stillExists =
            response?.data?.items?.some(
              (row: any) => Number(row.id) === id,
            )

          if (stillExists) {
            throw userError(
              'تعذر تأكيد حذف العنصر.',
            )
          }

          applyServerCart(context, response)
        } else {
          saveGuestCart(
            context,
            rows.filter(row => row !== item),
          )
        }
      },
      'تعذر تأكيد الحذف. حدّث السلة للتحقق.',
    )
  }

  function clearCart(): Promise<boolean> {
    return run(
      'cart',
      async context => {
        if (context.token) {
          const response: any = await $api(
            '/my/cart',
            {
              method: 'DELETE',
              retry: 0,
            },
          )

          requireCurrent(context)

          if (
            response?.status !== 'success'
            || response.data !== null
          ) {
            throw userError(
              'تعذر تأكيد تفريغ السلة.',
            )
          }

          items.value = []
          serverTotal.value = 0
          isInitialized.value = true
        } else {
          saveGuestCart(context, [])
        }
      },
      'تعذر تأكيد تفريغ السلة. حدّثها للتحقق.',
    )
  }

  function readGuestWishlist(): CartProduct[] {
    return readArray('solarhub_guest_wishlist')
      .map(mapProduct)
  }

  function saveGuestWishlist(
    context: SessionContext,
    rows: CartProduct[],
  ) {
    requireCurrent(context)

    if (!import.meta.client) {
      throw userError('التخزين المحلي غير متاح.')
    }

    localStorage.setItem(
      'solarhub_guest_wishlist',
      JSON.stringify(rows),
    )

    wishlist.value = rows
    wishlistInitialized.value = true
  }

  async function loadWishlist(
    context: SessionContext,
  ) {
    if (!context.token) {
      const rows = readGuestWishlist()

      requireCurrent(context)

      wishlist.value = rows
    } else {
      // استجابة المفضلة ليست داخل status/data
      // مثل بقية المسارات؛ هي Laravel Resource مباشرة.
      const rows = await fetchAllApiRows<any>(
        async query => {
          const response: any = await $api(
            '/favorites',
            { query },
          )

          if (!Array.isArray(response?.data)) {
            throw userError(
              'بيانات المفضلة غير متوقعة.',
            )
          }

          return {
            status: 'success',
            data: response.data,
            meta: response.meta,
          }
        },
        100,
      )

      requireCurrent(context)

      wishlist.value = rows.map(row =>
        mapProduct({
          ...row.product,
          id: row.store_product_id,
        }),
      )
    }

    wishlistInitialized.value = true
  }

  function fetchWishlist(): Promise<boolean> {
    return run(
      'wishlist',
      loadWishlist,
      'تعذر تحميل المفضلة. أعد المحاولة.',
      true,
    )
  }

  async function deleteFavorite(
    context: SessionContext,
    id: number,
  ) {
    try {
      await $api(`/favorites/${id}`, {
        method: 'DELETE',
        retry: 0,
      })
    } catch (failure: any) {
      const status =
        failure?.statusCode ?? failure?.status

      // العنصر المحذوف مسبقًا لا يحتاج حذفًا آخر.
      if (status !== 404) throw failure
    }

    requireCurrent(context)

    wishlist.value = wishlist.value.filter(
      product => Number(product.id) !== id,
    )
  }

  function toggleWishlist(
    product: Product | any,
  ): Promise<boolean> {
    return run(
      'wishlist',
      async context => {
        const id = positiveInteger(
          product?.storeProductId ?? product?.id,
        )

        // نحفظ نية المستخدم قبل تحديث الحالة.
        // هذا يمنع عكس العملية عند فقدان استجابة الحفظ.
        const wantAdded = !wishlist.value.some(
          row => Number(row.id) === id,
        )

        if (!wishlistInitialized.value) {
          await loadWishlist(context)
        }

        const exists = wishlist.value.some(
          row => Number(row.id) === id,
        )

        if (wantAdded === exists) return

        if (context.token) {
          if (!wantAdded) {
            await deleteFavorite(context, id)
          } else {
            const response: any = await $api(
              '/favorites',
              {
                method: 'POST',
                retry: 0,
                body: {
                  store_product_id: id,
                },
              },
            )

            requireCurrent(context)

            if (
              Number(
                response?.data?.store_product_id,
              ) !== id
            ) {
              throw userError(
                'تعذر تأكيد إضافة المفضلة.',
              )
            }

            wishlist.value = [
              ...wishlist.value,
              mapProduct({
                ...product,
                id,
                storeProductId: id,
              }),
            ]
          }
        } else {
          const nextItems = wantAdded
            ? [
                ...wishlist.value,
                mapProduct({
                  ...product,
                  id,
                  storeProductId: id,
                }),
              ]
            : wishlist.value.filter(
                row => Number(row.id) !== id,
              )

          saveGuestWishlist(context, nextItems)
        }
      },
      'تعذر حفظ المفضلة. حدّثها للتحقق قبل المحاولة مجددًا.',
    )
  }

  function removeFromWishlist(
    identifier: string | number,
  ): Promise<boolean> {
    return run(
      'wishlist',
      async context => {
        const id = positiveInteger(identifier)

        if (!wishlistInitialized.value) {
          await loadWishlist(context)
        }

        if (context.token) {
          await deleteFavorite(context, id)
        } else {
          saveGuestWishlist(
            context,
            wishlist.value.filter(
              row => Number(row.id) !== id,
            ),
          )
        }
      },
      'تعذر حذف المنتج من المفضلة.',
    )
  }

  const isInWishlist = (id: string | number) =>
    wishlist.value.some(
      row => String(row.id) === String(id),
    )

  watch(
    tokenCookie,
    () => {
      syncSession()

      if (import.meta.client) {
        void fetchWishlist()
      }
    },
    { flush: 'sync' },
  )

  if (import.meta.client) {
    void fetchWishlist()
  }

  return {
    items,
    wishlist,

    isLoading,
    isUpdating,
    errorMessage,
    isInitialized,

    wishlistLoading,
    wishlistError,
    wishlistInitialized,

    totalItemsCount,
    subtotal,
    vat,
    shippingFee,
    total,

    hasCompletePricing,
    hasTaxInformation,
    hasShippingInformation,
    canCheckout,

    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,

    fetchWishlist,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
  }
})