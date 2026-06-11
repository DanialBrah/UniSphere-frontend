export function ProfileError() {
  return (
    <div className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] p-8 text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Could not load profile. Please try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-semibold"
      >
        Reload
      </button>
    </div>
  )
}
