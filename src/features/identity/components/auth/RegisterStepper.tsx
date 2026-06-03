import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { RegisterRole } from '../../hooks/useRegister'
import { RolePickerGrid } from './RolePickerGrid'
import { StudentForm }    from './StudentForm'
import { AlumniForm }     from './AlumniForm'
import { EmployerForm }   from './EmployerForm'
import { ClubForm }       from './ClubForm'

const ROLE_LABELS: Record<RegisterRole, string> = {
  STUDENT:  'Student',
  ALUMNI:   'Alumni',
  EMPLOYER: 'Employer',
  CLUB:     'Club',
}

export function RegisterStepper() {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedRole, setSelectedRole] = useState<RegisterRole | null>(null)

  function handleSelect(role: RegisterRole) {
    setSelectedRole(role)
    setStep(2)
  }

  function handleBack() {
    setStep(1)
    setSelectedRole(null)
  }

  return (
    <div>
      {/* Step heading */}
      <div className="text-center mb-6 -mt-2">
        {step === 1 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Choose how you want to join</p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Registering as{' '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {selectedRole ? ROLE_LABELS[selectedRole] : ''}
            </span>
          </p>
        )}
      </div>

      {step === 1 && <RolePickerGrid onSelect={handleSelect} />}
      {step === 2 && selectedRole === 'STUDENT'  && <StudentForm  onBack={handleBack} />}
      {step === 2 && selectedRole === 'ALUMNI'   && <AlumniForm   onBack={handleBack} />}
      {step === 2 && selectedRole === 'EMPLOYER' && <EmployerForm onBack={handleBack} />}
      {step === 2 && selectedRole === 'CLUB'     && <ClubForm     onBack={handleBack} />}

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
