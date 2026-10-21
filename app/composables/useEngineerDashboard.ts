// بيانات تجريبية للوحة تحكم المهندس
// TODO: استبدل بـ useFetch('/api/engineer/dashboard/stats')

export interface EngineerStat {
  id: string
  count: number
  label: string
  sublabel: string
  icon: 'offers-pending' | 'requests-available' | 'projects-done'
  tone: 'yellow' | 'blue' | 'green'
  destination: string
}

export interface EngineerWorkItem {
  id: string
  title: string
  description: string
  actionLabel: string
  destination: string
  icon: 'document' | 'chat' | 'check'
}

const stats: EngineerStat[] = [
  {
    id: 'offers-pending',
    count: 4,
    label: 'عروض قيد المراجعة',
    sublabel: '4 عروض بانتظار رد العملاء',
    icon: 'offers-pending',
    tone: 'yellow',
    destination: '/engineer/offers',
  },
  {
    id: 'requests-available',
    count: 18,
    label: 'طلبات الخدمات المتاحة',
    sublabel: '18 طلبات هندسية جديدة',
    icon: 'requests-available',
    tone: 'blue',
    destination: '/engineer/service-requests',
  },
  {
    id: 'projects-done',
    count: 24,
    label: 'إجمالي المشاريع المنجزة',
    sublabel: '24 مشروعاً معتمداً',
    icon: 'projects-done',
    tone: 'green',
    destination: '/engineer/past-work',
  },
]

const workItems: EngineerWorkItem[] = [
  {
    id: 'awaiting-offer',
    title: 'طلبات هندسية بانتظار العروض',
    description: 'طلبات دراسات جدوى وإشراف جديدة تحتاج عروض أسعار',
    actionLabel: 'تقديم تسعير',
    destination: '/engineer/service-requests',
    icon: 'document',
  },
  {
    id: 'awaiting-approval',
    title: 'عروض بانتظار اعتماد العميل',
    description: 'عروض فنية ومالية تم إرسالها وفي مرحلة المراجعة',
    actionLabel: 'مراجعة',
    destination: '/engineer/offers',
    icon: 'chat',
  },
  {
    id: 'in-progress',
    title: 'المشاريع الجارية قيد التنفيذ',
    description: 'مشاريع محطات شمسية معتمدة تتطلب تقارير إنجاز ومخططات',
    actionLabel: 'تحديث الإنجاز',
    destination: '/engineer/past-work',
    icon: 'check',
  },
]

export const useEngineerDashboard = () => ({ stats, workItems })
