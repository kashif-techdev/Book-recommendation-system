'use client'

import { SearchHistoryItem } from '@/lib/types'
import { Clock, Trash2 } from 'lucide-react'

interface SearchHistoryPanelProps {
  history: SearchHistoryItem[]
  loading: boolean
  onDeleteOne: (id: number) => void
  onClearAll: () => void
}

export default function SearchHistoryPanel({
  history,
  loading,
  onDeleteOne,
  onClearAll,
}: SearchHistoryPanelProps) {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Your Search History</h3>
            </div>
            <button
              onClick={onClearAll}
              disabled={loading || history.length === 0}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
          </div>

          <div className="p-4">
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">No searches yet. Start searching to build your history.</p>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.query || '(empty query)'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Category: {item.category || 'All'} | Tone: {item.tone || 'All'} | Results: {item.resultsCount}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteOne(item.id)}
                      disabled={loading}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                      aria-label="Delete history item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

