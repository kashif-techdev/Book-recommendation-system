'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

declare global {
  interface Window {
    google: any
  }
}

interface GoogleSignInProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  width?: number
}

export default function GoogleSignIn({ 
  text = 'signin_with', 
  theme = 'outline',
  size = 'large',
  width
}: GoogleSignInProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const buttonRef = useRef<HTMLDivElement>(null)
  const googleLoaded = useRef(false)

  useEffect(() => {
    // Load Google Identity Services script
    if (!window.google && !googleLoaded.current) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        googleLoaded.current = true
        initializeGoogleSignIn()
      }
      document.head.appendChild(script)
    } else if (window.google && buttonRef.current) {
      initializeGoogleSignIn()
    }

    return () => {
      // Cleanup if needed
    }
  }, [])

  const initializeGoogleSignIn = () => {
    if (!window.google || !buttonRef.current) return

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    
    if (!clientId) {
      console.warn('Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file.')
      if (buttonRef.current) {
        buttonRef.current.innerHTML = '<p class="text-sm text-gray-500 text-center">Google Sign In not configured</p>'
      }
      return
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      })

      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          type: 'standard',
          theme: theme,
          size: size,
          text: text,
          width: width,
          shape: 'rectangular',
          logo_alignment: 'left',
        }
      )
    } catch (error) {
      console.error('Error initializing Google Sign In:', error)
    }
  }

  const handleCredentialResponse = async (response: any) => {
    try {
      const result = await authApi.googleAuth(response.credential)
      
      if (result.success) {
        toast.success('Signed in with Google successfully!')
        // Use router.push and then reload to update auth state
        router.push('/')
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    } catch (error: any) {
      console.error('Google sign in error:', error)
      toast.error(error.message || 'Failed to sign in with Google')
    }
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full flex justify-center" />
    </div>
  )
}
