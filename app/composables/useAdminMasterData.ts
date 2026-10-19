import type { Brand, Category, Governorate, ServiceType, Specialization } from '../../types/api'

export const useAdminMasterData = () => {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const categories = useState<Category[]>('admin_master_categories', () => [])
  const brands = useState<Brand[]>('admin_master_brands', () => [])
  const cities = useState<Governorate[]>('admin_master_cities', () => [])
  const serviceTypes = useState<ServiceType[]>('admin_master_service_types', () => [])
  const specialties = useState<Specialization[]>('admin_master_specialties', () => [])

  const isLoading = ref(false)
  const isActionLoading = ref(false)

  // ==========================================
  // 1. التصنيفات (Categories)
  // ==========================================
  const fetchCategories = async (force = false): Promise<Category[]> => {
    if (!force && categories.value.length > 0) return categories.value
    isLoading.value = true
    try {
      const res: any = await $api('/categories')
      const data = Array.isArray(res) ? res : (res?.data || [])
      categories.value = data
      return data
    } catch (err: any) {
      notify(err?.userMessage || 'تعذر تحميل قائمة التصنيفات من الخادم')
      return []
    } finally {
      isLoading.value = false
    }
  }

  const createCategory = async (data: FormData | Record<string, any>): Promise<Category | null> => {
    isActionLoading.value = true
    try {
      const res: any = await $api('/categories', {
        method: 'POST',
        body: data,
      })
      const created = res?.data || res
      notify('تمت إضافة التصنيف بنجاح')
      await fetchCategories(true)
      return created
    } catch (err: any) {
      notify(err?.userMessage || 'حدث خطأ أثناء إضافة التصنيف، يرجى مراجعة البيانات المدخلة.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const updateCategory = async (id: number | string, data: FormData | Record<string, any>): Promise<Category | null> => {
    isActionLoading.value = true
    try {
      // In Laravel, if multipart FormData is sent, use POST with _method=PUT
      let res: any
      if (data instanceof FormData) {
        if (!data.has('_method')) {
          data.append('_method', 'PUT')
        }
        res = await $api(`/categories/${id}`, {
          method: 'POST',
          body: data,
        })
      } else {
        res = await $api(`/categories/${id}`, {
          method: 'PUT',
          body: data,
        })
      }
      const updated = res?.data || res
      notify('تم تحديث التصنيف بنجاح')
      await fetchCategories(true)
      return updated
    } catch (err: any) {
      notify(err?.userMessage || 'حدث خطأ أثناء تحديث التصنيف.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const deleteCategory = async (id: number | string): Promise<boolean> => {
    isActionLoading.value = true
    try {
      await $api(`/categories/${id}`, {
        method: 'DELETE',
      })
      notify('تم حذف التصنيف بنجاح')
      categories.value = categories.value.filter(c => String(c.id) !== String(id))
      return true
    } catch (err: any) {
      const status = err?.status || err?.statusCode || err?.response?.status
      if (status === 409) {
        notify('تعذر الحذف: هذا التصنيف يحتوي على تصنيفات فرعية أو منتجات مرتبطة به.')
      } else {
        notify(err?.userMessage || 'تعذر حذف التصنيف.')
      }
      return false
    } finally {
      isActionLoading.value = false
    }
  }

  // ==========================================
  // 2. العلامات التجارية (Brands)
  // ==========================================
  const fetchBrands = async (force = false): Promise<Brand[]> => {
    if (!force && brands.value.length > 0) return brands.value
    isLoading.value = true
    try {
      const res: any = await $api('/brands')
      const data = Array.isArray(res) ? res : (res?.data || [])
      brands.value = data
      return data
    } catch (err: any) {
      notify(err?.userMessage || 'تعذر تحميل قائمة العلامات التجارية من الخادم')
      return []
    } finally {
      isLoading.value = false
    }
  }

  const createBrand = async (data: FormData | Record<string, any>): Promise<Brand | null> => {
    isActionLoading.value = true
    try {
      const res: any = await $api('/brands', {
        method: 'POST',
        body: data,
      })
      const created = res?.data || res
      notify('تمت إضافة العلامة التجارية بنجاح')
      await fetchBrands(true)
      return created
    } catch (err: any) {
      notify(err?.userMessage || 'حدث خطأ أثناء إضافة العلامة التجارية.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const updateBrand = async (id: number | string, data: FormData | Record<string, any>): Promise<Brand | null> => {
    isActionLoading.value = true
    try {
      let res: any
      if (data instanceof FormData) {
        if (!data.has('_method')) {
          data.append('_method', 'PUT')
        }
        res = await $api(`/brands/${id}`, {
          method: 'POST',
          body: data,
        })
      } else {
        res = await $api(`/brands/${id}`, {
          method: 'PUT',
          body: data,
        })
      }
      const updated = res?.data || res
      notify('تم تحديث العلامة التجارية بنجاح')
      await fetchBrands(true)
      return updated
    } catch (err: any) {
      notify(err?.userMessage || 'حدث خطأ أثناء تحديث العلامة التجارية.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const deleteBrand = async (id: number | string): Promise<boolean> => {
    isActionLoading.value = true
    try {
      await $api(`/brands/${id}`, {
        method: 'DELETE',
      })
      notify('تم حذف العلامة التجارية بنجاح')
      brands.value = brands.value.filter(b => String(b.id) !== String(id))
      return true
    } catch (err: any) {
      const status = err?.status || err?.statusCode || err?.response?.status
      if (status === 409) {
        notify('تعذر الحذف: هذه العلامة التجارية مرتبطة بمنتجات موجودة في الكتالوج.')
      } else {
        notify(err?.userMessage || 'تعذر حذف العلامة التجارية.')
      }
      return false
    } finally {
      isActionLoading.value = false
    }
  }

  // ==========================================
  // 3. المحافظات والمناطق (Governorates / Cities)
  // ==========================================
  const fetchCities = async (force = false): Promise<Governorate[]> => {
    if (!force && cities.value.length > 0) return cities.value
    isLoading.value = true
    try {
      const res: any = await $api('/governorates')
      const data = Array.isArray(res) ? res : (res?.data || [])
      cities.value = data
      return data
    } catch (err: any) {
      notify(err?.userMessage || 'تعذر تحميل قائمة المحافظات من الخادم')
      return []
    } finally {
      isLoading.value = false
    }
  }

  const createCity = async (data: { name_ar: string; name_en?: string | null; is_active?: boolean }): Promise<Governorate | null> => {
    isActionLoading.value = true
    try {
      const res: any = await $api('/governorates', {
        method: 'POST',
        body: data,
      })
      const created = res?.data || res
      notify('تمت إضافة المحافظة بنجاح')
      await fetchCities(true)
      return created
    } catch (err: any) {
      notify(err?.userMessage || 'حدث خطأ أثناء إضافة المحافظة.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const updateCity = async (id: number | string, data: { name_ar?: string; name_en?: string | null; is_active?: boolean }): Promise<Governorate | null> => {
    isActionLoading.value = true
    try {
      const res: any = await $api(`/governorates/${id}`, {
        method: 'PUT',
        body: data,
      })
      const updated = res?.data || res
      notify('تم تحديث المحافظة بنجاح')
      await fetchCities(true)
      return updated
    } catch (err: any) {
      notify(err?.userMessage || 'حدث خطأ أثناء تحديث المحافظة.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const deleteCity = async (id: number | string): Promise<boolean> => {
    isActionLoading.value = true
    try {
      await $api(`/governorates/${id}`, {
        method: 'DELETE',
      })
      notify('تم حذف المحافظة بنجاح')
      cities.value = cities.value.filter(c => String(c.id) !== String(id))
      return true
    } catch (err: any) {
      const status = err?.status || err?.statusCode || err?.response?.status
      if (status === 409) {
        notify('تعذر الحذف: هذه المحافظة مرتبطة بمستخدمين أو منتجات متاجر نشطة.')
      } else {
        notify(err?.userMessage || 'تعذر حذف المحافظة.')
      }
      return false
    } finally {
      isActionLoading.value = false
    }
  }

  // ==========================================
  // 4. أنواع الخدمات الهندسية (Service Types)
  // ==========================================
  const fetchServiceTypes = async (force = false): Promise<ServiceType[]> => {
    if (!force && serviceTypes.value.length > 0) return serviceTypes.value
    isLoading.value = true
    try {
      const res: any = await $api('/service-types')
      const data = Array.isArray(res) ? res : (res?.data || [])
      serviceTypes.value = data
      return data
    } catch (err: any) {
      notify(err?.userMessage || 'تعذر تحميل باقات الخدمات الهندسية من الخادم')
      return []
    } finally {
      isLoading.value = false
    }
  }

  // ==========================================
  // 5. التخصصات المهنية (Specialties / Specializations)
  // ==========================================
  const fetchSpecialties = async (force = false): Promise<Specialization[]> => {
    if (!force && specialties.value.length > 0) return specialties.value
    isLoading.value = true
    try {
      // 1. Try direct specializations endpoint if registered
      try {
        const res: any = await $api('/specializations')
        const data = Array.isArray(res) ? res : (res?.data || [])
        if (data.length > 0) {
          specialties.value = data
          return data
        }
      } catch {
        /* Fallback to aggregating from engineers */
      }

      // 2. Fetch engineers and aggregate their real registered specializations
      const engRes: any = await $api('/engineers')
      const engineers = Array.isArray(engRes) ? engRes : (engRes?.data || [])

      const specMap = new Map<number, { id: number; name: string; count: number }>()

      for (const eng of engineers) {
        if (Array.isArray(eng.specializations)) {
          for (const sp of eng.specializations) {
            if (sp && sp.id) {
              const current = specMap.get(sp.id) || { id: sp.id, name: sp.name, count: 0 }
              current.count++
              specMap.set(sp.id, current)
            }
          }
        }
      }

      if (specMap.size > 0) {
        const aggregated: Specialization[] = Array.from(specMap.values()).map(s => ({
          id: s.id,
          name: s.name,
          description: `تخصص مهني معتمد للمهندسين مسجل في النظام (${s.name}).`,
          is_active: true,
          engineers_count: s.count,
        }))
        specialties.value = aggregated
        return aggregated
      }

      return specialties.value
    } catch (err: any) {
      notify(err?.userMessage || 'تعذر تحميل التخصصات المهنية')
      return []
    } finally {
      isLoading.value = false
    }
  }

  return {
    categories,
    brands,
    cities,
    serviceTypes,
    specialties,
    isLoading,
    isActionLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    fetchCities,
    createCity,
    updateCity,
    deleteCity,
    fetchServiceTypes,
    fetchSpecialties,
  }
}
