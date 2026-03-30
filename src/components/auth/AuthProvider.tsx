'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import type { UserProfile } from '@/types'

interface RegisterData {
  email: string
  password: string
  name: string
  role?: string
  department?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchProfile = useCallback(async (supabaseId: string) => {
    try {
      const response = await fetch(`/api/auth/profile?supabaseId=${supabaseId}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on mount, so no need for separate getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }

        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, fetchProfile, router])

  // Refresh profile every 60s and on window focus to pick up permission changes
  useEffect(() => {
    let currentUserId: string | null = null

    const handleFocus = () => {
      if (currentUserId) fetchProfile(currentUserId)
    }

    const unsubscribe = supabase.auth.onAuthStateChange((_, session) => {
      currentUserId = session?.user?.id ?? null
    })

    window.addEventListener('focus', handleFocus)
    const interval = setInterval(() => {
      if (currentUserId) fetchProfile(currentUserId)
    }, 300000)

    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
      unsubscribe.data.subscription.unsubscribe()
    }
  }, [supabase.auth, fetchProfile])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      // Update last login
      if (data.user) {
        await fetch('/api/auth/update-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supabaseId: data.user.id }),
        })
      }

      toast.success('Welcome back!')
      router.push('/')
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          }
        }
      })

      if (authError) {
        toast.error(authError.message)
        return { success: false, error: authError.message }
      }

      // 2. Create user profile in our database
      if (authData.user) {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supabaseId: authData.user.id,
            email: data.email,
            name: data.name,
            role: data.role || 'Member',
            department: data.department,
            phone: data.phone,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          toast.error(errorData.message)
          return { success: false, error: errorData.message }
        }
      }

      toast.success('Registration successful!')
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    toast.info('Logged out successfully')
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, supabaseId: user?.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.message }
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile.profile)
      toast.success('Profile updated')
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Update failed'
      return { success: false, error: message }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthenticated: !!user && !!profile,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
