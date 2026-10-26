import type { EngineerProfile } from './engineer'

// قيمة معرف نوع الخدمة القادم من الباك إند.
export type EngineeringService = string

export type ServiceProjectStatus =
  | 'open_for_bids'
  | 'awarded'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type ServiceOfferStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'

export interface ServiceRequestForm {
  serviceType: EngineeringService
  region: string
  capacity: string
  description: string
  location: string

  // تُملأ عند اختيار الموقع من الخريطة.
  locationCoordinates?: string
}

export type ServiceRequestErrors = Partial<
  Record<
    keyof ServiceRequestForm | 'attachments',
    string
  >
>

export interface ServiceRequestSubmission
  extends ServiceRequestForm {
  // سياق الاختيار في الواجهة؛ لا يعني تعيين المهندس للطلب.
  engineerId?: number

  attachments: File[]
}

export interface ServiceProjectAttachment {
  id: string
  name: string
  sizeLabel: string
  kind: 'image' | 'pdf'

  // يُستخدم فقط عند توفر رابط تنزيل فعلي.
  url?: string
}

export interface ServiceOffer {
  id: string
  engineerId: EngineerProfile['id']
  price: number
  durationDays: number
  summary: string
  status?: ServiceOfferStatus
  attachment?: ServiceProjectAttachment
}

export interface ServiceOfferWithEngineer
  extends ServiceOffer {
  engineer: EngineerProfile
}

export interface ServiceProject
  extends Pick<
    ServiceRequestForm,
    'region' | 'capacity' | 'description' | 'location'
  > {
  id: string
  title: string
  serviceType: EngineeringService
  serviceLabel: string
  publishedLabel: string

  attachments: ServiceProjectAttachment[]
  offers: ServiceOffer[]

  status?: ServiceProjectStatus
  locationCoordinates?: string
  acceptedOfferId?: ServiceOffer['id']
}