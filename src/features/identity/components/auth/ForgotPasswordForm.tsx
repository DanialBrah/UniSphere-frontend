import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useForgotPassword } from '../../hooks/useForgotPassword'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../schemas'
import { inputClass } from './formUtils'
import { FieldError, Label } from './FormPrimitives'
import { getErrorMessage } from '../../../../lib/utils'

export function ForgotPasswordForm() {
  const [uiState, setUiState] = useState<'form' | 'success'>('form')
  const { mutate, isPending } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

  function onSubmit(data: ForgotPasswordFormData) {
    mutate(data, {
      onSuccess: () => setUiState('success'),
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  if (uiState === 'success') {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Check your inbox — a reset link has been sent. The link expires in 15 minutes.
        </p>
        <Link
          to="/login"
          className="inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline font-semibold"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
      >
        {isPending && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {isPending ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Remember your password?{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
