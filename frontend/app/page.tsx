'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Book, SearchFilters } from '@/lib/types'
import { bookApi } from '@/lib/api'
import Header from '@/components/ui/Header'
import SearchBar from '@/components/ui/SearchBar'
import BookGrid from '@/components/ui/BookGrid'
import Footer from '@/components/ui/Footer'

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'All',
    tone: 'All',
    limit: 12
  })
  const [hasSearched, setHasSearched] = useState(false)

  // Load popular books on initial load
  useEffect(() => {
    loadPopularBooks()
  }, [])

  const loadPopularBooks = async () => {
    try {
      setIsLoading(true)
      const response = await bookApi.getRecommendations({
        query: '',
        category: 'All',
        tone: 'All',
        limit: 12
      })
      
      if (response.success) {
        setBooks(response.data.books)
        setHasSearched(false)
      }
    } catch (error) {
      console.error('Error loading popular books:', error)
      toast.error('Failed to load books. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadPopularBooks()
      return
    }

    try {
      setIsLoading(true)
      setSearchQuery(query)
      
      const response = await bookApi.getRecommendations({
        query,
        category: filters.category,
        tone: filters.tone,
        limit: filters.limit
      })
      
      if (response.success) {
        setBooks(response.data.books)
        setHasSearched(true)
        toast.success(`Found ${response.data.total} book${response.data.total !== 1 ? 's' : ''}`)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please try again.')
      setBooks([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const handleFilterChange = useCallback((newFilters: { category: string; tone: string }) => {
    const updatedFilters = {
      ...filters,
      ...newFilters
    }
    setFilters(updatedFilters)
    
    // Re-search with new filters if we have a query
    if (searchQuery.trim()) {
      handleSearch(searchQuery)
    }
  }, [filters, searchQuery, handleSearch])

  const handleBookClick = (book: Book) => {
    // You can implement book details modal or navigation here
    console.log('Book clicked:', book.title)
    toast.success(`Selected: ${book.title}`)
  }

  const getSectionTitle = () => {
    if (isLoading) return "Searching..."
    if (hasSearched) return "Search Results"
    return "Popular Books"
  }

  const getSectionSubtitle = () => {
    if (isLoading) return "Finding the perfect books for you..."
    if (hasSearched) return "Books that match your search criteria"
    return "Discover trending and highly-rated books"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Header />
      
      <main className="relative">
        {/* Search Section */}
        <section className="py-12 bg-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Find Your Next Great Read
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Describe what you're looking for and let our AI find books that match your mood, 
                interests, and reading preferences.
              </p>
            </motion.div>

            <SearchBar
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Results Section */}
        <BookGrid
          books={books}
          isLoading={isLoading}
          onBookClick={handleBookClick}
          title={getSectionTitle()}
          subtitle={getSectionSubtitle()}
        />

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose BookWise?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our advanced AI technology goes beyond simple keyword matching to understand 
                the emotional and semantic content of books.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🧠',
                  title: 'AI-Powered Search',
                  description: 'Advanced machine learning algorithms analyze book content and emotional tone to find perfect matches.'
                },
                {
                  icon: '💝',
                  title: 'Emotional Analysis',
                  description: 'Our system understands the emotional journey of books to match your current mood and preferences.'
                },
                {
                  icon: '🎯',
                  title: 'Personalized Results',
                  description: 'Get recommendations tailored to your reading history, preferences, and emotional state.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
