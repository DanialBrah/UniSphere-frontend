import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { useRegister } from '../../hooks/useRegister'
import { employerSchema, type EmployerFormData } from '../../schemas'
import { inputClass } from './formUtils'
import { FieldError, Label, PasswordInput, OptionalSection } from './FormPrimitives'
import { getErrorMessage } from '../../../../lib/utils'

export function EmployerForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()
  const { mutate, isPending, isSuccess, error } = useRegister('EMPLOYER')
  const { register, handleSubmit, formState: { errors } } = useForm<EmployerFormData>({
    resolver: zodResolver(employerSchema),
  })

  useEffect(() => { if (isSuccess) navigate('/dashboard', { replace: true }) }, [isSuccess, navigate])
  useEffect(() => { if (error) toast.error(getErrorMessage(error)) }, [error])

  return (
    <form className="space-y-4" onSubmit={handleSubmit((d) => mutate(d))}>
      <div>
        <Label>Company name *</Label>
        <input {...register('companyName')} placeholder="Acme Corporation" className={inputClass(!!errors.companyName)} />
        <FieldError message={errors.companyName?.message} />
      </div>
      <div>
        <Label>Email address *</Label>
        <input {...register('email')} type="email" placeholder="hr@acmecorp.com" className={inputClass(!!errors.email)} />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label>Password *</Label>
        <PasswordInput registered={register('password')} error={errors.password?.message} />
        <FieldError message={errors.password?.message} />
      </div>
      <OptionalSection>
        <div>
          <Label>Industry</Label>
          <input {...register('industry')} placeholder="Technology" className={inputClass(false)} />
        </div>
        <div>
          <Label>Company size</Label>
          <input {...register('companySize')} placeholder="51-200" className={inputClass(false)} />
        </div>
        <div>
          <Label>Website URL</Label>
          <input {...register('websiteUrl')} type="url" placeholder="https://acmecorp.com" className={inputClass(!!errors.websiteUrl)} />
          <FieldError message={errors.websiteUrl?.message} />
        </div>
        <div>
          <Label>Phone</Label>
          <input {...register('phone')} type="tel" placeholder="+601234567890" className={inputClass(!!errors.phone)} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label>Description</Label>
          <textarea {...register('description')} rows={3} placeholder="Brief description of your company…" className={inputClass(false) + ' resize-none'} />
        </div>
      </OptionalSection>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <button type="submit" disabled={isPending} className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
          {isPending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {isPending ? 'Creating account…' : 'Create account'}
        </button>
      </div>
    </form>
  )
}
