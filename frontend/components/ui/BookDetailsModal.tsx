'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Image from 'next/image'
import { Book } from '@/lib/types'
import { formatAuthors, getCategoryColor } from '@/lib/utils'
import { X, Star, BookOpen, Calendar, Users, Heart, Smile, Frown, AlertCircle, Zap } from 'lucide-react'

interface BookDetailsModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
}

export default function BookDetailsModal({ book, isOpen, onClose }: BookDetailsModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!book) return null

  const emotions = [
    { name: 'Joy', value: book.joy, icon: <Smile className="w-5 h-5" />, color: 'text-yellow-500' },
    { name: 'Sadness', value: book.sadness, icon: <Frown className="w-5 h-5" />, color: 'text-blue-500' },
    { name: 'Anger', value: book.anger, icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-500' },
    { name: 'Fear', value: book.fear, icon: <Zap className="w-5 h-5" />, color: 'text-purple-500' },
    { name: 'Surprise', value: book.surprise, icon: <Heart className="w-5 h-5" />, color: 'text-pink-500' },
  ]

  const getDominantEmotion = () => {
    const dominant = emotions.reduce((a, b) => a.value > b.value ? a : b)
    return dominant
  }

  const dominantEmotion = getDominantEmotion()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 md:top-4 md:right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="overflow-y-auto max-h-[90vh]">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left Side - Book Cover */}
                  <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50 p-6 md:p-8 lg:p-12 flex items-center justify-center min-h-[300px] md:min-h-0">
                    <div className="relative w-full max-w-sm">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                        <Image
                          src={book.thumbnail || '/placeholder-book.jpg'}
                          alt={book.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `https://via.placeholder.com/400x600/8b5cf6/ffffff?text=${book.title.slice(0, 10)}`
                          }}
                        />
                      </div>
                      
                      {/* Category Badge */}
                      <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-semibold ${getCategoryColor(book.simple_categories)}`}>
                        {book.simple_categories}
                      </div>

                      {/* Dominant Emotion Badge */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 text-sm font-medium shadow-lg">
                        <span className={dominantEmotion.color}>{dominantEmotion.icon}</span>
                        <span className="capitalize">{dominantEmotion.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Book Details */}
                  <div className="p-5 md:p-6 lg:p-8 xl:p-10 space-y-4 md:space-y-6">
                    {/* Title and Author */}
                    <div>
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3 leading-tight">
                        {book.title}
                      </h2>
                      <p className="text-base md:text-lg lg:text-xl text-gray-600 font-medium">
                        by {formatAuthors(book.authors)}
                      </p>
                    </div>

                    {/* Rating and Metadata */}
                    <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-200">
                      {book.average_rating && (
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-semibold text-gray-900">
                            {book.average_rating.toFixed(1)}
                          </span>
                          {book.ratings_count && (
                            <span className="text-sm text-gray-500">
                              ({book.ratings_count.toLocaleString()} ratings)
                            </span>
                          )}
                        </div>
                      )}
                      
                      {book.num_pages && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <BookOpen className="w-5 h-5" />
                          <span>{book.num_pages.toLocaleString()} pages</span>
                        </div>
                      )}
                      
                      {book.published_year && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-5 h-5" />
                          <span>{book.published_year}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                        {book.description || 'No description available.'}
                      </p>
                    </div>

                    {/* Emotional Analysis */}
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Emotional Analysis</h3>
                      <div className="space-y-3">
                        {emotions.map((emotion) => (
                          <div key={emotion.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className={emotion.color}>{emotion.icon}</span>
                                <span className="font-medium text-gray-700">{emotion.name}</span>
                              </div>
                              <span className="text-gray-600 font-medium">
                                {(emotion.value * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${emotion.value * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className={`h-full rounded-full ${
                                  emotion.name === 'Joy' ? 'bg-yellow-400' :
                                  emotion.name === 'Sadness' ? 'bg-blue-400' :
                                  emotion.name === 'Anger' ? 'bg-red-400' :
                                  emotion.name === 'Fear' ? 'bg-purple-400' :
                                  'bg-pink-400'
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ISBN */}
                    {book.isbn13 && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">ISBN-13:</span> {book.isbn13}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
