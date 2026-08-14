/**
 * A client-only convenience list, not a taxonomy the backend knows about — `category` is a plain
 * `VARCHAR(100)` server-side (`ServiceListingService` does an exact-string-match filter), so this
 * just seeds the filter chips and the create/edit form's suggestions. A provider can still type any
 * category; nothing here is enforced past the 100-character length.
 *
 * Includes the four values `ServiceSeeder` plants, plus a handful of other plausible campus
 * services.
 */
export const SERVICE_CATEGORY_SUGGESTIONS = [
  'Tutoring',
  'Design',
  'Writing',
  'Photography',
  'Programming',
  'Music',
  'Fitness',
  'Translation',
  'Video editing',
  'Other',
] as const
