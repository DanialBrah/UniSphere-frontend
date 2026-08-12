import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { LostFoundLocationField } from './LostFoundLocationField'
import { LostFoundMediaPicker } from './LostFoundMediaPicker'
import { LostFoundPhotoPicker } from './LostFoundPhotoPicker'
import { lostFoundMediaApi } from '../api/lostFoundMediaApi'
import { lostFoundItemSchema, LF_DESCRIPTION_MAX, LF_TITLE_MAX } from '../schemas'
import type { LostFoundItemFormData } from '../schemas'
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  INCIDENT_PLACE_LABEL,
  OCCURRED_AT_LABEL,
  PICKUP_PLACE_LABEL,
  TYPE_ORDER,
} from '../utils/display'
import { ERROR_CLASS, HINT_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import { fromDateTimeLocalValue, maxDateTimeLocalValue, toDateTimeLocalValue } from '../utils/dateUtils'
import { roundCoordinate } from '../utils/geo'
import type { LatLngTuple } from '../../../lib/mapConfig'
import type {
  CreateLostFoundItemRequest,
  LostFoundItemResponse,
  LostFoundMediaItem,
  PendingLostFoundMedia,
  UpdateLostFoundItemRequest,
} from '../types'

interface LostFoundReportFormProps {
  /** Present in edit mode. Item type is fixed after creation — the server has no field for it. */
  existing?: LostFoundItemResponse
  onCreate?: (body: CreateLostFoundItemRequest) => Promise<LostFoundItemResponse>
  onUpdate?: (body: UpdateLostFoundItemRequest) => Promise<LostFoundItemResponse>
  onDone: (item: LostFoundItemResponse) => void
  onCancel: () => void
}

/** A blank string clears a nullable text field server-side; `undefined` leaves it untouched. */
const trimmed = (value: string | undefined): string | undefined => value?.trim() || undefined

export function LostFoundReportForm({
  existing,
  onCreate,
  onUpdate,
  onDone,
  onCancel,
}: Readonly<LostFoundReportFormProps>) {
  const isEdit = !!existing

  const [incidentPosition, setIncidentPosition] = useState<LatLngTuple | null>(
    existing?.incidentLatitude != null && existing.incidentLongitude != null
      ? [existing.incidentLatitude, existing.incidentLongitude]
      : null,
  )
  const [pickupPosition, setPickupPosition] = useState<LatLngTuple | null>(
    existing?.pickupLatitude != null && existing.pickupLongitude != null
      ? [existing.pickupLatitude, existing.pickupLongitude]
      : null,
  )

  const [primaryPhoto, setPrimaryPhoto] = useState<PendingLostFoundMedia | null>(null)
  const [primaryRemoved, setPrimaryRemoved] = useState(false)
  const [pendingMedia, setPendingMedia] = useState<PendingLostFoundMedia[]>([])
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LostFoundItemFormData>({
    resolver: zodResolver(lostFoundItemSchema),
    defaultValues: {
      itemType: existing?.itemType ?? 'LOST',
      category: existing?.category ?? 'OTHER',
      title: existing?.title ?? '',
      description: existing?.description ?? '',
      identifyingDetail: existing?.identifyingDetail ?? '',
      incidentPlace: existing?.incidentPlace ?? '',
      incidentLatitude: existing?.incidentLatitude?.toString() ?? '',
      incidentLongitude: existing?.incidentLongitude?.toString() ?? '',
      pickupPlace: existing?.pickupPlace ?? '',
      pickupLatitude: existing?.pickupLatitude?.toString() ?? '',
      pickupLongitude: existing?.pickupLongitude?.toString() ?? '',
      pickupInstructions: existing?.pickupInstructions ?? '',
      occurredAt: toDateTimeLocalValue(existing?.occurredAt) || maxDateTimeLocalValue(),
    },
  })

  // useWatch rather than watch — the React Compiler is enabled, and `watch` subscribes the whole
  // component to every keystroke. Hoisted out of JSX so the hook order stays obvious.
  const itemType = useWatch({ control, name: 'itemType' })
  const incidentPlace = useWatch({ control, name: 'incidentPlace' }) ?? ''
  const pickupPlace = useWatch({ control, name: 'pickupPlace' }) ?? ''

  // The pin controls own the coordinates, but the schema validates the form values, so the two are
  // mirrored back into RHF whenever a pin moves. That's what makes the "both or neither" and
  // "FOUND needs a pickup location" rules fire on the actual submitted state.
  useEffect(() => {
    setValue('incidentLatitude', incidentPosition ? String(incidentPosition[0]) : '')
    setValue('incidentLongitude', incidentPosition ? String(incidentPosition[1]) : '')
  }, [incidentPosition, setValue])

  useEffect(() => {
    setValue('pickupLatitude', pickupPosition ? String(pickupPosition[0]) : '')
    setValue('pickupLongitude', pickupPosition ? String(pickupPosition[1]) : '')
  }, [pickupPosition, setValue])

  // Blob URLs are process-global; without this every abandoned draft leaks its previews.
  useEffect(() => {
    return () => {
      if (primaryPhoto) URL.revokeObjectURL(primaryPhoto.previewUrl)
      pendingMedia.forEach((media) => URL.revokeObjectURL(media.previewUrl))
    }
    // Cleanup only — re-running on every staged file would revoke URLs still on screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: LostFoundItemFormData) {
    setIsUploading(true)
    try {
      // Uploads happen here rather than at file-select because a presigned PUT URL expires after
      // five minutes and filling in this form routinely takes longer.
      const primaryImageKey = primaryPhoto
        ? (await lostFoundMediaApi.upload(primaryPhoto.file)).mediaKey
        : undefined

      const uploaded = await Promise.all(
        pendingMedia.map((media) => lostFoundMediaApi.upload(media.file)),
      )
      const newMedia: LostFoundMediaItem[] = uploaded.map(({ mediaKey, mediaType }) => ({
        mediaKey,
        mediaType: mediaType.startsWith('video/') ? 'VIDEO' : 'IMAGE',
      }))

      const item =
        isEdit && onUpdate
          ? await onUpdate(buildUpdateBody(values, primaryImageKey, newMedia))
          : await onCreate!(buildCreateBody(values, primaryImageKey, newMedia))

      onDone(item)
    } catch (err) {
      // The mutation hooks already toast the API error; this only covers an upload that failed
      // before any request was made, which would otherwise fail silently.
      if (err instanceof Error && err.message.toLowerCase().includes('upload')) {
        toast.error("The photo upload didn't go through. Please try again.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  function buildCreateBody(
    values: LostFoundItemFormData,
    primaryImageKey: string | undefined,
    media: LostFoundMediaItem[],
  ): CreateLostFoundItemRequest {
    return {
      itemType: values.itemType,
      category: values.category,
      title: values.title.trim(),
      description: trimmed(values.description),
      identifyingDetail: trimmed(values.identifyingDetail),
      primaryImageKey,
      incidentPlace: trimmed(values.incidentPlace),
      incidentLatitude: incidentPosition ? roundCoordinate(incidentPosition[0]) : undefined,
      incidentLongitude: incidentPosition ? roundCoordinate(incidentPosition[1]) : undefined,
      pickupPlace: trimmed(values.pickupPlace),
      pickupLatitude: pickupPosition ? roundCoordinate(pickupPosition[0]) : undefined,
      pickupLongitude: pickupPosition ? roundCoordinate(pickupPosition[1]) : undefined,
      pickupInstructions: trimmed(values.pickupInstructions),
      occurredAt: fromDateTimeLocalValue(values.occurredAt),
      media: media.length > 0 ? media : undefined,
    }
  }

  function buildUpdateBody(
    values: LostFoundItemFormData,
    primaryImageKey: string | undefined,
    media: LostFoundMediaItem[],
  ): UpdateLostFoundItemRequest {
    // A coordinate can't be "blank", so clearing one needs an explicit flag rather than an empty
    // value — that's what clearIncidentLocation / clearPickupLocation are for.
    const hadIncident = existing?.incidentLatitude != null
    const hadPickup = existing?.pickupLatitude != null

    return {
      category: values.category,
      title: values.title.trim(),
      description: values.description?.trim() ?? '',
      identifyingDetail: values.identifyingDetail?.trim() ?? '',
      primaryImageKey: primaryImageKey ?? (primaryRemoved ? '' : undefined),
      incidentPlace: values.incidentPlace?.trim() ?? '',
      incidentLatitude: incidentPosition ? roundCoordinate(incidentPosition[0]) : undefined,
      incidentLongitude: incidentPosition ? roundCoordinate(incidentPosition[1]) : undefined,
      clearIncidentLocation: hadIncident && !incidentPosition ? true : undefined,
      pickupPlace: values.pickupPlace?.trim() ?? '',
      pickupLatitude: pickupPosition ? roundCoordinate(pickupPosition[0]) : undefined,
      pickupLongitude: pickupPosition ? roundCoordinate(pickupPosition[1]) : undefined,
      clearPickupLocation: hadPickup && !pickupPosition ? true : undefined,
      pickupInstructions: values.pickupInstructions?.trim() ?? '',
      occurredAt: fromDateTimeLocalValue(values.occurredAt),
      removeMediaIds: removedMediaIds.length > 0 ? removedMediaIds : undefined,
      addMedia: media.length > 0 ? media : undefined,
    }
  }

  const busy = isSubmitting || isUploading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <span className={LABEL_CLASS}>What happened?</span>
        <div className="grid grid-cols-2 gap-2">
          {TYPE_ORDER.map((type) => (
            <label
              key={type}
              className={[
                'flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
                itemType === type
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] dark:text-gray-400',
                // The server has no field to change an item's type after creation.
                isEdit ? 'pointer-events-none opacity-60' : '',
              ].join(' ')}
            >
              <input type="radio" value={type} {...register('itemType')} className="sr-only" />
              I {type === 'LOST' ? 'lost' : 'found'} something
            </label>
          ))}
        </div>
        {isEdit && (
          <p className={HINT_CLASS}>
            An item&apos;s type can&apos;t change after it&apos;s reported. Delete and re-report if
            you picked the wrong one.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lf-title" className={LABEL_CLASS}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="lf-title"
            type="text"
            maxLength={LF_TITLE_MAX}
            placeholder="Black Anker power bank"
            className={inputClass(!!errors.title)}
            {...register('title')}
          />
          {errors.title && <p className={ERROR_CLASS}>{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="lf-category" className={LABEL_CLASS}>
            Category
          </label>
          <select id="lf-category" className={inputClass()} {...register('category')}>
            {CATEGORY_ORDER.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABEL[category]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="lf-description" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="lf-description"
          rows={4}
          maxLength={LF_DESCRIPTION_MAX}
          placeholder="Colour, brand, size, anything that helps someone recognise it."
          className={inputClass(!!errors.description)}
          {...register('description')}
        />
        {errors.description && <p className={ERROR_CLASS}>{errors.description.message}</p>}
      </div>

      {/*
        Only ever shown to the reporter and admins, at every claim status — it is the question a
        genuine owner can answer and a chancer cannot. Saying so is what stops people putting it in
        the public description instead.
      */}
      <div>
        <label htmlFor="lf-identifying" className={LABEL_CLASS}>
          Private identifying detail
        </label>
        <input
          id="lf-identifying"
          type="text"
          placeholder="A scratch on the back, a sticker, the lock-screen photo…"
          className={inputClass(!!errors.identifyingDetail)}
          {...register('identifyingDetail')}
        />
        <p className={HINT_CLASS}>
          Only you can see this. Use it to check whether a claimant really owns the item — never
          put it in the description.
        </p>
        {errors.identifyingDetail && (
          <p className={ERROR_CLASS}>{errors.identifyingDetail.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="lf-occurred" className={LABEL_CLASS}>
          {OCCURRED_AT_LABEL[itemType]} <span className="text-red-500">*</span>
        </label>
        <input
          id="lf-occurred"
          type="datetime-local"
          max={maxDateTimeLocalValue()}
          className={inputClass(!!errors.occurredAt)}
          {...register('occurredAt')}
        />
        {errors.occurredAt && <p className={ERROR_CLASS}>{errors.occurredAt.message}</p>}
      </div>

      <LostFoundPhotoPicker
        label="Main photo"
        hint="A photo is the single biggest thing that gets an item recognised."
        existingUrl={existing?.primaryImageUrl ?? null}
        pending={primaryPhoto}
        onPick={setPrimaryPhoto}
        removed={primaryRemoved}
        onRemove={() => setPrimaryRemoved(true)}
      />

      <LostFoundMediaPicker
        existing={existing?.media ?? []}
        removedIds={removedMediaIds}
        onRemoveExisting={(id) => setRemovedMediaIds((prev) => [...prev, id])}
        pending={pendingMedia}
        onPendingChange={setPendingMedia}
      />

      <LostFoundLocationField
        label={INCIDENT_PLACE_LABEL[itemType]}
        placeholder="Main library, level 2"
        place={incidentPlace}
        onPlaceChange={(value) => setValue('incidentPlace', value)}
        position={incidentPosition}
        onPositionChange={setIncidentPosition}
        placeError={errors.incidentPlace?.message}
        coordinateError={errors.incidentLatitude?.message}
      />

      <LostFoundLocationField
        label={PICKUP_PLACE_LABEL[itemType]}
        placeholder="Security office, Block A"
        hint={
          itemType === 'FOUND'
            ? 'Required — the owner needs to know where to collect it.'
            : 'Optional — where a finder can return it to you.'
        }
        place={pickupPlace}
        onPlaceChange={(value) => setValue('pickupPlace', value)}
        position={pickupPosition}
        onPositionChange={setPickupPosition}
        placeError={errors.pickupPlace?.message}
        coordinateError={errors.pickupLatitude?.message}
        required={itemType === 'FOUND'}
      />

      <div>
        <label htmlFor="lf-pickup-instructions" className={LABEL_CLASS}>
          Collection instructions
        </label>
        <textarea
          id="lf-pickup-instructions"
          rows={2}
          placeholder="Ask for it at the counter, weekdays 9–5. Bring your student ID."
          className={inputClass(!!errors.pickupInstructions)}
          {...register('pickupInstructions')}
        />
        {itemType === 'FOUND' && (
          <p className={HINT_CLASS}>
            Hidden from everyone until you approve a claim, so it&apos;s safe to be specific.
          </p>
        )}
        {errors.pickupInstructions && (
          <p className={ERROR_CLASS}>{errors.pickupInstructions.message}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Publish report'}
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
          <span className="text-xs text-gray-500 dark:text-gray-400">Uploading photos…</span>
        )}
      </div>
    </form>
  )
}
