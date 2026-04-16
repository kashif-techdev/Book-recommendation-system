import axios from 'axios'
import { RecommendationRequest, RecommendationResponse, AuthResponse, LoginRequest, RegisterRequest, User, SearchHistoryItem } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const bookApi = {
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    try {
      const response = await api.post<RecommendationResponse>('/books/recommend', request)
      return response.data
    } catch (error: any) {
      console.error('Error fetching recommendations:', error)
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to fetch recommendations'
      )
    }
  },

  async getPopularBooks(): Promise<RecommendationResponse> {
    try {
      const response = await api.get<RecommendationResponse>('/books/popular')
      return response.data
    } catch (error: any) {
      console.error('Error fetching popular books:', error)
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to fetch popular books'
      )
    }
  },

  async healthCheck(): Promise<{ status: string; books_loaded: number }> {
    try {
      const response = await api.get('/health')
      return response.data
    } catch (error: any) {
      console.error('Health check failed:', error)
      throw new Error('API is not available')
    }
  }
}

export const authApi = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', request)
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
      }
      return response.data
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Login failed'
      )
    }
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', request)
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
      }
      return response.data
    } catch (error: any) {
      console.error('Register error:', error)
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Registration failed'
      )
    }
  },

  async getCurrentUser(): Promise<{ success: boolean; data: { user: User } }> {
    try {
      const response = await api.get<{ success: boolean; data: { user: User } }>('/auth/me')
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
      }
      return response.data
    } catch (error: any) {
      console.error('Get current user error:', error)
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to get user'
      )
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  async googleAuth(token: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/google', { token })
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
      }
      return response.data
    } catch (error: any) {
      console.error('Google auth error:', error)
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Google authentication failed'
      )
    }
  }
}

export const searchHistoryApi = {
  async getHistory(): Promise<{ success: boolean; data: { history: SearchHistoryItem[] } }> {
    try {
      const response = await api.get<{ success: boolean; data: { history: SearchHistoryItem[] } }>('/search-history')
      return response.data
    } catch (error: any) {
      console.error('Get search history error:', error)
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'Failed to get search history'
      )
    }
  },

  async deleteById(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/search-history/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Delete search history item error:', error)
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'Failed to delete search history item'
      )
    }
  },

  async deleteAll(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>('/search-history')
      return response.data
    } catch (error: any) {
      console.error('Delete all search history error:', error)
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'Failed to clear search history'
      )
    }
  }
}

export default api
