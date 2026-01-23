'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Book } from '@/lib/types'
import { formatAuthors, truncateText, getCategoryColor, getEmotionIcon } from '@/lib/utils'
import { Star, BookOpen, Calendar, Users } from 'lucide-react'

interface BookCardProps {
  book: Book
  index: number
  onClick?: (book: Book) => void
}

export default function BookCard({ book, index, onClick }: BookCardProps) {
  const handleClick = () => {
    if (onClick) onClick(book)
  }

  const getDominantEmotion = () => {
    const emotions = {
      joy: book.joy,
      sadness: book.sadness,
      anger: book.anger,
      fear: book.fear,
      surprise: book.surprise,
    }
    
    const dominant = Object.entries(emotions).reduce((a, b) => 
      emotions[a[0] as keyof typeof emotions] > emotions[b[0] as keyof typeof emotions] ? a : b
    )
    
    return {
      name: dominant[0],
      intensity: dominant[1],
      icon: getEmotionIcon(dominant[0])
    }
  }

  const dominantEmotion = getDominantEmotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="bg-white rounded-xl shadow-book hover:shadow-book-hover transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Book Cover */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={book.thumbnail || '/placeholder-book.jpg'}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `https://via.placeholder.com/200x300/8b5cf6/ffffff?text=${book.title.slice(0, 10)}`
            }}
          />
          
          {/* Emotion Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-sm">
            <span>{dominantEmotion.icon}</span>
            <span className="font-medium capitalize">{dominantEmotion.name}</span>
          </div>

          {/* Category Badge */}
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(book.simple_categories)}`}>
            {book.simple_categories}
          </div>
        </div>

        {/* Book Info */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-gray-600 text-sm">
            by {formatAuthors(book.authors)}
          </p>

          {/* Description */}
          <p className="text-gray-700 text-sm line-clamp-3">
            {truncateText(book.description, 120)}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {book.average_rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{book.average_rating.toFixed(1)}</span>
                </div>
              )}
              
              {book.num_pages && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{book.num_pages} pages</span>
                </div>
              )}
            </div>

            {book.published_year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{book.published_year}</span>
              </div>
            )}
          </div>

          {/* Rating Count */}
          {book.ratings_count && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{book.ratings_count.toLocaleString()} ratings</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
