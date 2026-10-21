// بيانات تجريبية لمشاريع المهندس السابقة
// الحقول مطابقة لـ Laravel API backend الموضحة في التصميم
// TODO: استبدل بـ useFetch('/api/engineer/projects')

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

const mockProjects: EngineerProjectItem[] = [
  {
    id: 1,
    project_title: 'محطة كهروضوئية لسطح مصنع الشرق للأغذية',
    service_type_id: '1',
    service_type_label: 'تصميم محطات كهروضوئية',
    system_capacity: '250 kWp',
    governorate_id: 'riyadh',
    governorate_name: 'الرياض',
    address_text: 'الرياض - المدينة الصناعية الثانية - طريق الخرج، مجمع المصانع',
    description: 'إعداد الدراسات الفنية وتصاميم ومخططات PVsyst التنفيذية المعتمدة لربط محطة كهروضوئية سطحية بقدرة 250 kWp بشبكة التوزيع وفق اشتراطات كود البناء السعودي 401 SBC والتنسيق مع شركة الكهرباء.',
    image_path: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    file_path: 'مخطط_المشروع_التنفيذي_EastFactory.pdf',
    file_size_pages: '2 MB · 14 صفحة PDF معتمدة',
  },
  {
    id: 2,
    project_title: 'منظومة ضخ مياه زراعية بمزرعة الواحة',
    service_type_id: '2',
    service_type_label: 'دراسات جدوى واستشارات',
    system_capacity: '80 kWp',
    governorate_id: 'qassim',
    governorate_name: 'القصيم',
    address_text: 'القصيم - مزرعة الواحة - القصيم',
    description: 'دراسة وتصميم شبكة ضخ غاطسة بقدرة 40 حصان لتأمين ري محاصيل النخيل باستخدام منظومة طاقة شمسية كهروضوئية منعزلة عن الشبكة مع أنظمة حماية وتحكم ذكية.',
    image_path: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80',
    file_path: 'تقرير_الجدوى_والضخ.pdf',
    file_size_pages: '3.1 MB · 8 صفحات PDF',
  },
  {
    id: 3,
    project_title: 'اعتماد مطابقة مركز الأعمال اللوجستي',
    service_type_id: '3',
    service_type_label: 'فحص واعتماد كود البناء السعودي',
    system_capacity: '150 kWp',
    governorate_id: 'makkah',
    governorate_name: 'مكة المكرمة',
    address_text: 'مكة المكرمة - حي الرصيفة - مكة المكرمة',
    description: 'فحص ميكانيكي وكهربائي متكامل واعتماد التصاميم لمنظومة التوليد المتصلة مع اختبارات الأداء الميداني ومنحنيات I-V والفحص الحراري بالأشعة تحت الحمراء.',
    image_path: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80',
    file_path: 'شهادة_فحص_الاعتماد_SBC.pdf',
    file_size_pages: '1.5 MB · وثيقة رسمية معتمدة',
  },
  {
    id: 4,
    project_title: 'نظام هجين وبطاريات تخزين لمجمع سكني خاص',
    service_type_id: '4',
    service_type_label: 'أنظمة هجينة وبطاريات',
    system_capacity: '45 kWp',
    governorate_id: 'eastern',
    governorate_name: 'المنطقة الشرقية',
    address_text: 'المنطقة الشرقية - حي الشاطئ - الدمام',
    description: 'تنفيذ نظام طوارئ هجين وتخزين ليثيوم بسعة 120 kWh لتشغيل الأحمال الحيوية وضمان استمرارية التغذية في حال انقطاع الشبكة العمومية مع تكامل العواكس الهجينة.',
    image_path: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    file_path: 'مخطط_توصيل_البطاريات.pdf',
    file_size_pages: '2.4 MB · 6 صفحات PDF',
  },
]

export const serviceTypesList = [
  { id: '1', label: 'تصميم محطات كهروضوئية' },
  { id: '2', label: 'دراسات جدوى واستشارات' },
  { id: '3', label: 'فحص واعتماد كود البناء السعودي' },
  { id: '4', label: 'أنظمة هجينة وبطاريات' },
]

export const governoratesList = [
  { id: 'riyadh', name: 'الرياض (منطقة الرياض)' },
  { id: 'makkah', name: 'مكة المكرمة (جدة / مكة)' },
  { id: 'eastern', name: 'المنطقة الشرقية (الدمام / الخبر / الأحساء)' },
  { id: 'qassim', name: 'القصيم (بريدة / عنيزة)' },
  { id: 'asir', name: 'عسير (أبها / خميس مشيط)' },
  { id: 'madinah', name: 'المدينة المنورة (ينبع / المدينة)' },
]

export function useEngineerProjects() {
  const projects = ref<EngineerProjectItem[]>([...mockProjects])
  const search = ref('')
  const serviceTypeFilter = ref('all')

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

  function addProject(payload: NewProjectPayload) {
    const serviceTypeObj = serviceTypesList.find(s => s.id === payload.service_type_id)
    const governorateObj = governoratesList.find(g => g.id === payload.governorate_id)

    const newProject: EngineerProjectItem = {
      id: Date.now(),
      project_title: payload.project_title,
      service_type_id: payload.service_type_id,
      service_type_label: serviceTypeObj?.label || 'خدمة هندسية',
      system_capacity: payload.system_capacity,
      governorate_id: payload.governorate_id,
      governorate_name: governorateObj?.name.split(' ')[0] || 'المملكة',
      address_text: payload.address_text,
      description: payload.description,
      image_path: payload.image_file ? URL.createObjectURL(payload.image_file) : 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      file_path: payload.file_attachment ? payload.file_attachment.name : 'مخطط_تنفيذي.pdf',
      file_size_pages: 'ملف معتمد مرفق',
    }
    projects.value.unshift(newProject)
  }

  function deleteProject(id: number) {
    projects.value = projects.value.filter(p => p.id !== id)
  }

  return {
    projects,
    filteredProjects,
    search,
    serviceTypeFilter,
    serviceTypesList,
    governoratesList,
    addProject,
    deleteProject,
  }
}
