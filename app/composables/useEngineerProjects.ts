import { useAuthStore } from '~~/app/stores/auth'

export interface EngineerProjectItem {
  id: number
  project_title: string
  service_type_id: string
  service_type_label: string
  system_capacity: string
  raw_capacity?: number | null
  governorate_id: string
  governorate_name: string
  address_text: string
  description: string
  image_path?: string | null
  image_url?: string | null
  file_path?: string | null
  file_url?: string | null
  file_name?: string | null
}

export interface NewProjectPayload {
  project_title: string
  service_type_id: string
  system_capacity: string
  governorate_id: string
  address_text: string
  description: string
  image_file?: File | null
  file_attachment?: File | null
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
  const serviceTypesList = ref<SelectOption[]>([])
  const governoratesList = ref<GovernorateOption[]>([])

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
        serviceTypesList.value = items.map((t: any) => ({
          id: String(t.id),
          label: t.name || t.name_ar || t.label,
        }))
      }

      if (govsRes.status === 'fulfilled' && govsRes.value?.data) {
        const govs = Array.isArray(govsRes.value.data) ? govsRes.value.data : []
        governoratesList.value = govs.map((g: any) => ({
          id: String(g.id),
          name: g.name_ar || g.name || g.label,
        }))
      }
    } catch {
      // Graceful handling if master data fails
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
        const servName = item.service_type?.name || 'خدمة هندسية'
        const govName = item.governorate?.name_ar || item.governorate?.name || ''
        const capacityNum = item.system_capacity ? `${item.system_capacity} kWp` : ''

        return {
          id: Number(item.id),
          project_title: item.project_title || '',
          service_type_id: String(item.service_type?.id || ''),
          service_type_label: servName,
          system_capacity: capacityNum,
          raw_capacity: item.system_capacity ? Number(item.system_capacity) : null,
          governorate_id: String(item.governorate?.id || ''),
          governorate_name: govName,
          address_text: item.address_text || govName,
          description: item.description || '',
          image_path: item.image_path || null,
          image_url: item.image_url || null,
          file_path: item.file_path || null,
          file_url: item.file_url || null,
          file_name: item.file_path ? item.file_path.split('/').pop() : null,
        }
      })
    } catch (err: any) {
      error.value = err?.data?.message || 'تعذر تحميل نماذج الأعمال السابقة'
    } finally {
      isLoading.value = false
    }
  }

  function buildFormData(payload: NewProjectPayload, isUpdate = false): FormData {
    const formData = new FormData()
    if (isUpdate) {
      formData.append('_method', 'PUT')
    }

    if (payload.project_title) {
      formData.append('project_title', payload.project_title.trim())
    }
    if (payload.service_type_id) {
      formData.append('service_type_id', payload.service_type_id)
    }

    if (payload.governorate_id) {
      formData.append('governorate_id', payload.governorate_id)
    }

    if (payload.system_capacity !== undefined && payload.system_capacity !== null && payload.system_capacity !== '') {
      const numericCapacity = String(payload.system_capacity).replace(/[^\d.]/g, '')
      if (numericCapacity) {
        formData.append('system_capacity', numericCapacity)
      }
    }

    if (payload.description !== undefined && payload.description !== null) {
      formData.append('description', payload.description.trim())
    }

    if (payload.address_text !== undefined && payload.address_text !== null) {
      formData.append('address_text', payload.address_text.trim())
    }

    if (payload.image_file instanceof File) {
      formData.append('image', payload.image_file)
    }

    if (payload.file_attachment instanceof File) {
      formData.append('file', payload.file_attachment)
    }

    return formData
  }

  async function addProject(payload: NewProjectPayload) {
    const formData = buildFormData(payload, false)

    const res = await $api<{ status: string; data: any }>('/engineer/portfolio-items', {
      method: 'POST',
      body: formData,
    })

    await fetchProjects()
    return res
  }

  async function updateProject(id: number, payload: NewProjectPayload) {
    const formData = buildFormData(payload, true)

    const res = await $api<{ status: string; data: any }>(`/engineer/portfolio-items/${id}`, {
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
    updateProject,
    deleteProject,
  }
}
