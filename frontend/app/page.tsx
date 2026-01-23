'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Book, SearchFilters } from '@/lib/types'
import { bookApi } from '@/lib/api'
import Header from '@/components/ui/Header'
import SearchBar from '@/components/ui/SearchBar'
import BookGrid from '@/components/ui/BookGrid'
import BookDetailsModal from '@/components/ui/BookDetailsModal'
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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    
    // Don't auto-search - user must click search button to apply filters
  }, [filters])

  const handleBookClick = (book: Book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Small delay before clearing book to allow exit animation
    setTimeout(() => setSelectedBook(null), 300)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <Header />
      
      <main className="relative">
        {/* Search Section - More Prominent and Clean */}
        <section className="py-6 md:py-10 bg-gradient-to-b from-white via-primary-50/20 to-transparent border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SearchBar
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
              />
            </motion.div>
          </div>
        </section>

        {/* Results Section - Improved Spacing */}
        <section className="py-6 md:py-10">
          <BookGrid
            books={books}
            isLoading={isLoading}
            onBookClick={handleBookClick}
            title={getSectionTitle()}
            subtitle={getSectionSubtitle()}
          />
        </section>

        {/* Features Section - More Subtle */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-transparent to-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Why Choose BookWise?
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Our advanced AI technology goes beyond simple keyword matching to understand 
                the emotional and semantic content of books.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Book Details Modal */}
      <BookDetailsModal
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <Footer />
    </div>
  )
}
