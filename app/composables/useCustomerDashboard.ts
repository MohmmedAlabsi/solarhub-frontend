import type { DashboardAction, RecentActivity } from '~~/types/dashboard'

const actions: DashboardAction[] = [
  { id: 'products', title: 'تصفح المنتجات', description: 'استكشف الألواح والمحولات والبطاريات المعتمدة', buttonLabel: 'تصفح الآن', icon: 'products', tone: 'dark', destination: '/customer/products' },
  { id: 'service', title: 'طلب خدمة', description: 'استشارات فنية، دراسات جدوى ومخططات معتمدة', buttonLabel: 'طلب خدمة', icon: 'service', tone: 'yellow', destination: '/customer/services' },
  { id: 'quotes', title: 'طلبات عروض الأسعار', description: 'إرسال ومتابعة عروض الأسعار المخصصة (RFQ)', buttonLabel: 'عرض الطلبات', icon: 'quotes', tone: 'dark', destination: '/customer/orders?tab=quotes' },
  { id: 'orders', title: 'طلباتي', description: 'متابعة أوامر الشراء وحالات الشحن والتسليم', buttonLabel: 'متابعة الطلبات', icon: 'orders', tone: 'yellow', destination: '/customer/orders' },
]

const activities: RecentActivity[] = [
  { id: 'SH-8842', title: 'طلب شراء #SH-8842 – لوح Jinko Tiger Pro 585W (شمس الرياض)', time: 'قبل 15 دقيقة', status: 'شحنتك في طريقها إليك', statusTone: 'blue', icon: 'delivery', destination: '/customer/orders/SH-8842/track' },
  { id: 'RFQ-1049', title: 'طلب عرض سعر #RFQ-1049 – إنفرتر هجين Deye 8kW (مؤسسة طاقة الصحراء)', time: 'قبل ساعتين', status: 'تم استلام عرض السعر', statusTone: 'yellow', icon: 'quote', destination: '/customer/orders?tab=quotes' },
  { id: 'SR-302', title: 'طلب خدمة هندسية #SR-302 – دراسة جدوى وتوافق كود SBC (م. أحمد الشمري)', time: 'أمس', status: 'قيد المراجعة الفنية', statusTone: 'orange', icon: 'engineering', destination: '/customer/services' },
]

export const useCustomerDashboard = () => ({ actions, activities })
