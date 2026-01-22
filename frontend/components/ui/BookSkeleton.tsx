'use client'

import { motion } from 'framer-motion'

interface BookSkeletonProps {
  count?: number
}

export default function BookSkeleton({ count = 8 }: BookSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-book overflow-hidden border border-gray-100"
        >
          {/* Cover Skeleton */}
          <div className="h-64 bg-gray-200 skeleton relative overflow-hidden">
            <div className="absolute top-3 right-3 w-16 h-6 bg-gray-300 rounded-full skeleton" />
            <div className="absolute top-3 left-3 w-20 h-6 bg-gray-300 rounded-full skeleton" />
          </div>

          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded skeleton w-3/4" />
              <div className="h-5 bg-gray-200 rounded skeleton w-1/2" />
            </div>

            {/* Author */}
            <div className="h-4 bg-gray-200 rounded skeleton w-2/3" />

            {/* Description */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded skeleton w-full" />
              <div className="h-3 bg-gray-200 rounded skeleton w-full" />
              <div className="h-3 bg-gray-200 rounded skeleton w-2/3" />
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 bg-gray-200 rounded skeleton w-12" />
                <div className="h-4 bg-gray-200 rounded skeleton w-16" />
              </div>
              <div className="h-4 bg-gray-200 rounded skeleton w-12" />
            </div>

            {/* Rating Count */}
            <div className="h-3 bg-gray-200 rounded skeleton w-20" />
          </div>
        </motion.div>
      ))}
    </>
  )
}
