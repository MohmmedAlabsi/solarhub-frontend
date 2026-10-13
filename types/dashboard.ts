export type DashboardIconName = 'products' | 'service' | 'quotes' | 'orders'
export interface DashboardAction { id: string; title: string; description: string; buttonLabel: string; icon: DashboardIconName; tone: 'dark' | 'yellow'; destination?: string }
export interface RecentActivity { id: string; title: string; time: string; status: string; statusTone: 'blue' | 'yellow' | 'orange'; icon: 'delivery' | 'quote' | 'engineering'; destination?: string }
