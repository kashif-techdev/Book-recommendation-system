'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Sparkles } from 'lucide-react'
import { debounce } from '@/lib/utils'

interface SearchBarProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: { category: string; tone: string }) => void
  isLoading?: boolean
  placeholder?: string
}

export default function SearchBar({ 
  onSearch, 
  onFilterChange, 
  isLoading = false,
  placeholder = "Describe a book you'd like to read..."
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [tone, setTone] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const categories = ['All', 'Fiction', 'Nonfiction', "Children's Fiction", "Children's Nonfiction"]
  const tones = ['All', 'Happy', 'Sad', 'Angry', 'Suspenseful', 'Surprising']

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery)
    }, 300),
    [onSearch]
  )

  const handleQueryChange = (value: string) => {
    setQuery(value)
    debouncedSearch(value)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    onFilterChange({ category: value, tone })
  }

  const handleToneChange = (value: string) => {
    setTone(value)
    onFilterChange({ category, tone: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-24 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            disabled={isLoading}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
            >
              <Filter className="h-5 w-5" />
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="ml-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Find Books
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Filters */}
      <motion.div
        initial={false}
        animate={{ 
          height: showFilters ? 'auto' : 0,
          opacity: showFilters ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emotional Tone
              </label>
              <select
                value={tone}
                onChange={(e) => handleToneChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
