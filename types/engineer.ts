export type EngineerSpecialty = string

export interface Engineer {
  id: number
  name: string
  image: string
  specialty: string
  specialtyKey: EngineerSpecialty
  city: string
  rating: number | null
  completedProjects: number | null
  serviceTitle: string
  bio: string
  isVerified: boolean
}

export interface EngineerFilters {
  query: string
  specialty: EngineerSpecialty | 'all'
  city: string
  minimumRating: number
}

export interface EngineerExpertise {
  title: string
  description: string
  icon: 'grid' | 'droplet' | 'battery' | 'thermal'
}

export interface EngineerCertificate {
  id: string
  title: string
  issuer: string
  credentialNumber: string
  validUntil?: string
  status: 'verified'
  icon: 'shield' | 'code' | 'power' | 'award'
  documentUrl?: string
}

export interface EngineerProject {
  id: string
  title: string
  description: string
  image: string
  statusLabel: string
  capacityLabel: string
  location: string
  completionYear: number | null

  category:
    | 'commercial'
    | 'agricultural'
    | 'storage'
    | 'industrial'
    | null
}

export type EngineerReviewScore = 1 | 2 | 3 | 4 | 5

export interface EngineerReview {
  id: string
  author: string
  project: string
  rating: EngineerReviewScore
  relativeDate: string
  comment: string
}

export interface EngineerReviews {
  distribution: Record<EngineerReviewScore, number>
  comments: EngineerReview[]
}

export interface EngineerProfile extends Engineer {
  reviews: EngineerReviews
  licenseNumber: string
  experienceYears: number | null
  verifiedReviews: number | null
  responseTime: string
  professionalBio: string
  expertise: EngineerExpertise[]
  certificates: EngineerCertificate[]
  projects: EngineerProject[]
}

export type EngineerProfileTab =
  | 'overview'
  | 'projects'
  | 'certificates'
  | 'reviews'