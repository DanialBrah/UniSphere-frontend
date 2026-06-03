import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { useRegister } from '../../hooks/useRegister'
import { alumniSchema, type AlumniFormData } from '../../schemas'
import { inputClass } from './formUtils'
import { FieldError, Label, PasswordInput, OptionalSection } from './FormPrimitives'
import { getErrorMessage } from '../../../../lib/utils'

export function AlumniForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()
  const { mutate, isPending, isSuccess, error } = useRegister('ALUMNI')
  const { register, handleSubmit, formState: { errors } } = useForm<AlumniFormData>({
    resolver: zodResolver(alumniSchema) as unknown as Resolver<AlumniFormData>,
  })

  useEffect(() => { if (isSuccess) navigate('/dashboard', { replace: true }) }, [isSuccess, navigate])
  useEffect(() => { if (error) toast.error(getErrorMessage(error)) }, [error])

  return (
    <form noValidate className="space-y-4" onSubmit={handleSubmit((d) => mutate(d))}>
      <div>
        <Label>Full name *</Label>
        <input {...register('fullName')} placeholder="Jane Smith" className={inputClass(!!errors.fullName)} />
        <FieldError message={errors.fullName?.message} />
      </div>
      <div>
        <Label>Graduation year *</Label>
        <input {...register('graduationYear')} placeholder="2022" maxLength={4} className={inputClass(!!errors.graduationYear)} />
        <FieldError message={errors.graduationYear?.message} />
      </div>
      <div>
        <Label>Email address *</Label>
        <input {...register('email')} type="email" placeholder="jane@example.com" className={inputClass(!!errors.email)} />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label>Password *</Label>
        <PasswordInput registered={register('password')} error={errors.password?.message} />
        <FieldError message={errors.password?.message} />
      </div>
      <OptionalSection>
        <div>
          <Label>Degree</Label>
          <input {...register('degree')} placeholder="Bachelor of Science" className={inputClass(false)} />
        </div>
        <div>
          <Label>Major</Label>
          <input {...register('major')} placeholder="Computer Science" className={inputClass(false)} />
        </div>
        <div>
          <Label>Current company</Label>
          <input {...register('currentCompany')} placeholder="Acme Corp" className={inputClass(false)} />
        </div>
        <div>
          <Label>Current position</Label>
          <input {...register('currentPosition')} placeholder="Software Engineer" className={inputClass(false)} />
        </div>
        <div>
          <Label>LinkedIn URL</Label>
          <input {...register('linkedinUrl')} type="url" placeholder="https://linkedin.com/in/jane" className={inputClass(!!errors.linkedinUrl)} />
          <FieldError message={errors.linkedinUrl?.message} />
        </div>
        <div>
          <Label>Phone</Label>
          <input {...register('phone')} type="tel" placeholder="+601234567890" className={inputClass(!!errors.phone)} />
          <FieldError message={errors.phone?.message} />
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
