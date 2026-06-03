import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useLogin } from '../../hooks/useLogin'
import { loginSchema, type LoginFormData } from '../../schemas'
import { inputClass } from './formUtils'
import { FieldError, Label } from './FormPrimitives'
import { getErrorMessage } from '../../../../lib/utils'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { mutate, isPending, isSuccess, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    if (isSuccess) navigate('/dashboard', { replace: true })
  }, [isSuccess, navigate])

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  return (
    <div className="space-y-5">
      {/* Email */}
      <div>
        <Label>Email address</Label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="you@university.edu"
          className={inputClass(!!errors.email)}
        />
        <FieldError message={errors.email?.message} />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label>Password</Label>
          <button
            type="button"
            onClick={() => toast.info('Password reset coming soon')}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClass(!!errors.password) + ' pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <FieldError message={errors.password?.message} />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit((data) => mutate(data))}
        disabled={isPending}
        className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
      >
        {isPending && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>

      {/* Footer link */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
