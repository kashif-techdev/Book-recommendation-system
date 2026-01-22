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
