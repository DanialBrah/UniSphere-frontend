import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { AvatarUpload } from './AvatarUpload'
import { useUpdateProfile } from '../../hooks/useUpdateProfile'
import { mediaApi } from '../../../social/api/mediaApi'
import { displayName } from '../../utils/profileUtils'
import { inputClass } from '../../../social/utils/formUtils'
import {
  studentProfileSchema,
  alumniProfileSchema,
  employerProfileSchema,
  clubProfileSchema,
  universityProfileSchema,
  adminProfileSchema,
} from '../../schemas/profileSchemas'
import type {
  StudentEditFormData,
  AlumniEditFormData,
  EmployerEditFormData,
  ClubEditFormData,
  UniversityEditFormData,
  AdminEditFormData,
} from '../../schemas/profileSchemas'
import type { UserProfileResponse } from '../../types/auth'
import type { UpdateProfilePayload } from '../../api/userApi'

interface Props {
  profile: UserProfileResponse
  onClose: () => void
}

async function uploadAvatarIfNeeded(
  avatarFile: File | null | undefined,
): Promise<string | undefined> {
  if (avatarFile === undefined) return undefined
  if (avatarFile === null) return ''
  return mediaApi.uploadAvatar(avatarFile)
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

// ── Role-specific field sections ─────────────────────────────────────────────

function StudentFields({ profile }: { profile: Extract<UserProfileResponse, { role: 'STUDENT' }> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StudentEditFormData>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      phone: profile.phone ?? '',
      fullName: profile.fullName,
      faculty: profile.faculty ?? '',
      program: profile.program ?? '',
      yearOfStudy: profile.yearOfStudy != null ? String(profile.yearOfStudy) : '',
    },
  })
  const update = useUpdateProfile()
  const [avatarFile, setAvatarFile] = useState<File | null | undefined>(undefined)

  async function onSubmit(data: StudentEditFormData) {
    const payload: UpdateProfilePayload = { ...data, yearOfStudy: undefined }
    if (data.yearOfStudy) {
      const n = parseInt(data.yearOfStudy, 10)
      if (!isNaN(n)) payload.yearOfStudy = n
    }
    try {
      const avatarUrl = await uploadAvatarIfNeeded(avatarFile)
      if (avatarUrl !== undefined) payload.avatarUrl = avatarUrl
    } catch (err) {
      toast.error(`Could not upload avatar: ${err instanceof Error ? err.message : 'Upload failed'}`)
      return
    }
    await update.mutateAsync(payload)
  }

  return (
    <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-4">
      <AvatarUpload
        currentAvatarUrl={profile.avatarUrl}
        displayName={profile.fullName}
        onAvatarChange={setAvatarFile}
      />
      <div>
        <input {...register('fullName')} placeholder="Full name" className={inputClass(!!errors.fullName)} />
        <FieldError msg={errors.fullName?.message} />
      </div>
      <div>
        <input {...register('phone')} placeholder="Phone (optional)" className={inputClass(!!errors.phone)} />
        <FieldError msg={errors.phone?.message} />
      </div>
      <div>
        <input {...register('faculty')} placeholder="Faculty (optional)" className={inputClass()} />
      </div>
      <div>
        <input {...register('program')} placeholder="Program (optional)" className={inputClass()} />
      </div>
      <div>
        <input {...register('yearOfStudy')} type="number" min={1} max={10} placeholder="Year of study (optional)" className={inputClass(!!errors.yearOfStudy)} />
        <FieldError msg={errors.yearOfStudy?.message} />
      </div>
      <SubmitButton pending={isSubmitting || update.isPending} />
    </form>
  )
}

function AlumniFields({ profile }: { profile: Extract<UserProfileResponse, { role: 'ALUMNI' }> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AlumniEditFormData>({
    resolver: zodResolver(alumniProfileSchema),
    defaultValues: {
      phone: profile.phone ?? '',
      fullName: profile.fullName,
      currentCompany: profile.currentCompany ?? '',
      currentPosition: profile.currentPosition ?? '',
      linkedinUrl: profile.linkedinUrl ?? '',
    },
  })
  const update = useUpdateProfile()
  const [avatarFile, setAvatarFile] = useState<File | null | undefined>(undefined)

  async function onSubmit(data: AlumniEditFormData) {
    const payload: UpdateProfilePayload = { ...data }
    try {
      const avatarUrl = await uploadAvatarIfNeeded(avatarFile)
      if (avatarUrl !== undefined) payload.avatarUrl = avatarUrl
    } catch (err) {
      toast.error(`Could not upload avatar: ${err instanceof Error ? err.message : 'Upload failed'}`)
      return
    }
    await update.mutateAsync(payload)
  }

  return (
    <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-4">
      <AvatarUpload
        currentAvatarUrl={profile.avatarUrl}
        displayName={profile.fullName}
        onAvatarChange={setAvatarFile}
      />
      <div>
        <input {...register('fullName')} placeholder="Full name" className={inputClass(!!errors.fullName)} />
        <FieldError msg={errors.fullName?.message} />
      </div>
      <div>
        <input {...register('phone')} placeholder="Phone (optional)" className={inputClass(!!errors.phone)} />
        <FieldError msg={errors.phone?.message} />
      </div>
      <div>
        <input {...register('currentCompany')} placeholder="Current company (optional)" className={inputClass()} />
      </div>
      <div>
        <input {...register('currentPosition')} placeholder="Current position (optional)" className={inputClass()} />
      </div>
      <div>
        <input {...register('linkedinUrl')} placeholder="LinkedIn URL (optional)" className={inputClass(!!errors.linkedinUrl)} />
        <FieldError msg={errors.linkedinUrl?.message} />
      </div>
      <SubmitButton pending={isSubmitting || update.isPending} />
    </form>
  )
}

function EmployerFields({ profile }: { profile: Extract<UserProfileResponse, { role: 'EMPLOYER' }> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmployerEditFormData>({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      phone: profile.phone ?? '',
      companyName: profile.companyName,
      industry: profile.industry ?? '',
      companySize: profile.companySize ?? '',
      websiteUrl: profile.websiteUrl ?? '',
      description: profile.description ?? '',
    },
  })
  const update = useUpdateProfile()
  const [avatarFile, setAvatarFile] = useState<File | null | undefined>(undefined)

  async function onSubmit(data: EmployerEditFormData) {
    const payload: UpdateProfilePayload = { ...data }
    try {
      const avatarUrl = await uploadAvatarIfNeeded(avatarFile)
      if (avatarUrl !== undefined) payload.avatarUrl = avatarUrl
    } catch (err) {
      toast.error(`Could not upload avatar: ${err instanceof Error ? err.message : 'Upload failed'}`)
      return
    }
    await update.mutateAsync(payload)
  }

  return (
    <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-4">
      <AvatarUpload
        currentAvatarUrl={profile.avatarUrl}
        displayName={profile.companyName}
        onAvatarChange={setAvatarFile}
      />
      <div>
        <input {...register('companyName')} placeholder="Company name" className={inputClass(!!errors.companyName)} />
        <FieldError msg={errors.companyName?.message} />
      </div>
      <div>
        <input {...register('phone')} placeholder="Phone (optional)" className={inputClass(!!errors.phone)} />
        <FieldError msg={errors.phone?.message} />
      </div>
      <div>
        <input {...register('industry')} placeholder="Industry (optional)" className={inputClass()} />
      </div>
      <div>
        <input {...register('companySize')} placeholder="Company size (optional)" className={inputClass()} />
      </div>
      <div>
        <input {...register('websiteUrl')} placeholder="Website URL (optional)" className={inputClass(!!errors.websiteUrl)} />
        <FieldError msg={errors.websiteUrl?.message} />
      </div>
      <div>
        <textarea {...register('description')} rows={3} placeholder="Description (optional)" className={`${inputClass()} resize-none`} />
      </div>
      <SubmitButton pending={isSubmitting || update.isPending} />
    </form>
  )
}

function ClubFields({ profile }: { profile: Extract<UserProfileResponse, { role: 'CLUB' }> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClubEditFormData>({
    resolver: zodResolver(clubProfileSchema),
    defaultValues: {
      phone: profile.phone ?? '',
      category: profile.category ?? '',
      description: profile.description ?? '',
    },
  })
  const update = useUpdateProfile()
  const [avatarFile, setAvatarFile] = useState<File | null | undefined>(undefined)

  async function onSubmit(data: ClubEditFormData) {
    const payload: UpdateProfilePayload = { ...data }
    try {
      const avatarUrl = await uploadAvatarIfNeeded(avatarFile)
      if (avatarUrl !== undefined) payload.avatarUrl = avatarUrl
    } catch (err) {
      toast.error(`Could not upload avatar: ${err instanceof Error ? err.message : 'Upload failed'}`)
      return
    }
    await update.mutateAsync(payload)
  }

  return (
    <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-4">
      <AvatarUpload
        currentAvatarUrl={profile.avatarUrl}
        displayName={profile.name}
        onAvatarChange={setAvatarFile}
      />
      <div>
        <input {...register('phone')} placeholder="Phone (optional)" className={inputClass(!!errors.phone)} />
        <FieldError msg={errors.phone?.message} />
      </div>
      <div>
        <input {...register('category')} placeholder="Club category (optional)" className={inputClass()} />
      </div>
      <div>
        <textarea {...register('description')} rows={3} placeholder="Description (optional)" className={`${inputClass()} resize-none`} />
      </div>
      <SubmitButton pending={isSubmitting || update.isPending} />
    </form>
  )
}

function UniversityFields({ profile }: { profile: Extract<UserProfileResponse, { role: 'UNIVERSITY' }> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UniversityEditFormData>({
    resolver: zodResolver(universityProfileSchema),
    defaultValues: {
      phone: profile.phone ?? '',
      shortName: profile.shortName ?? '',
      address: profile.address ?? '',
      country: profile.country ?? '',
      state: profile.state ?? '',
    },
  })
  const update = useUpdateProfile()
  const [avatarFile, setAvatarFile] = useState<File | null | undefined>(undefined)

  async function onSubmit(data: UniversityEditFormData) {
    const payload: UpdateProfilePayload = { ...data }
    try {
      const avatarUrl = await uploadAvatarIfNeeded(avatarFile)
      if (avatarUrl !== undefined) payload.avatarUrl = avatarUrl
    } catch (err) {
      toast.error(`Could not upload avatar: ${err instanceof Error ? err.message : 'Upload failed'}`)
      return
    }
    await update.mutateAsync(payload)
  }

  return (
    <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-4">
      <AvatarUpload
        currentAvatarUrl={profile.avatarUrl}
        displayName={profile.name}
        onAvatarChange={setAvatarFile}
      />
      <div>
        <input {...register('phone')} placeholder="Phone (optional)" className={inputClass(!!errors.phone)} />
        <FieldError msg={errors.phone?.message} />
      </div>
      <div>
        <input {...register('shortName')} placeholder="Short name / abbreviation (optional)" className={inputClass()} />
      </div>
      <div>
        <input {...register('address')} placeholder="Address (optional)" className={inputClass()} />
      </div>
      <div>
        <input {...register('country')} placeholder="Country (optional)" className={inputClass()} />
      </div>
      <div>
        <input {...register('state')} placeholder="State / region (optional)" className={inputClass()} />
      </div>
      <SubmitButton pending={isSubmitting || update.isPending} />
    </form>
  )
}

function AdminFields({ profile }: { profile: Extract<UserProfileResponse, { role: 'ADMIN' }> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdminEditFormData>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: { phone: profile.phone ?? '' },
  })
  const update = useUpdateProfile()
  const [avatarFile, setAvatarFile] = useState<File | null | undefined>(undefined)

  async function onSubmit(data: AdminEditFormData) {
    const payload: UpdateProfilePayload = { ...data }
    try {
      const avatarUrl = await uploadAvatarIfNeeded(avatarFile)
      if (avatarUrl !== undefined) payload.avatarUrl = avatarUrl
    } catch (err) {
      toast.error(`Could not upload avatar: ${err instanceof Error ? err.message : 'Upload failed'}`)
      return
    }
    await update.mutateAsync(payload)
  }

  return (
    <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-4">
      <AvatarUpload
        currentAvatarUrl={profile.avatarUrl}
        displayName={profile.fullName}
        onAvatarChange={setAvatarFile}
      />
      <div>
        <input {...register('phone')} placeholder="Phone (optional)" className={inputClass(!!errors.phone)} />
        <FieldError msg={errors.phone?.message} />
      </div>
      <SubmitButton pending={isSubmitting || update.isPending} />
    </form>
  )
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  )
}

// ── Modal shell ───────────────────────────────────────────────────────────────

export function EditProfileModal({ profile, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const name = displayName(profile)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2D1F4D]">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-5">
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Editing as <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
          </p>

          {profile.role === 'STUDENT'    && <StudentFields    profile={profile} />}
          {profile.role === 'ALUMNI'     && <AlumniFields     profile={profile} />}
          {profile.role === 'EMPLOYER'   && <EmployerFields   profile={profile} />}
          {profile.role === 'CLUB'       && <ClubFields       profile={profile} />}
          {profile.role === 'UNIVERSITY' && <UniversityFields profile={profile} />}
          {profile.role === 'ADMIN'      && <AdminFields      profile={profile} />}
        </div>
      </div>
    </div>
  )
}
