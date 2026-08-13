import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { EventLocationField } from './EventLocationField'
import { EventCoverPicker } from './EventCoverPicker'
import { eventMediaApi } from '../api/eventMediaApi'
import { eventFormSchema, EVENT_DESCRIPTION_MAX, EVENT_TITLE_MAX } from '../schemas'
import type { EventFormData } from '../schemas'
import { CATEGORY_LABEL, CATEGORY_ORDER } from '../utils/display'
import { ERROR_CLASS, HINT_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import { fromDateTimeLocalValue, nowDateTimeLocalValue, toDateTimeLocalValue } from '../utils/dateUtils'
import { roundCoordinate } from '../utils/geo'
import type { LatLngTuple } from '../../../lib/mapConfig'
import type { CreateEventRequest, EventResponse, PendingEventCover, UpdateEventRequest } from '../types'

interface EventFormProps {
  /** Present in edit mode. */
  existing?: EventResponse
  onCreate?: (body: CreateEventRequest) => Promise<EventResponse>
  onUpdate?: (body: UpdateEventRequest) => Promise<EventResponse>
  onDone: (event: EventResponse) => void
  onCancel: () => void
}

/** A blank string clears a nullable text field server-side; `undefined` leaves it untouched. */
const trimmed = (value: string | undefined): string | undefined => value?.trim() || undefined

export function EventForm({ existing, onCreate, onUpdate, onDone, onCancel }: Readonly<EventFormProps>) {
  const isEdit = !!existing

  const [position, setPosition] = useState<LatLngTuple | null>(
    existing?.latitude != null && existing.longitude != null
      ? [existing.latitude, existing.longitude]
      : null,
  )
  const [cover, setCover] = useState<PendingEventCover | null>(null)
  const [coverRemoved, setCoverRemoved] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: existing?.title ?? '',
      description: existing?.description ?? '',
      category: existing?.category ?? 'OTHER',
      startDatetime: toDateTimeLocalValue(existing?.startDatetime),
      endDatetime: toDateTimeLocalValue(existing?.endDatetime),
      online: existing?.online ?? false,
      onlineUrl: existing?.onlineUrl ?? '',
      venueName: existing?.venueName ?? '',
      latitude: existing?.latitude?.toString() ?? '',
      longitude: existing?.longitude?.toString() ?? '',
      registrationMode: existing?.registrationMode ?? 'INTERNAL',
      externalRegistrationUrl: existing?.externalRegistrationUrl ?? '',
      maxCapacity: existing?.maxCapacity?.toString() ?? '',
    },
  })

  // useWatch rather than watch — the React Compiler is enabled, and `watch` subscribes the whole
  // component to every keystroke. Hoisted out of JSX so the hook order stays obvious.
  const online = useWatch({ control, name: 'online' })
  const onlineUrl = useWatch({ control, name: 'onlineUrl' }) ?? ''
  const venueName = useWatch({ control, name: 'venueName' }) ?? ''
  const registrationMode = useWatch({ control, name: 'registrationMode' })

  // The pin control owns the coordinates, but the schema validates the form values, so the two are
  // mirrored back into RHF whenever the pin moves.
  useEffect(() => {
    setValue('latitude', position ? String(position[0]) : '')
    setValue('longitude', position ? String(position[1]) : '')
  }, [position, setValue])

  // Switching to Online clears whatever pin was dropped, so the two states never both hold data.
  // Handled in the toggle's own event handler rather than an effect reacting to `online`, which
  // would call setState synchronously inside the effect body.
  function handleOnlineChange(value: boolean) {
    setValue('online', value)
    if (value) setPosition(null)
  }

  // Blob URLs are process-global; without this an abandoned draft leaks its preview.
  useEffect(() => {
    return () => {
      if (cover) URL.revokeObjectURL(cover.previewUrl)
    }
    // Cleanup only — re-running on every staged file would revoke a URL still on screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: EventFormData) {
    setIsUploading(true)
    try {
      // The upload happens here rather than at file-select, because a presigned PUT URL expires
      // after about five minutes and filling in this form routinely takes longer.
      const coverImageKey = cover ? (await eventMediaApi.upload(cover.file)).mediaKey : undefined

      const event =
        isEdit && onUpdate
          ? await onUpdate(buildUpdateBody(values, coverImageKey))
          : await onCreate!(buildCreateBody(values, coverImageKey))

      onDone(event)
    } catch (err) {
      // The mutation hooks already toast the API error; this only covers an upload that failed
      // before any request was made, which would otherwise fail silently.
      if (err instanceof Error && err.message.toLowerCase().includes('upload')) {
        toast.error("The cover image upload didn't go through. Please try again.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  function buildCreateBody(values: EventFormData, coverImageKey: string | undefined): CreateEventRequest {
    return {
      title: values.title.trim(),
      description: trimmed(values.description),
      category: values.category,
      startDatetime: fromDateTimeLocalValue(values.startDatetime)!,
      endDatetime: fromDateTimeLocalValue(values.endDatetime)!,
      coverImageKey,
      online: values.online,
      onlineUrl: values.online ? trimmed(values.onlineUrl) : undefined,
      venueName: values.online ? undefined : trimmed(values.venueName),
      latitude: values.online || !position ? undefined : roundCoordinate(position[0]),
      longitude: values.online || !position ? undefined : roundCoordinate(position[1]),
      registrationMode: values.registrationMode,
      externalRegistrationUrl:
        values.registrationMode === 'EXTERNAL' ? trimmed(values.externalRegistrationUrl) : undefined,
      maxCapacity:
        values.registrationMode === 'EXTERNAL' || !values.maxCapacity?.trim()
          ? undefined
          : Number(values.maxCapacity),
    }
  }

  function buildUpdateBody(values: EventFormData, coverImageKey: string | undefined): UpdateEventRequest {
    const hadLocation = existing?.latitude != null
    const hadCapacity = existing?.maxCapacity != null

    return {
      title: values.title.trim(),
      description: values.description?.trim() ?? '',
      category: values.category,
      startDatetime: fromDateTimeLocalValue(values.startDatetime),
      endDatetime: fromDateTimeLocalValue(values.endDatetime),
      coverImageKey: coverImageKey ?? (coverRemoved ? '' : undefined),
      online: values.online,
      onlineUrl: values.online ? (values.onlineUrl?.trim() ?? '') : '',
      venueName: values.online ? '' : (values.venueName?.trim() ?? ''),
      latitude: values.online || !position ? undefined : roundCoordinate(position[0]),
      longitude: values.online || !position ? undefined : roundCoordinate(position[1]),
      clearLocation: values.online && hadLocation ? true : undefined,
      registrationMode: values.registrationMode,
      externalRegistrationUrl:
        values.registrationMode === 'EXTERNAL' ? (values.externalRegistrationUrl?.trim() ?? '') : '',
      maxCapacity:
        values.registrationMode === 'EXTERNAL' || !values.maxCapacity?.trim()
          ? undefined
          : Number(values.maxCapacity),
      clearMaxCapacity:
        values.registrationMode === 'EXTERNAL' && hadCapacity ? true : undefined,
    }
  }

  const busy = isSubmitting || isUploading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="event-title" className={LABEL_CLASS}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="event-title"
            type="text"
            maxLength={EVENT_TITLE_MAX}
            placeholder="Freshers' Welcome Night"
            className={inputClass(!!errors.title)}
            {...register('title')}
          />
          {errors.title && <p className={ERROR_CLASS}>{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="event-category" className={LABEL_CLASS}>
            Category
          </label>
          <select id="event-category" className={inputClass()} {...register('category')}>
            {CATEGORY_ORDER.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABEL[category]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="event-description" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="event-description"
          rows={4}
          maxLength={EVENT_DESCRIPTION_MAX}
          placeholder="What to expect, who it's for, anything attendees should bring."
          className={inputClass(!!errors.description)}
          {...register('description')}
        />
        {errors.description && <p className={ERROR_CLASS}>{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event-start" className={LABEL_CLASS}>
            Starts <span className="text-red-500">*</span>
          </label>
          <input
            id="event-start"
            type="datetime-local"
            min={isEdit ? undefined : nowDateTimeLocalValue()}
            className={inputClass(!!errors.startDatetime)}
            {...register('startDatetime')}
          />
          {errors.startDatetime && <p className={ERROR_CLASS}>{errors.startDatetime.message}</p>}
        </div>
        <div>
          <label htmlFor="event-end" className={LABEL_CLASS}>
            Ends <span className="text-red-500">*</span>
          </label>
          <input
            id="event-end"
            type="datetime-local"
            className={inputClass(!!errors.endDatetime)}
            {...register('endDatetime')}
          />
          {errors.endDatetime && <p className={ERROR_CLASS}>{errors.endDatetime.message}</p>}
        </div>
      </div>

      <EventCoverPicker
        existingUrl={existing?.coverImageUrl ?? null}
        pending={cover}
        onPick={setCover}
        removed={coverRemoved}
        onRemove={() => setCoverRemoved(true)}
      />

      <EventLocationField
        online={online}
        onOnlineChange={handleOnlineChange}
        onlineUrl={onlineUrl}
        onOnlineUrlChange={(value) => setValue('onlineUrl', value)}
        venueName={venueName}
        onVenueNameChange={(value) => setValue('venueName', value)}
        position={position}
        onPositionChange={setPosition}
        onlineUrlError={errors.onlineUrl?.message}
        venueNameError={errors.venueName?.message}
        coordinateError={errors.latitude?.message}
      />

      <fieldset className="space-y-3 rounded-2xl border border-gray-200 p-4 dark:border-[#2D1F4D]">
        <legend className="px-1.5 text-sm font-semibold text-gray-900 dark:text-white">
          How do people register?
        </legend>

        <div className="grid grid-cols-2 gap-2">
          <label
            className={[
              'relative flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
              registrationMode === 'INTERNAL'
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] dark:text-gray-400',
            ].join(' ')}
          >
            <input type="radio" value="INTERNAL" {...register('registrationMode')} className="sr-only" />
            In-app registration
          </label>
          <label
            className={[
              'relative flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
              registrationMode === 'EXTERNAL'
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] dark:text-gray-400',
            ].join(' ')}
          >
            <input type="radio" value="EXTERNAL" {...register('registrationMode')} className="sr-only" />
            External link
          </label>
        </div>

        {registrationMode === 'EXTERNAL' ? (
          <div>
            <label htmlFor="event-external-url" className={LABEL_CLASS}>
              Registration link <span className="text-red-500">*</span>
            </label>
            <input
              id="event-external-url"
              type="text"
              placeholder="https://forms.example.com/…"
              className={inputClass(!!errors.externalRegistrationUrl)}
              {...register('externalRegistrationUrl')}
            />
            {errors.externalRegistrationUrl && (
              <p className={ERROR_CLASS}>{errors.externalRegistrationUrl.message}</p>
            )}
            {!errors.externalRegistrationUrl && (
              <p className={HINT_CLASS}>
                Attendees are sent here instead — seats and a waitlist aren&apos;t tracked in-app.
              </p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="event-capacity" className={LABEL_CLASS}>
              Capacity
            </label>
            <input
              id="event-capacity"
              type="number"
              min={1}
              placeholder="Leave blank for unlimited"
              className={inputClass(!!errors.maxCapacity)}
              {...register('maxCapacity')}
            />
            {errors.maxCapacity && <p className={ERROR_CLASS}>{errors.maxCapacity.message}</p>}
            {!errors.maxCapacity && (
              <p className={HINT_CLASS}>
                Once full, new registrants are automatically waitlisted and promoted in order as
                seats open up.
              </p>
            )}
          </div>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Create draft'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:text-primary disabled:opacity-50 dark:text-gray-400"
        >
          Cancel
        </button>
        {isUploading && (
          <span className="text-xs text-gray-500 dark:text-gray-400">Uploading cover image…</span>
        )}
        {!isEdit && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Saved as a draft — publish it from the event page when you&apos;re ready.
          </span>
        )}
      </div>
    </form>
  )
}
