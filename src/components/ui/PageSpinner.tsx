export function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0A1A]">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
