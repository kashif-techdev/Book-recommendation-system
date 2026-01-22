'use client'

import { motion } from 'framer-motion'
import { BookOpen, Sparkles, Github, Heart } from 'lucide-react'

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Logo and Title */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-lg opacity-30" />
              <div className="relative bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-2xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">
              BookWise
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Discover your next favorite book with{' '}
            <span className="font-semibold text-primary-600">AI-powered recommendations</span>
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 mb-8"
          >
            <div className="flex items-center gap-2 text-gray-600">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span className="font-medium">Smart AI</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-medium">Emotional Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="w-5 h-5 text-secondary-500" />
              <span className="font-medium">5,000+ Books</span>
            </div>
          </motion.div>

          {/* GitHub Link */}
          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Github className="w-5 h-5" />
            <span>View on GitHub</span>
          </motion.a>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary-200 rounded-full blur-xl opacity-20 animate-float" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary-200 rounded-full blur-xl opacity-20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent-200 rounded-full blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
    </motion.header>
  )
}
