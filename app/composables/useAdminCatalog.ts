import type { Brand, Category, MasterProduct, PaginationMeta } from '../../types/api'

export const useAdminCatalog = () => {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const categories = useState<Category[]>('admin_catalog_categories', () => [])
  const brands = useState<Brand[]>('admin_catalog_brands', () => [])
  const isLoading = ref(false)
  const isActionLoading = ref(false)

  /**
   * جلب التصنيفات
   */
  const fetchCategories = async (): Promise<Category[]> => {
    if (categories.value.length > 0) return categories.value
    try {
      const res: any = await $api('/categories')
      categories.value = Array.isArray(res) ? res : (res?.data || [])
      return categories.value
    } catch {
      return []
    }
  }

  /**
   * جلب العلامات التجارية
   */
  const fetchBrands = async (): Promise<Brand[]> => {
    if (brands.value.length > 0) return brands.value
    try {
      const res: any = await $api('/brands')
      brands.value = Array.isArray(res) ? res : (res?.data || [])
      return brands.value
    } catch {
      return []
    }
  }

  /**
   * جلب منتجات الكتالوج المرجعي مع التصفية والترقيم
   */
  const fetchMasterProducts = async (params: {
    page?: number
    category_id?: number | string | null
    brand_id?: number | string | null
    search?: string
  } = {}) => {
    isLoading.value = true
    try {
      const query: Record<string, any> = {}
      if (params.page) query.page = params.page
      if (params.category_id && params.category_id !== 'all') query.category_id = params.category_id
      if (params.brand_id && params.brand_id !== 'all') query.brand_id = params.brand_id
      if (params.search && params.search.trim()) query.search = params.search.trim()

      const res: any = await $api('/master-products', { query })

      const productsList: MasterProduct[] = Array.isArray(res) ? res : (res?.data || [])
      const meta: PaginationMeta = res?._meta || res?.meta || {
        current_page: params.page || 1,
        last_page: 1,
        per_page: 20,
        total: productsList.length,
      }

      return { products: productsList, meta }
    } catch (err: any) {
      notify(err?.data?.userMessage || 'تعذر جلب منتجات الكتالوج المرجعي.')
      return {
        products: [],
        meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * جلب تفاصيل منتج محدد مع المواصفات والصور
   */
  const fetchMasterProduct = async (id: number | string): Promise<MasterProduct | null> => {
    isLoading.value = true
    try {
      const res: any = await $api(`/master-products/${id}`)
      return res as MasterProduct
    } catch (err: any) {
      notify(err?.data?.userMessage || 'تعذر جلب تفاصيل المنتج.')
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * إضافة منتج جديد للكتالوج المرجعي (يدعم رفع Datasheet PDF)
   */
  const createMasterProduct = async (payload: FormData | Record<string, any>): Promise<MasterProduct> => {
    isActionLoading.value = true
    try {
      const res: any = await $api('/master-products', {
        method: 'POST',
        body: payload,
      })
      notify('تمت إضافة المنتج بنجاح إلى الكتالوج المرجعي!')
      return res as MasterProduct
    } catch (err: any) {
      const msg = err?.data?.userMessage || 'تعذر إضافة المنتج. يرجى مراجعة الحقول.'
      notify(msg)
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * تحديث بيانات منتج مرجعي
   */
  const updateMasterProduct = async (id: number | string, payload: FormData | Record<string, any>): Promise<MasterProduct> => {
    isActionLoading.value = true
    try {
      const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData
      const res: any = await $api(`/master-products/${id}`, {
        method: isFormData ? 'POST' : 'PUT',
        body: payload,
      })
      notify('تم تحديث بيانات المنتج بنجاح!')
      return res as MasterProduct
    } catch (err: any) {
      const msg = err?.data?.userMessage || 'تعذر تحديث المنتج.'
      notify(msg)
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * تفعيل / تعطيل منتج في الكتالوج
   */
  const toggleProductStatus = async (product: MasterProduct): Promise<boolean> => {
    const newStatus = !product.is_active
    try {
      await $api(`/master-products/${product.id}`, {
        method: 'PUT',
        body: {
          category_id: product.category?.id || product.category_id,
          brand_id: product.brand?.id || product.brand_id,
          title: product.title,
          model_number: product.model_number,
          is_active: newStatus,
        },
      })
      product.is_active = newStatus
      notify(newStatus ? 'تم تفعيل المنتج بنجاح في الكتالوج' : 'تم تعطيل المنتج وإيقافه مؤقتاً')
      return true
    } catch (err: any) {
      notify(err?.data?.userMessage || 'تعذر تغيير حالة المنتج.')
      return false
    }
  }

  /**
   * حذف منتج من الكتالوج المرجعي
   */
  const deleteMasterProduct = async (id: number | string): Promise<boolean> => {
    isActionLoading.value = true
    try {
      await $api(`/master-products/${id}`, {
        method: 'DELETE',
      })
      notify('تم حذف المنتج من الكتالوج بنجاح.')
      return true
    } catch (err: any) {
      const msg = err?.data?.userMessage || 'تعذر حذف المنتج، قد يكون مرتبطاً بعروض أسعار أو طلبات متاجر.'
      notify(msg)
      return false
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * إضافة مواصفة فنية ديناميكية للمنتج
   */
  const addSpecification = async (payload: {
    product_id: number
    name: string
    value: string
    unit?: string | null
  }) => {
    try {
      return await $api('/product-specifications', {
        method: 'POST',
        body: payload,
      })
    } catch (err: any) {
      notify(err?.data?.userMessage || 'تعذر إضافة المواصفة الفنية.')
      throw err
    }
  }

  /**
   * حذف مواصفة فنية
   */
  const deleteSpecification = async (id: number | string) => {
    try {
      return await $api(`/product-specifications/${id}`, {
        method: 'DELETE',
      })
    } catch (err: any) {
      notify(err?.data?.userMessage || 'تعذر حذف المواصفة الفنية.')
      throw err
    }
  }

  /**
   * رفع صورة لمنتج
   */
  const uploadProductImage = async (productId: number, imageFile: File, isFeatured = false) => {
    const formData = new FormData()
    formData.append('product_id', String(productId))
    formData.append('image', imageFile)
    if (isFeatured) {
      formData.append('is_featured', '1')
    }

    try {
      return await $api('/product-images', {
        method: 'POST',
        body: formData,
      })
    } catch (err: any) {
      notify(err?.data?.userMessage || 'تعذر رفع صورة المنتج.')
      throw err
    }
  }

  /**
   * تعيين صورة كصورة مميزة
   */
  const markImageFeatured = async (imageId: number) => {
    try {
      return await $api(`/product-images/${imageId}/feature`, {
        method: 'PATCH',
      })
    } catch (err: any) {
      notify(err?.data?.userMessage || 'تعذر تعيين الصورة كمميزة.')
      throw err
    }
  }

  /**
   * حذف صورة منتج
   */
  const deleteProductImage = async (imageId: number) => {
    try {
      return await $api(`/product-images/${imageId}`, {
        method: 'DELETE',
      })
    } catch (err: any) {
      notify(err?.data?.userMessage || 'تعذر حذف الصورة.')
      throw err
    }
  }

  return {
    categories,
    brands,
    isLoading,
    isActionLoading,
    fetchCategories,
    fetchBrands,
    fetchMasterProducts,
    fetchMasterProduct,
    createMasterProduct,
    updateMasterProduct,
    toggleProductStatus,
    deleteMasterProduct,
    addSpecification,
    deleteSpecification,
    uploadProductImage,
    markImageFeatured,
    deleteProductImage,
  }
}
