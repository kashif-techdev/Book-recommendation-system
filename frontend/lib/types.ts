export interface Book {
  isbn13: string
  title: string
  authors: string
  thumbnail: string
  description: string
  simple_categories: string
  published_year?: number
  average_rating?: number
  num_pages?: number
  ratings_count?: number
  joy: number
  sadness: number
  anger: number
  fear: number
  surprise: number
}

export interface RecommendationRequest {
  query: string
  category: string
  tone: string
  limit?: number
}

export interface RecommendationResponse {
  success: boolean
  data: {
    books: Book[]
    total: number
  }
  message: string
}

export interface ApiError {
  success: false
  error: string
}

export type Category = 'All' | 'Fiction' | 'Nonfiction' | "Children's Fiction" | "Children's Nonfiction"

export type Tone = 'All' | 'Happy' | 'Sad' | 'Angry' | 'Suspenseful' | 'Surprising'

export interface SearchFilters {
  category: Category
  tone: Tone
  limit: number
}

export interface SearchHistoryItem {
  id: number
  userId: number
  query: string | null
  category: string | null
  tone: string | null
  resultsCount: number
  createdAt: string
}

export interface User {
  id: number
  username: string
  email: string
  profilePicture?: string | null
  createdAt?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}
