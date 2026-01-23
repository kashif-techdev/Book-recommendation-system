'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Sparkles } from 'lucide-react'

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

  const handleQueryChange = (value: string) => {
    setQuery(value)
    // No automatic search - user must click search button
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

  const handleSearchClick = () => {
    onSearch(query)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          {/* Enhanced search input with better shadow and styling */}
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-14 pr-32 sm:pr-36 md:pr-44 py-4 sm:py-5 text-base sm:text-lg border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100/50 transition-all duration-300 bg-white shadow-lg hover:shadow-xl focus:shadow-2xl backdrop-blur-sm"
            disabled={isLoading}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-400 hover:text-primary-600 hover:bg-gray-50'
              }`}
              aria-label="Toggle filters"
            >
              <Filter className="h-5 w-5" />
            </button>
            
            <button
              type="submit"
              onClick={handleSearchClick}
              disabled={isLoading}
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base font-medium shadow-md hover:shadow-lg active:scale-95"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Enhanced Filters */}
      <motion.div
        initial={false}
        animate={{ 
          height: showFilters ? 'auto' : 0,
          opacity: showFilters ? 1 : 0,
          marginTop: showFilters ? 16 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="mt-4 p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                aria-label="Select book category"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-gray-300 cursor-pointer"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Emotional Tone
              </label>
              <select
                value={tone}
                onChange={(e) => handleToneChange(e.target.value)}
                aria-label="Select emotional tone"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-gray-300 cursor-pointer"
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
