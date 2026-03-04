'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, LogOut, Package, Settings } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      username: data.username,
      password: data.password,
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid username or password')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label-field">Username or Email *</label>
        <input {...register('username')} className="input-field" placeholder="your@email.com" autoComplete="username" />
        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
      </div>
      <div>
        <label className="label-field">Password *</label>
        <input {...register('password')} type="password" className="input-field" placeholder="••••••••" autoComplete="current-password" />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}

function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterData) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || 'Registration failed')
      setSuccess(true)
      await signIn('credentials', { username: data.username, password: data.password, redirect: false })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return <p className="text-green-600 text-center">Account created! Welcome to ElectricMall.</p>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-field">First Name</label>
          <input {...register('first_name')} className="input-field" placeholder="John" />
        </div>
        <div>
          <label className="label-field">Last Name</label>
          <input {...register('last_name')} className="input-field" placeholder="Doe" />
        </div>
      </div>
      <div>
        <label className="label-field">Username *</label>
        <input {...register('username')} className="input-field" placeholder="johndoe" autoComplete="username" />
        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
      </div>
      <div>
        <label className="label-field">Email Address *</label>
        <input {...register('email')} type="email" className="input-field" placeholder="john@example.com" autoComplete="email" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label-field">Password *</label>
        <input {...register('password')} type="password" className="input-field" placeholder="Min. 8 characters" autoComplete="new-password" />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="btn-accent w-full justify-center">
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}

export default function MyAccountPage() {
  const { data: session, status } = useSession()
  const [tab, setTab] = useState<'login' | 'register'>('login')

  if (status === 'loading') {
    return (
      <div className="container-main section-padding text-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (session) {
    return (
      <div className="container-main section-padding">
        <h1 className="section-title mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="card p-6 flex flex-col items-center text-center h-fit">
            <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-brand-primary" />
            </div>
            <h2 className="font-bold text-brand-dark text-lg">{session.user?.name || 'Welcome'}</h2>
            <p className="text-gray-500 text-sm">{session.user?.email}</p>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 mt-5 px-4 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* Dashboard tiles */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5 flex items-start gap-4 hover:border-brand-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-dark">My Orders</h3>
                <p className="text-sm text-gray-500 mt-1">Track and manage your orders</p>
              </div>
            </div>
            <div className="card p-5 flex items-start gap-4 hover:border-brand-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-brand-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Settings className="w-6 h-6 text-brand-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-dark">Account Details</h3>
                <p className="text-sm text-gray-500 mt-1">Update your profile information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-main section-padding">
      <div className="max-w-md mx-auto">
        <h1 className="section-title mb-8 text-center">My Account</h1>

        {/* Tab switcher */}
        <div className="flex rounded-xl border border-gray-200 p-1 mb-6 bg-gray-50">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'login' ? 'bg-white shadow text-brand-dark' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'register' ? 'bg-white shadow text-brand-dark' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        <div className="card p-6">
          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  )
}
