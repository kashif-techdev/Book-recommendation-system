import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAuthors(authors: string): string {
  if (!authors) return 'Unknown Author'
  
  const authorList = authors.split(';').map(author => author.trim())
  
  if (authorList.length === 1) {
    return authorList[0]
  } else if (authorList.length === 2) {
    return `${authorList[0]} and ${authorList[1]}`
  } else {
    return `${authorList.slice(0, -1).join(', ')}, and ${authorList[authorList.length - 1]}`
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function getEmotionColor(emotion: string, intensity: number): string {
  const colors = {
    joy: 'text-green-500',
    sadness: 'text-blue-500',
    anger: 'text-red-500',
    fear: 'text-purple-500',
    surprise: 'text-yellow-500',
  }
  
  return colors[emotion as keyof typeof colors] || 'text-gray-500'
}

export function getEmotionIcon(emotion: string): string {
  const icons = {
    joy: '😊',
    sadness: '😢',
    anger: '😠',
    fear: '😨',
    surprise: '😲',
  }
  
  return icons[emotion as keyof typeof icons] || '😐'
}

export function getCategoryColor(category: string): string {
  const colors = {
    'Fiction': 'bg-purple-100 text-purple-800',
    'Nonfiction': 'bg-blue-100 text-blue-800',
    "Children's Fiction": 'bg-green-100 text-green-800',
    "Children's Nonfiction": 'bg-orange-100 text-orange-800',
  }
  
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export function generatePlaceholderThumbnail(title: string, category: string): string {
  const colors = {
    'Fiction': '8b5cf6',
    'Nonfiction': '3b82f6',
    "Children's Fiction": '10b981',
    "Children's Nonfiction": 'f59e0b',
  }
  
  const color = colors[category as keyof typeof colors] || '8b5cf6'
  const titleShort = title.slice(0, 20).replace(/\s+/g, '+')
  
  return `https://via.placeholder.com/200x300/${color}/ffffff?text=${titleShort}`
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
