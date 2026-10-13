import type { DashboardAction, RecentActivity } from '../../types/dashboard'
const actions: DashboardAction[] = [
  { id: 'products', title: 'تصفح المنتجات', description: 'استكشف الألواح والمحولات والبطاريات المعتمدة', buttonLabel: 'تصفح الآن', icon: 'products', tone: 'dark' },
  { id: 'service', title: 'طلب خدمة', description: 'استشارات فنية، دراسات جدوى ومخططات معتمدة', buttonLabel: 'طلب خدمة', icon: 'service', tone: 'yellow' },
  { id: 'quotes', title: 'طلبات عروض الأسعار', description: 'إرسال ومتابعة عروض الأسعار المخصصة (RFQ)', buttonLabel: 'عرض الطلبات', icon: 'quotes', tone: 'dark' },
  { id: 'orders', title: 'طلباتي', description: 'متابعة أوامر الشراء وحالات الشحن والتسليم', buttonLabel: 'متابعة الطلبات', icon: 'orders', tone: 'yellow' },
]
const activities: RecentActivity[] = [
  { id: 'SH-8842', title: 'طلب شراء #SH-8842 – لوح Jinko Tiger Pro 585W (شمس الرياض)', time: 'قبل 15 دقيقة', status: 'شحنتك في طريقها إليك', statusTone: 'blue', icon: 'delivery' },
  { id: 'RFQ-1049', title: 'طلب عرض سعر #RFQ-1049 – إنفرتر هجين Deye 8kW (مؤسسة طاقة الصحراء)', time: 'قبل ساعتين', status: 'تم استلام عرض السعر', statusTone: 'yellow', icon: 'quote' },
  { id: 'SR-302', title: 'طلب خدمة هندسية #SR-302 – دراسة جدوى وتوافق كود SBC (م. أحمد الشمري)', time: 'أمس', status: 'قيد المراجعة الفنية', statusTone: 'orange', icon: 'engineering' },
]
export const useCustomerDashboard = () => {
  const unavailableMessage = ref('')
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const showComingSoon = (feature: string) => {
    unavailableMessage.value = `${feature} — ستتوفر هذه الصفحة لاحقًا.`
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => { unavailableMessage.value = '' }, 3500)
  }
  onBeforeUnmount(() => { if (timeoutId) clearTimeout(timeoutId) })
  return { actions, activities, unavailableMessage, showComingSoon }
}
