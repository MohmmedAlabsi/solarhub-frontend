import { useAuthStore } from '~~/app/stores/auth'

export interface EngineerProjectItem {
  id: number
  project_title: string
  service_type_id: string
  service_type_label: string
  system_capacity: string
  governorate_id: string
  governorate_name: string
  address_text: string
  description: string
  image_path: string
  file_path?: string
  file_size_pages?: string
}

export interface NewProjectPayload {
  project_title: string
  service_type_id: string
  system_capacity: string
  governorate_id: string
  address_text: string
  description: string
  image_file: File | null
  file_attachment: File | null
}

export interface SelectOption {
  id: string
  label: string
}

export interface GovernorateOption {
  id: string
  name: string
}

export function useEngineerProjects() {
  const { $api } = useNuxtApp()
  const authStore = useAuthStore()

  const projects = ref<EngineerProjectItem[]>([])
  const serviceTypesList = ref<SelectOption[]>([
    { id: '1', label: 'تصميم محطات كهروضوئية' },
    { id: '2', label: 'دراسات جدوى واستشارات' },
    { id: '3', label: 'فحص واعتماد كود البناء السعودي' },
    { id: '4', label: 'أنظمة هجينة وبطاريات' },
  ])
  const governoratesList = ref<GovernorateOption[]>([
    { id: '1', name: 'الرياض (منطقة الرياض)' },
    { id: '2', name: 'مكة المكرمة (جدة / مكة)' },
    { id: '3', name: 'المنطقة الشرقية (الدمام / الخبر)' },
    { id: '4', name: 'القصيم (بريدة / عنيزة)' },
    { id: '5', name: 'عسير (أبها / خميس مشيط)' },
    { id: '6', name: 'المدينة المنورة (ينبع / المدينة)' },
  ])

  const search = ref('')
  const serviceTypeFilter = ref('all')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMasterData() {
    try {
      const [typesRes, govsRes] = await Promise.allSettled([
        $api<{ status: string; data: any[] }>('/service-types'),
        $api<{ status: string; data: any[] }>('/governorates'),
      ])

      if (typesRes.status === 'fulfilled' && typesRes.value?.data) {
        const items = Array.isArray(typesRes.value.data) ? typesRes.value.data : []
        if (items.length > 0) {
          serviceTypesList.value = items.map((t: any) => ({
            id: String(t.id),
            label: t.name || t.name_ar || t.label,
          }))
        }
      }

      if (govsRes.status === 'fulfilled' && govsRes.value?.data) {
        const govs = Array.isArray(govsRes.value.data) ? govsRes.value.data : []
        if (govs.length > 0) {
          governoratesList.value = govs.map((g: any) => ({
            id: String(g.id),
            name: g.name_ar || g.name || g.label,
          }))
        }
      }
    } catch {
      // Keep sensible default lists
    }
  }

  async function fetchProjects() {
    if (!authStore.token) return
    isLoading.value = true
    error.value = null

    try {
      const res = await $api<{ status: string; data: any[] }>('/engineer/portfolio-items')
      const items = Array.isArray(res?.data) ? res.data : []

      projects.value = items.map((item: any) => {
        const servName = item.service_type?.name || 'تصميم محطات كهروضوئية'
        const govName = item.governorate?.name || item.governorate?.name_ar || 'المملكة'
        const capacityNum = item.system_capacity ? `${item.system_capacity} kWp` : 'غير محددة'

        return {
          id: Number(item.id),
          project_title: item.project_title || 'مشروع هندسي معتمد',
          service_type_id: String(item.service_type?.id || '1'),
          service_type_label: servName,
          system_capacity: capacityNum,
          governorate_id: String(item.governorate?.id || '1'),
          governorate_name: govName,
          address_text: item.address_text || govName,
          description: item.description || 'إعداد المخططات الهندسية المعتمدة للمنظومة الكهروضوئية.',
          image_path: item.image_path || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
          file_path: item.file_path ? item.file_path.split('/').pop() : 'مخطط_تنفيذي_معتمد.pdf',
          file_size_pages: 'وثيقة ومخطط معتمد',
        }
      })
    } catch (err: any) {
      error.value = err?.data?.message || 'تعذر تحميل نماذج الأعمال السابقة'
    } finally {
      isLoading.value = false
    }
  }

  async function addProject(payload: NewProjectPayload) {
    const formData = new FormData()
    formData.append('project_title', payload.project_title.trim())
    formData.append('service_type_id', payload.service_type_id)

    if (payload.governorate_id) {
      formData.append('governorate_id', payload.governorate_id)
    }

    if (payload.system_capacity) {
      // Remove any non-numeric characters for backend numeric validation
      const numericCapacity = payload.system_capacity.replace(/[^\d.]/g, '')
      if (numericCapacity) {
        formData.append('system_capacity', numericCapacity)
      }
    }

    if (payload.description) {
      formData.append('description', payload.description.trim())
    }

    if (payload.address_text) {
      formData.append('address_text', payload.address_text.trim())
    }

    if (payload.image_file) {
      formData.append('image', payload.image_file)
    }

    if (payload.file_attachment) {
      formData.append('file', payload.file_attachment)
    }

    const res = await $api<{ status: string; data: any }>('/engineer/portfolio-items', {
      method: 'POST',
      body: formData,
    })

    await fetchProjects()
    return res
  }

  async function deleteProject(id: number) {
    await $api(`/engineer/portfolio-items/${id}`, {
      method: 'DELETE',
    })
    projects.value = projects.value.filter(p => p.id !== id)
  }

  const filteredProjects = computed(() => {
    return projects.value.filter(project => {
      const matchesSearch = !search.value.trim() ||
        project.project_title.toLowerCase().includes(search.value.toLowerCase()) ||
        project.address_text.toLowerCase().includes(search.value.toLowerCase()) ||
        project.description.toLowerCase().includes(search.value.toLowerCase())

      const matchesType = serviceTypeFilter.value === 'all' ||
        project.service_type_id === serviceTypeFilter.value

      return matchesSearch && matchesType
    })
  })

  onMounted(() => {
    fetchMasterData()
    fetchProjects()
  })

  return {
    projects,
    filteredProjects,
    search,
    serviceTypeFilter,
    serviceTypesList,
    governoratesList,
    isLoading,
    error,
    fetchProjects,
    addProject,
    deleteProject,
  }
}
