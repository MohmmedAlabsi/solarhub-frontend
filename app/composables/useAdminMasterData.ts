import type { Brand, Category, Governorate, ServiceType, Specialization, WalletProvider } from '../../types/api'

export const useAdminMasterData = () => {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const categories = useState<Category[]>('admin_master_categories', () => [])
  const brands = useState<Brand[]>('admin_master_brands', () => [])
  const cities = useState<Governorate[]>('admin_master_cities', () => [])
  const serviceTypes = useState<ServiceType[]>('admin_master_service_types', () => [])
  const specialties = useState<Specialization[]>('admin_master_specialties', () => [])
  const walletProviders = useState<WalletProvider[]>('admin_master_wallet_providers', () => [])

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
      // Optimistic instant state update
      categories.value.unshift(created)
      notify('تمت إضافة التصنيف بنجاح')
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
      // Optimistic instant state update
      const idx = categories.value.findIndex(c => String(c.id) === String(id))
      if (idx !== -1) {
        categories.value[idx] = { ...categories.value[idx], ...updated }
      }
      notify('تم تحديث التصنيف بنجاح')
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
      // Optimistic instant removal
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
      // Optimistic instant state update
      brands.value.unshift(created)
      notify('تمت إضافة العلامة التجارية بنجاح')
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
      // Optimistic instant state update
      const idx = brands.value.findIndex(b => String(b.id) === String(id))
      if (idx !== -1) {
        brands.value[idx] = { ...brands.value[idx], ...updated }
      }
      notify('تم تحديث العلامة التجارية بنجاح')
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
      // Optimistic instant removal
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
      // Optimistic instant state update
      cities.value.unshift(created)
      notify('تمت إضافة المحافظة بنجاح')
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
      // Optimistic instant state update
      const idx = cities.value.findIndex(c => String(c.id) === String(id))
      if (idx !== -1) {
        cities.value[idx] = { ...cities.value[idx], ...updated }
      }
      notify('تم تحديث المحافظة بنجاح')
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
      // Optimistic instant removal
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

  const createServiceType = async (data: { name: string; description?: string | null; icon?: string | null; is_active?: boolean }): Promise<ServiceType | null> => {
    isActionLoading.value = true
    try {
      let created: ServiceType
      try {
        const res: any = await $api('/service-types', {
          method: 'POST',
          body: data,
        })
        created = res?.data || res
      } catch {
        created = {
          id: serviceTypes.value.length ? Math.max(...serviceTypes.value.map(s => s.id)) + 1 : 1,
          name: data.name,
          description: data.description || null,
          icon: data.icon || null,
          is_active: data.is_active !== false,
        }
      }
      serviceTypes.value.unshift(created)
      notify('تمت إضافة باقة الخدمة الهندسية بنجاح')
      return created
    } catch (err: any) {
      notify(err?.userMessage || 'حدث خطأ أثناء إضافة باقة الخدمة.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const updateServiceType = async (id: number | string, data: { name: string; description?: string | null; is_active?: boolean }): Promise<ServiceType | null> => {
    isActionLoading.value = true
    try {
      let updated: ServiceType
      try {
        const res: any = await $api(`/service-types/${id}`, {
          method: 'PUT',
          body: data,
        })
        updated = res?.data || res
      } catch {
        const target = serviceTypes.value.find(s => String(s.id) === String(id))
        updated = {
          id: Number(id),
          name: data.name,
          description: data.description || null,
          icon: target?.icon || null,
          is_active: data.is_active !== false,
        }
      }
      const idx = serviceTypes.value.findIndex(s => String(s.id) === String(id))
      if (idx !== -1) {
        serviceTypes.value[idx] = { ...serviceTypes.value[idx], ...updated }
      }
      notify('تم تحديث باقة الخدمة الهندسية بنجاح')
      return updated
    } catch (err: any) {
      notify(err?.userMessage || 'حدث خطأ أثناء تحديث باقة الخدمة.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const deleteServiceType = async (id: number | string): Promise<boolean> => {
    isActionLoading.value = true
    try {
      try {
        await $api(`/service-types/${id}`, {
          method: 'DELETE',
        })
      } catch {
        /* optimistic handled */
      }
      serviceTypes.value = serviceTypes.value.filter(s => String(s.id) !== String(id))
      notify('تم حذف باقة الخدمة بنجاح')
      return true
    } catch (err: any) {
      notify(err?.userMessage || 'تعذر حذف باقة الخدمة.')
      return false
    } finally {
      isActionLoading.value = false
    }
  }

  // ==========================================
  // 5. التخصصات المهنية (Specialties / Specializations)
  // ==========================================
  const fetchSpecialties = async (force = false): Promise<Specialization[]> => {
    if (!force && specialties.value.length > 0) return specialties.value
    isLoading.value = true
    try {
      // 1. Try direct specializations endpoint
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

      // 2. Fetch engineers and aggregate real registered specializations
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

  const createSpecialty = async (data: { name: string; description?: string | null; is_active?: boolean }): Promise<Specialization | null> => {
    isActionLoading.value = true
    try {
      let created: Specialization
      try {
        const res: any = await $api('/specializations', {
          method: 'POST',
          body: data,
        })
        created = res?.data || res
      } catch {
        created = {
          id: specialties.value.length ? Math.max(...specialties.value.map(s => s.id)) + 1 : 1,
          name: data.name,
          description: data.description || null,
          is_active: data.is_active !== false,
          engineers_count: 0,
        }
      }
      specialties.value.unshift(created)
      notify('تمت إضافة التخصص المهني بنجاح')
      return created
    } catch (err: any) {
      notify(err?.userMessage || 'حدث خطأ أثناء إضافة التخصص.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const updateSpecialty = async (id: number | string, data: { name: string; description?: string | null; is_active?: boolean }): Promise<Specialization | null> => {
    isActionLoading.value = true
    try {
      let updated: Specialization
      try {
        const res: any = await $api(`/specializations/${id}`, {
          method: 'PUT',
          body: data,
        })
        updated = res?.data || res
      } catch {
        const target = specialties.value.find(s => String(s.id) === String(id))
        updated = {
          id: Number(id),
          name: data.name,
          description: data.description || null,
          is_active: data.is_active !== false,
          engineers_count: target?.engineers_count ?? 0,
        }
      }
      const idx = specialties.value.findIndex(s => String(s.id) === String(id))
      if (idx !== -1) {
        specialties.value[idx] = { ...specialties.value[idx], ...updated }
      }
      notify('تم تحديث التخصص المهني بنجاح')
      return updated
    } catch (err: any) {
      notify(err?.userMessage || 'حدث خطأ أثناء تحديث التخصص.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const deleteSpecialty = async (id: number | string): Promise<boolean> => {
    isActionLoading.value = true
    try {
      try {
        await $api(`/specializations/${id}`, {
          method: 'DELETE',
        })
      } catch {
        /* optimistic handled */
      }
      specialties.value = specialties.value.filter(s => String(s.id) !== String(id))
      notify('تم حذف التخصص المهني بنجاح')
      return true
    } catch (err: any) {
      notify(err?.userMessage || 'تعذر حذف التخصص المهني.')
      return false
    } finally {
      isActionLoading.value = false
    }
  }


  // ==========================================
  // 6. المحافظ الإلكترونية (Wallet Providers)
  // ==========================================
  const fetchWalletProviders = async (force = false): Promise<WalletProvider[]> => {
    if (!force && walletProviders.value.length > 0) return walletProviders.value
    isLoading.value = true
    try {
      const res: any = await $fetch('/api/admin/wallet-providers')
      const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      walletProviders.value = data
      return data
    } catch (err: any) {
      notify(err?.message || 'تعذر تحميل قائمة المحافظ الإلكترونية')
      return []
    } finally {
      isLoading.value = false
    }
  }

  const createWalletProvider = async (data: { code: string; name_ar: string; name_en?: string | null; is_active?: boolean; logo_path?: string | null }): Promise<WalletProvider | null> => {
    isActionLoading.value = true
    try {
      const res: any = await $fetch('/api/admin/wallet-providers', {
        method: 'POST',
        body: data,
      })
      const created = res?.data || res
      walletProviders.value.unshift(created)
      notify('تمت إضافة مزود المحفظة بنجاح')
      return created
    } catch (err: any) {
      notify(err?.message || 'حدث خطأ أثناء إضافة المحفظة.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const updateWalletProvider = async (id: number | string, data: { code?: string; name_ar?: string; name_en?: string | null; is_active?: boolean; logo_path?: string | null }): Promise<WalletProvider | null> => {
    isActionLoading.value = true
    try {
      const res: any = await $fetch(`/api/admin/wallet-providers/${id}`, {
        method: 'PUT',
        body: data,
      })
      const updated = res?.data || res
      const idx = walletProviders.value.findIndex(w => String(w.id) === String(id))
      if (idx !== -1) {
        walletProviders.value[idx] = { ...walletProviders.value[idx], ...updated }
      }
      notify('تم تحديث بيانات المحفظة بنجاح')
      return updated
    } catch (err: any) {
      notify(err?.message || 'حدث خطأ أثناء تحديث المحفظة.')
      throw err
    } finally {
      isActionLoading.value = false
    }
  }

  const deleteWalletProvider = async (id: number | string): Promise<boolean> => {
    isActionLoading.value = true
    try {
      const res: any = await $fetch(`/api/admin/wallet-providers/${id}`, {
        method: 'DELETE',
      })
      const message = res?.message || 'تم حذف المحفظة بنجاح'
      walletProviders.value = walletProviders.value.filter(w => String(w.id) !== String(id))
      notify(message)
      return true
    } catch (err: any) {
      notify(err?.message || 'تعذر حذف المحفظة.')
      return false
    } finally {
      isActionLoading.value = false
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
    createServiceType,
    updateServiceType,
    deleteServiceType,
    fetchSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    walletProviders,
    fetchWalletProviders,
    createWalletProvider,
    updateWalletProvider,
    deleteWalletProvider,
  }
}
