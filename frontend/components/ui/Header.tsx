'use client'

import { motion } from 'framer-motion'
import { BookOpen, Sparkles, Github, Heart, LogIn, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50"
    >
      {/* Auth Buttons - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {isAuthenticated ? (
          <>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-sm text-gray-700">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.username}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="font-medium">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all text-sm font-medium"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Login</span>
          </Link>
        )}
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20 sm:pt-12">
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
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold gradient-text">
              BookWise
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto px-4"
          >
            Discover your next favorite book with{' '}
            <span className="font-semibold text-primary-600">AI-powered recommendations</span>
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 px-4"
          >
            <div className="flex items-center gap-2 text-gray-600">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
              <span className="text-sm sm:text-base font-medium">Smart AI</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <span className="text-sm sm:text-base font-medium">Emotional Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-500" />
              <span className="text-sm sm:text-base font-medium">5,000+ Books</span>
            </div>
          </motion.div>

         
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary-200 rounded-full blur-xl opacity-20 animate-float hidden md:block" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary-200 rounded-full blur-xl opacity-20 animate-float hidden md:block" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent-200 rounded-full blur-xl opacity-20 animate-float hidden lg:block" style={{ animationDelay: '2s' }} />
    </motion.header>
  )
}
