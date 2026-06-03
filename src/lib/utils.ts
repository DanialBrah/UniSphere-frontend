import { AxiosError } from 'axios'

export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    return (err.response?.data as { message?: string })?.message ?? err.message
  }
  return 'Something went wrong. Please try again.'
}
