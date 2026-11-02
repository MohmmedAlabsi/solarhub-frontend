import { defineStore } from 'pinia'
import type { Product } from '~~/types/ecommerce'

export interface CartStoreItem {
  id?: number // cart item id in Laravel DB
  product: Product
  quantity: number
  line_total?: number
}

function resolveProductImage(sp: any, catName?: string): string {
  const mp = sp?.master_product || sp?.masterProduct
  const img = mp?.images?.[0]?.image_url || mp?.images?.[0]?.image_path
  if (img) return img

  const text = `${catName || ''} ${mp?.title || ''}`.toLowerCase()
  if (text.includes('panel') || text.includes('ألو') || text.includes('لوح')) return '/images/product-panel.png'
  if (text.includes('invert') || text.includes('محو') || text.includes('هجين')) return '/images/product-inverter.png'
  if (text.includes('batter') || text.includes('بطار') || text.includes('ليث')) return '/images/product-battery.png'
  if (text.includes('pump') || text.includes('مضخ')) return '/images/hero-solar.png'
  return '/images/product-kit.png'
}

export const useCartStore = defineStore('cart', () => {
  const { $api } = useNuxtApp()
  const tokenCookie = useCookie<string | null>('auth_token')

  const items = ref<CartStoreItem[]>([])
  const wishlist = ref<Product[]>([])
  const isLoading = ref(false)
  const isUpdating = ref<Record<string | number, boolean>>({})
  const errorMessage = ref<string | null>(null)
  const isInitialized = ref(false)

  // هل المستخدم مسجل دخول؟
  const isAuthenticated = computed(() => {
    if (tokenCookie.value) return true
    if (import.meta.client) {
      return Boolean(localStorage.getItem('solarhub_token') || localStorage.getItem('auth_token'))
    }
    return false
  })

  // إجمالي عدد العناصر في السلة
  const totalItemsCount = computed(() => {
    return items.value.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
  })

  // المجموع الفرعي
  const subtotal = computed(() => {
    return items.value.reduce((acc, item) => {
      const price = Number(item.product?.price) || 0
      const qty = Number(item.quantity) || 0
      return acc + (item.line_total ?? price * qty)
    }, 0)
  })

  // ضريبة القيمة المضافة 15%
  const vat = computed(() => {
    return Math.round(subtotal.value * 0.15 * 100) / 100
  })

  // رسوم الشحن (مجاني إذا تجاوز 1000 ر.س)
  const shippingFee = computed(() => {
    if (items.value.length === 0) return 0
    return subtotal.value >= 1000 ? 0 : 50
  })

  // الإجمالي الكلي
  const total = computed(() => {
    return Math.round((subtotal.value + vat.value + shippingFee.value) * 100) / 100
  })

  /**
   * حفظ محتويات السلة في التخزين المحلي للزوار غير المسجلين
   */
  const saveLocalCart = () => {
    if (import.meta.client) {
      try {
        localStorage.setItem('solarhub_guest_cart', JSON.stringify(items.value))
      } catch {
        /* storage fallback */
      }
    }
  }

  /**
   * تحميل السلة من التخزين المحلي للزوار غير المسجلين
   */
  const loadLocalCart = () => {
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem('solarhub_guest_cart')
        if (raw) {
          items.value = JSON.parse(raw)
        }
      } catch {
        /* ignore */
      }
    }
  }

  /**
   * تحويل استجابة عنصر سلة Laravel إلى CartStoreItem
   */
  const mapApiCartItem = (apiItem: any): CartStoreItem => {
    const sp = apiItem.store_product || {}
    const storeObj = sp.store || {}
    const price = Number(sp.price) || 0
    const qty = Number(apiItem.quantity) || 1
    const lineTotal = Number(apiItem.line_total) || price * qty

    const product: Product = {
      id: sp.id || apiItem.id, // store_product_id
      name: sp.title || 'منتج طاقة شمسية معتمد',
      category: 'معدات كهروضوئية',
      categoryType: 'panel',
      brand: 'SolarHub Tier 1',
      model: 'معتمد',
      storeName: storeObj.company_name || 'المتجر المعتمد',
      storeCity: 'اليمن',
      price,
      currency: 'ر.س',
      rating: 4.9,
      reviewsCount: 35,
      image: resolveProductImage(sp),
      badge: 'Tier 1 Global',
      specs: { warranty: 'معتمد' },
      inStock: (Number(sp.stock_quantity) || 1) > 0,
    }

    return {
      id: apiItem.id,
      quantity: qty,
      product,
      line_total: lineTotal,
    }
  }

  /**
   * جلب سلة المشتريات من مخدم Laravel
   */
  const fetchCart = async () => {
    if (!isAuthenticated.value) {
      loadLocalCart()
      isInitialized.value = true
      return
    }

    isLoading.value = true
    errorMessage.value = null
    try {
      const res: any = await $api('/my/cart')
      const cartData = res?.data || res
      if (cartData && Array.isArray(cartData.items)) {
        items.value = cartData.items.map(mapApiCartItem)
      } else {
        items.value = []
      }
    } catch (err: any) {
      console.warn('Could not fetch server cart, falling back to local:', err?.message)
      loadLocalCart()
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  /**
   * إضافة منتج إلى سلة المشتريات
   */
  const addToCart = async (productOrStoreProduct: Product | any, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1)
    const storeProductId = Number(productOrStoreProduct.storeProductId || productOrStoreProduct.id)

    // للمستخدم المسجل: إرسال الطلب فوراً إلى API السلة
    if (isAuthenticated.value && storeProductId) {
      isLoading.value = true
      try {
        const res: any = await $api('/my/cart/items', {
          method: 'POST',
          body: {
            store_product_id: storeProductId,
            quantity: qty,
          },
        })
        const cartData = res?.data || res
        if (cartData && Array.isArray(cartData.items)) {
          items.value = cartData.items.map(mapApiCartItem)
        }
        return true
      } catch (err: any) {
        console.error('Failed to add item to API cart:', err)
        // Fallback to local
      } finally {
        isLoading.value = false
      }
    }

    // للمستخدم غير المسجل أو fallback
    const productIdStr = String(productOrStoreProduct.id)
    const existingIndex = items.value.findIndex(i => String(i.product.id) === productIdStr)

    if (existingIndex > -1) {
      const existing = items.value[existingIndex]
      if (existing) {
        existing.quantity += qty
        existing.line_total = existing.quantity * (Number(existing.product.price) || 0)
      }
    } else {
      const newProduct: Product = {
        id: productOrStoreProduct.id,
        name: productOrStoreProduct.name || productOrStoreProduct.title || 'منتج طاقة شمسية',
        category: productOrStoreProduct.category || 'معدات طاقة شمسية',
        categoryType: productOrStoreProduct.categoryType || 'panel',
        brand: productOrStoreProduct.brand || 'معتمد',
        model: productOrStoreProduct.model || '',
        storeName: productOrStoreProduct.storeName || 'المتجر المعتمد',
        storeCity: productOrStoreProduct.storeCity || 'اليمن',
        price: Number(productOrStoreProduct.price) || 0,
        currency: productOrStoreProduct.currency || 'ر.س',
        rating: productOrStoreProduct.rating || 4.9,
        reviewsCount: productOrStoreProduct.reviewsCount || 20,
        image: productOrStoreProduct.image || '/images/product-panel.png',
        badge: productOrStoreProduct.badge || 'Tier 1 Global',
        specs: productOrStoreProduct.specs || {},
        inStock: true,
      }

      items.value.push({
        product: newProduct,
        quantity: qty,
        line_total: qty * (Number(newProduct.price) || 0),
      })
    }

    saveLocalCart()
    return true
  }

  /**
   * تحديث كمية عنصر في السلة
   */
  const updateQuantity = async (productIdOrCartItemId: string | number, newQuantity: number) => {
    const qty = Number(newQuantity)
    if (qty <= 0) {
      return removeFromCart(productIdOrCartItemId)
    }

    const item = items.value.find(
      i => String(i.id) === String(productIdOrCartItemId) || String(i.product.id) === String(productIdOrCartItemId)
    )
    if (!item) return

    // تحديث تفاؤلي سريع (Optimistic UI)
    const oldQty = item.quantity
    item.quantity = qty
    item.line_total = qty * (Number(item.product.price) || 0)

    const cartItemId = item.id
    if (isAuthenticated.value && cartItemId) {
      isUpdating.value[cartItemId] = true
      try {
        const res: any = await $api(`/my/cart/items/${cartItemId}`, {
          method: 'PUT',
          body: { quantity: qty },
        })
        const cartData = res?.data || res
        if (cartData && Array.isArray(cartData.items)) {
          items.value = cartData.items.map(mapApiCartItem)
        }
      } catch (err: any) {
        console.error('Failed to update cart quantity on server:', err)
        item.quantity = oldQty
        item.line_total = oldQty * (Number(item.product.price) || 0)
      } finally {
        isUpdating.value[cartItemId] = false
      }
    } else {
      saveLocalCart()
    }
  }

  /**
   * حذف عنصر من السلة
   */
  const removeFromCart = async (productIdOrCartItemId: string | number) => {
    const itemIndex = items.value.findIndex(
      i => String(i.id) === String(productIdOrCartItemId) || String(i.product.id) === String(productIdOrCartItemId)
    )
    if (itemIndex === -1) return

    const item = items.value[itemIndex]
    const cartItemId = item?.id

    // إزالة محلية فورية
    items.value.splice(itemIndex, 1)

    if (isAuthenticated.value && cartItemId) {
      try {
        const res: any = await $api(`/my/cart/items/${cartItemId}`, {
          method: 'DELETE',
        })
        const cartData = res?.data || res
        if (cartData && Array.isArray(cartData.items)) {
          items.value = cartData.items.map(mapApiCartItem)
        }
      } catch (err: any) {
        console.error('Failed to delete item from server cart:', err)
      }
    } else {
      saveLocalCart()
    }
  }

  /**
   * تفريغ السلة بالكامل
   */
  const clearCart = async () => {
    items.value = []
    if (isAuthenticated.value) {
      try {
        await $api('/my/cart', { method: 'DELETE' })
      } catch (err: any) {
        console.error('Failed to clear cart on server:', err)
      }
    } else {
      saveLocalCart()
    }
  }

  function mapFavoriteToProduct(fav: any): Product {
    const sp = fav.product || fav.store_product || fav
    const mp = sp?.master_product || sp?.masterProduct || sp
    const cat = mp?.category?.name || 'طاقة شمسية'
    return {
      id: sp?.id || fav.store_product_id,
      name: mp?.title || mp?.name || 'منتج طاقة شمسية',
      category: cat,
      categoryType: 'panel',
      brand: mp?.brand?.name || 'علامة معتمدة',
      model: mp?.model_number || 'موديل قياسي',
      storeName: sp?.store?.company_name || 'متجر معتمد',
      storeCity: sp?.store?.address_details || 'اليمن',
      price: Number(sp?.price || sp?.unit_price || 0),
      currency: 'ر.س',
      rating: 4.8,
      reviewsCount: 12,
      image: resolveProductImage(sp, cat),
      inStock: (sp?.stock_quantity ?? 1) > 0,
      stockQuantity: sp?.stock_quantity ?? 1,
    }
  }

  /**
   * جلب قائمة المفضلة من الخادم
   */
  const fetchWishlist = async () => {
    if (!tokenCookie.value) return
    try {
      const res: any = await $api('/favorites')
      const rawList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : [])
      if (rawList.length > 0) {
        wishlist.value = rawList.map(mapFavoriteToProduct)
      } else {
        wishlist.value = []
      }
      if (import.meta.client) {
        localStorage.setItem('solarhub_wishlist', JSON.stringify(wishlist.value))
      }
    } catch (err) {
      console.warn('Could not fetch server favorites, using local fallback:', err)
    }
  }

  /**
   * إدارة وتبديل حالة المنتج في المفضلة
   */
  const toggleWishlist = async (product: Product) => {
    const index = wishlist.value.findIndex(p => String(p.id) === String(product.id))
    const wasIn = index > -1
    if (wasIn) {
      wishlist.value.splice(index, 1)
    } else {
      wishlist.value.push(product)
    }
    if (import.meta.client) {
      try {
        localStorage.setItem('solarhub_wishlist', JSON.stringify(wishlist.value))
      } catch {
        /* storage fallback */
      }
    }

    if (tokenCookie.value) {
      try {
        await $api(`/favorites/${product.id}/toggle`, { method: 'POST' })
      } catch (err) {
        console.warn('Failed to sync favorite with server:', err)
      }
    }
  }

  const removeFromWishlist = async (productId: string | number) => {
    const index = wishlist.value.findIndex(p => String(p.id) === String(productId))
    if (index > -1) {
      wishlist.value.splice(index, 1)
      if (import.meta.client) {
        try {
          localStorage.setItem('solarhub_wishlist', JSON.stringify(wishlist.value))
        } catch {
          /* storage fallback */
        }
      }
    }

    if (tokenCookie.value) {
      try {
        await $api(`/favorites/${productId}`, { method: 'DELETE' })
      } catch (err) {
        console.warn('Failed to delete favorite on server:', err)
      }
    }
  }

  const isInWishlist = (productId: string | number) => {
    return wishlist.value.some(p => String(p.id) === String(productId))
  }

  // تحميل المفضلة عند التشغيل
  if (import.meta.client) {
    try {
      const savedWishlist = localStorage.getItem('solarhub_wishlist')
      if (savedWishlist) {
        wishlist.value = JSON.parse(savedWishlist)
      }
    } catch {
      /* ignore */
    }
  }

  return {
    items,
    wishlist,
    isLoading,
    isUpdating,
    errorMessage,
    isInitialized,
    totalItemsCount,
    subtotal,
    vat,
    shippingFee,
    total,
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
