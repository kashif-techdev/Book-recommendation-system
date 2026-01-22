import axios from 'axios'
import { RecommendationRequest, RecommendationResponse, ApiError } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
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
      const response = await api.post<RecommendationResponse>('/recommend', request)
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

export default api
