import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useResetPassword } from '../../hooks/useResetPassword'
import { resetPasswordSchema, type ResetPasswordFormData } from '../../schemas'
import { FieldError, Label, PasswordInput } from './FormPrimitives'
import { getErrorMessage } from '../../../../lib/utils'
import { useCooldown } from '../../../../hooks/useCooldown'

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { mutate, isPending, error } = useResetPassword()
  const cooldown = useCooldown(error)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema) as unknown as Resolver<ResetPasswordFormData>,
  })

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-red-500">
          This reset link is invalid or missing a token.
        </p>
        <Link
          to="/forgot-password"
          className="inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline font-semibold"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  function onSubmit(data: ResetPasswordFormData) {
    mutate(
      { token: token!, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success('Password reset! Please sign in.')
          navigate('/login', { replace: true })
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )
  }

  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label>New password</Label>
        <PasswordInput
          registered={register('newPassword')}
          error={errors.newPassword?.message}
        />
        <FieldError message={errors.newPassword?.message} />
      </div>

      <div>
        <Label>Confirm new password</Label>
        <PasswordInput
          registered={register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <button
        type="submit"
        disabled={isPending || cooldown > 0}
        className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
      >
        {isPending && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {cooldown > 0 ? `Try again in ${cooldown}s` : isPending ? 'Resetting…' : 'Set new password'}
      </button>
    </form>
  )
}
