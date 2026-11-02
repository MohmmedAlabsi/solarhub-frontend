export interface Engineer {
  id: number
  name: string
  image: string
  specialty: string
  specialtyKey: EngineerSpecialty
  city: string
  rating: number
  completedProjects: number
  serviceTitle: string
  bio: string
  isVerified: boolean
}

export type EngineerSpecialty = string

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
  completionYear: number
  category: 'commercial' | 'agricultural' | 'storage' | 'industrial'
}
export interface EngineerProfile extends Engineer {
  reviews: EngineerReviews
  licenseNumber: string
  experienceYears: number
  verifiedReviews: number
  responseTime: string
  professionalBio: string
  expertise: EngineerExpertise[]
  certificates: EngineerCertificate[]
  projects: EngineerProject[]
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
  /** Aggregate across all reviews, independent of the displayed comment sample. */
  distribution: Record<EngineerReviewScore, number>
  comments: EngineerReview[]
}

export type EngineerProfileTab = 'overview' | 'projects' | 'certificates' | 'reviews'
