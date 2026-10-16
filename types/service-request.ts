import type { EngineerProfile } from './engineer'

export type EngineeringService = 'consultation' | 'feasibility' | 'design' | 'inspection' | 'supervision'

export interface ServiceRequestForm {
  serviceType: EngineeringService | ''
  region: string
  capacity: string
  description: string
  location: string
}

export type ServiceRequestErrors = Partial<Record<keyof ServiceRequestForm | 'attachments', string>>

export interface ServiceRequestSubmission extends ServiceRequestForm {
  engineerId?: number
  attachments: File[]
}

export interface ServiceProjectAttachment {
  id: string
  name: string
  sizeLabel: string
  kind: 'image' | 'pdf'
  url?: string
}

export interface ServiceOffer {
  id: string
  engineerId: EngineerProfile['id']
  price: number
  durationDays: number
  summary: string
  attachment?: ServiceProjectAttachment
}

export interface ServiceOfferWithEngineer extends ServiceOffer {
  engineer: EngineerProfile
}

export interface ServiceProject extends Pick<ServiceRequestForm, 'region' | 'capacity' | 'description' | 'location'> {
  id: string
  title: string
  serviceType: EngineeringService
  serviceLabel: string
  publishedLabel: string
  attachments: ServiceProjectAttachment[]
  offers: ServiceOffer[]
  acceptedOfferId?: ServiceOffer['id']
}
