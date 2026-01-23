'use client'

import { motion } from 'framer-motion'
import { Book } from '@/lib/types'
import BookCard from './BookCard'
import BookSkeleton from './BookSkeleton'

interface BookGridProps {
  books: Book[]
  isLoading: boolean
  onBookClick?: (book: Book) => void
  title?: string
  subtitle?: string
}

export default function BookGrid({ 
  books, 
  isLoading, 
  onBookClick,
  title = "Recommended Books",
  subtitle = "Discover your next favorite read"
}: BookGridProps) {
  if (isLoading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <BookSkeleton count={8} />
          </div>
        </div>
      </section>
    )
  }

  if (books.length === 0) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse our popular books
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 text-sm md:text-base">
            {subtitle} {books.length > 0 && `• ${books.length} book${books.length !== 1 ? 's' : ''} found`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
        >
          {books.map((book, index) => (
            <BookCard
              key={book.isbn13}
              book={book}
              index={index}
              onClick={onBookClick}
            />
          ))}
        </motion.div>

        {/* Load More Button (if needed) */}
        {books.length >= 20 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-8"
          >
            <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 font-medium">
              Load More Books
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
