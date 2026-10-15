import { defineStore } from 'pinia'
import type { CartItem, Product } from '~~/types/ecommerce'

export const useCartStore = defineStore('cart', () => {
  // منتجات أولية مطابقة للتصاميم في سلة المشتريات
  const items = ref<CartItem[]>([
    {
      product: {
        id: '1',
        name: 'لوح طاقة شمسية Jinko Tiger Pro 585W ثنائي الأوجه',
        category: 'ألواح كهروضوئية',
        categoryType: 'panel',
        brand: 'Jinko Solar',
        model: 'Tiger Pro 585W',
        storeName: 'شركة شمس الرياض للمهمات الكهروضوئية',
        storeCity: 'الرياض',
        price: 485,
        currency: 'ر.س',
        rating: 4.9,
        reviewsCount: 48,
        image: '/images/product-panel.png',
        badge: 'Tier 1 Global',
        specs: { power: '585W', efficiency: '21.5%', warranty: '25 سنة' },
        inStock: true,
      },
      quantity: 2,
    },
    {
      product: {
        id: '2',
        name: 'إنفرتر طاقة شمسي هجين Growatt SPF 5000 ES بقدرة 5kW',
        category: 'محولات هجينة',
        categoryType: 'inverter',
        brand: 'Growatt',
        model: 'SPF 5000 ES',
        storeName: 'شركة شمس الرياض للمهمات الكهروضوئية',
        storeCity: 'الرياض',
        price: 3150,
        currency: 'ر.س',
        rating: 4.7,
        reviewsCount: 34,
        image: '/images/product-inverter.png',
        badge: 'مستقل عن الشبكة',
        specs: { power: '5000W', voltage: '48V', warranty: '5 سنوات' },
        inStock: true,
      },
      quantity: 1,
    },
    {
      product: {
        id: '3',
        name: 'بطارية ليثيوم Pylontech US5000 48V 4.8kWh دورات تفريغ 6000+',
        category: 'تخزين ليثيوم',
        categoryType: 'battery',
        brand: 'Pylontech',
        model: 'US5000',
        storeName: 'مؤسسة طاقة الصحراء للتوريدات المتقدمة',
        storeCity: 'الدمام',
        price: 6450,
        currency: 'ر.س',
        rating: 5.0,
        reviewsCount: 89,
        image: '/images/product-battery.png',
        badge: '6000+ دورة',
        specs: { capacity: '4.8kWh', voltage: '48V', warranty: '10 سنوات' },
        inStock: true,
      },
      quantity: 1,
    },
  ])

  // المفضلة
  const wishlist = ref<Product[]>([])

  // إجمالي عدد العناصر
  const totalItemsCount = computed(() => {
    return items.value.reduce((acc, item) => acc + item.quantity, 0)
  })

  // المجموع الفرعي
  const subtotal = computed(() => {
    return items.value.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  })

  // ضريبة القيمة المضافة 15%
  const vat = computed(() => {
    return Math.round(subtotal.value * 0.15 * 100) / 100
  })

  // رسوم الشحن (مجاني في العرض)
  const shippingFee = ref(0)

  // الإجمالي الكلي
  const total = computed(() => {
    return subtotal.value + vat.value + shippingFee.value
  })

  // إضافة منتج للسلة
  function addToCart(product: Product, quantity = 1) {
    const existingIndex = items.value.findIndex(i => String(i.product.id) === String(product.id))
    if (existingIndex > -1) {
      items.value[existingIndex].quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }
  }

  // تحديث الكمية
  function updateQuantity(productId: string | number, quantity: number) {
    const item = items.value.find(i => String(i.product.id) === String(productId))
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  // حذف منتج من السلة
  function removeFromCart(productId: string | number) {
    items.value = items.value.filter(i => String(i.product.id) !== String(productId))
  }

  // تفريغ السلة
  function clearCart() {
    items.value = []
  }

  // تبديل المفضلة
  function toggleWishlist(product: Product) {
    const index = wishlist.value.findIndex(p => String(p.id) === String(product.id))
    if (index > -1) {
      wishlist.value.splice(index, 1)
    } else {
      wishlist.value.push(product)
    }
  }

  function isInWishlist(productId: string | number) {
    return wishlist.value.some(p => String(p.id) === String(productId))
  }

  return {
    items,
    wishlist,
    totalItemsCount,
    subtotal,
    vat,
    shippingFee,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isInWishlist,
  }
})
