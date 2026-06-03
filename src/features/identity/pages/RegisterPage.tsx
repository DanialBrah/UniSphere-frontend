import { AuthLayout }      from '../components/auth/AuthLayout'
import { RegisterStepper } from '../components/auth/RegisterStepper'

export default function RegisterPage() {
  return (
    <AuthLayout title="Create an account" subtitle="Join the UniSphere campus network">
      <RegisterStepper />
    </AuthLayout>
  )
}
