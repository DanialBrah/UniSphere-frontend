import type { UserProfileResponse } from '../../types/auth'

interface Field {
  label: string
  value: string | number | boolean | null | undefined
}

function FieldCard({ label, value }: Field) {
  const display = value === null || value === undefined || value === ''
    ? '—'
    : typeof value === 'boolean'
    ? value ? 'Yes' : 'No'
    : String(value)

  return (
    <div className="bg-gray-50 dark:bg-[#0F0A1A] rounded-xl p-4 border border-gray-100 dark:border-[#2D1F4D]">
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{display}</p>
    </div>
  )
}

function buildFields(user: UserProfileResponse): Field[] {
  switch (user.role) {
    case 'STUDENT':
      return [
        { label: 'Matric Number',        value: user.matricNumber },
        { label: 'University Email',      value: user.universityEmail },
        { label: 'Faculty',              value: user.faculty },
        { label: 'Program',              value: user.program },
        { label: 'Year of Study',         value: user.yearOfStudy },
        { label: 'Enrollment Date',       value: user.enrollmentDate },
        { label: 'Expected Graduation',   value: user.expectedGraduation },
      ]
    case 'ALUMNI':
      return [
        { label: 'Graduation Year',  value: user.graduationYear },
        { label: 'Degree',           value: user.degree },
        { label: 'Major',            value: user.major },
        { label: 'Current Company',  value: user.currentCompany },
        { label: 'Current Position', value: user.currentPosition },
        { label: 'LinkedIn',         value: user.linkedinUrl },
      ]
    case 'EMPLOYER':
      return [
        { label: 'Industry',          value: user.industry },
        { label: 'Company Size',      value: user.companySize },
        { label: 'Website',           value: user.websiteUrl },
        { label: 'Company Verified',  value: user.companyVerified },
        { label: 'Description',       value: user.description },
      ]
    case 'CLUB':
      return [
        { label: 'Category',     value: user.category },
        { label: 'Official Club', value: user.isOfficial },
        { label: 'University ID', value: user.universityId },
        { label: 'Description',  value: user.description },
      ]
    case 'UNIVERSITY':
      return [
        { label: 'Short Name',          value: user.shortName },
        { label: 'Website',             value: user.websiteUrl },
        { label: 'Address',             value: user.address },
        { label: 'Country',             value: user.country },
        { label: 'State',               value: user.state },
        { label: 'Institution Verified', value: user.institutionVerified },
      ]
    case 'ADMIN':
      return [
        { label: 'Admin Level', value: user.adminLevel },
      ]
  }
}

interface Props {
  user: UserProfileResponse
}

export function ProfileDetails({ user }: Props) {
  const fields = buildFields(user)

  if (fields.length === 0) return null

  return (
    <div className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] p-6">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
        Profile Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((field) => (
          <FieldCard key={field.label} {...field} />
        ))}
      </div>
    </div>
  )
}
