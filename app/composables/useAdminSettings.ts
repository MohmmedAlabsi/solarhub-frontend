export interface PlatformSettingsData {
  id?: number
  platform_name: string
  support_phone: string
  support_email: string
  currency: string
  is_maintenance_mode: boolean
  logo_url?: string
  favicon_url?: string
  updated_at?: string
}

export interface AdminPreferences {
  language: string
  theme: string
  density: 'comfortable' | 'compact'
}

export function useAdminSettings() {
  const { $api } = useNuxtApp()
  const { notify } = useAdminNotice()

  const settings = useState<PlatformSettingsData>('admin_platform_settings', () => ({
    platform_name: 'سولار هاب - SolarHub',
    support_phone: '775636416',
    support_email: 'support@solarhub.com',
    currency: 'YER',
    is_maintenance_mode: false,
    logo_url: '',
    favicon_url: '',
  }))

  const preferences = useState<AdminPreferences>('admin_ui_preferences', () => ({
    language: 'ar',
    theme: 'light',
    density: 'comfortable',
  }))

  const isLoading = ref(false)
  const isSaving = ref(false)
  const errors = reactive<Record<string, string>>({})

  const draft = reactive<PlatformSettingsData>({
    platform_name: settings.value.platform_name,
    support_phone: settings.value.support_phone,
    support_email: settings.value.support_email,
    currency: settings.value.currency,
    is_maintenance_mode: settings.value.is_maintenance_mode,
  })

  // مزامنة المسودة عند تغير الإعدادات
  watch(
    () => settings.value,
    newVal => {
      Object.assign(draft, newVal)
    },
    { deep: true }
  )

  /**
   * جلب الإعدادات من الخادم
   */
  const fetchSettings = async (force = false): Promise<PlatformSettingsData> => {
    if (!force && settings.value.id) {
      return settings.value
    }

    isLoading.value = true
    try {
      const res: any = await $api('/settings')
      const data = res?.data ?? res
      if (data && typeof data === 'object') {
        settings.value = {
          id: data.id,
          platform_name: data.platform_name || 'سولار هاب - SolarHub',
          support_phone: data.support_phone || '',
          support_email: data.support_email || '',
          currency: data.currency || 'YER',
          is_maintenance_mode: Boolean(data.is_maintenance_mode),
          logo_url: data.logo_url || '',
          favicon_url: data.favicon_url || '',
          updated_at: data.updated_at,
        }
        Object.assign(draft, settings.value)
      }
      return settings.value
    } catch (err: any) {
      console.error('Failed to fetch platform settings:', err)
      return settings.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * إلغاء التعديلات والعودة للإعدادات المحفوظة
   */
  function cancel() {
    Object.assign(draft, settings.value)
    for (const k of Object.keys(errors)) delete errors[k]
    notify('أُلغيت التعديلات غير المحفوظة.')
  }

  /**
   * حفظ إعدادات المنصة في الـ API وقاعدة البيانات
   */
  async function save(): Promise<boolean> {
    for (const k of Object.keys(errors)) delete errors[k]

    if (!draft.platform_name?.trim() || draft.platform_name.trim().length < 3) {
      errors.platform_name = 'أدخل اسمًا للمنصة بين 3 و150 حرفًا.'
    }
    if (!draft.support_email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.support_email.trim())) {
      errors.support_email = 'أدخل بريد دعم فني صحيحًا.'
    }
    if (!draft.support_phone?.trim()) {
      errors.support_phone = 'أدخل رقم خدمة عملاء أو هاتف دعم صالح.'
    }

    if (Object.keys(errors).length > 0) {
      return false
    }

    isSaving.value = true
    try {
      const payload = {
        platform_name: draft.platform_name.trim(),
        support_phone: draft.support_phone.trim(),
        support_email: draft.support_email.trim(),
        currency: draft.currency || 'YER',
        is_maintenance_mode: Boolean(draft.is_maintenance_mode),
      }

      const res: any = await $api('/settings', {
        method: 'PUT',
        body: payload,
      })

      const updated = res?.data ?? res
      settings.value = {
        ...settings.value,
        ...payload,
        id: updated?.id ?? settings.value.id,
        updated_at: updated?.updated_at ?? new Date().toISOString(),
      }
      Object.assign(draft, settings.value)

      notify('تم حفظ إعدادات المنصة بنجاح في قاعدة البيانات!')
      return true
    } catch (err: any) {
      console.error('Failed to save settings:', err)
      const msg = err?.data?.message || err?.message || 'تعذر حفظ الإعدادات، يرجى المحاولة لاحقاً.'
      notify(msg)
      errors.general = msg
      return false
    } finally {
      isSaving.value = false
    }
  }

  function setDensity(value: string) {
    if (value !== 'compact' && value !== 'comfortable') return
    preferences.value.density = value
    notify('طُبقت كثافة العرض على جداول لوحة التحكم.')
  }

  function resetDefaults() {
    preferences.value = { language: 'ar', theme: 'light', density: 'comfortable' }
    notify('استُعيدت تفضيلات العرض الافتراضية.')
  }

  return {
    settings,
    preferences,
    draft,
    errors,
    isLoading,
    isSaving,
    fetchSettings,
    cancel,
    save,
    setDensity,
    resetDefaults,
  }
}
