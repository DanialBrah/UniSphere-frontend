import { AuthLayout }          from '../components/auth/AuthLayout'
import { ForgotPasswordForm }  from '../components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email to receive a reset link">
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
