import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { ServiceCategoryField } from './ServiceCategoryField'
import { ServicePortfolioImagePicker } from './ServicePortfolioImagePicker'
import { serviceMediaApi } from '../api/serviceMediaApi'
import { serviceErrorMessage } from '../utils/serviceErrors'
import {
  serviceListingFormSchema,
  SERVICE_DESCRIPTION_MAX,
  SERVICE_TITLE_MAX,
} from '../schemas'
import type { ServiceListingFormData } from '../schemas'
import { DELIVERY_MODE_LABEL, DELIVERY_MODE_ORDER, PRICING_TYPE_LABEL, PRICING_TYPE_ORDER } from '../utils/display'
import { ERROR_CLASS, HINT_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import { toast } from 'sonner'
import type { CreateServiceListingRequest, PendingServiceImage, ServiceListingResponse, UpdateServiceListingRequest } from '../types'

interface ServiceFormProps {
  /** Present in edit mode. */
  existing?: ServiceListingResponse
  onCreate?: (body: CreateServiceListingRequest) => Promise<ServiceListingResponse>
  onUpdate?: (body: UpdateServiceListingRequest) => Promise<ServiceListingResponse>
  onDone: (listing: ServiceListingResponse) => void
  onCancel: () => void
}

/** A blank string clears a nullable text field server-side; `undefined` leaves it untouched. */
const trimmed = (value: string | undefined): string | undefined => value?.trim() || undefined

export function ServiceForm({ existing, onCreate, onUpdate, onDone, onCancel }: Readonly<ServiceFormProps>) {
  const isEdit = !!existing
  const [pendingImage, setPendingImage] = useState<PendingServiceImage | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceListingFormData>({
    resolver: zodResolver(serviceListingFormSchema),
    defaultValues: {
      title: existing?.title ?? '',
      description: existing?.description ?? '',
      category: existing?.category ?? '',
      pricingType: existing?.pricingType ?? 'FIXED',
      price: existing?.price?.toString() ?? '',
      deliveryMode: existing?.deliveryMode ?? 'BOTH',
    },
  })

  // useWatch rather than watch — the React Compiler is enabled, and `watch` subscribes the whole
  // component to every keystroke. Hoisted out of JSX so the hook order stays obvious.
  const pricingType = useWatch({ control, name: 'pricingType' })
  const category = useWatch({ control, name: 'category' }) ?? ''
  const deliveryMode = useWatch({ control, name: 'deliveryMode' })

  // Switching to Negotiable clears whatever price was entered, so the two states never both hold data.
  function handlePricingTypeChange(value: (typeof PRICING_TYPE_ORDER)[number]) {
    setValue('pricingType', value)
    if (value === 'NEGOTIABLE') setValue('price', '')
  }

  async function onSubmit(values: ServiceListingFormData) {
    try {
      let portfolioImageKey: string | undefined
      if (pendingImage) {
        setUploading(true)
        try {
          const { mediaKey } = await serviceMediaApi.upload(pendingImage.file)
          portfolioImageKey = mediaKey
        } catch (err) {
          toast.error(serviceErrorMessage(err))
          return
        } finally {
          setUploading(false)
        }
      }

      const listing =
        isEdit && onUpdate
          ? await onUpdate(buildUpdateBody(values, existing, portfolioImageKey))
          : await onCreate!(buildCreateBody(values, portfolioImageKey))
      if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl)
      onDone(listing)
    } catch {
      // The mutation hooks already toast the API error — nothing else to do here.
    }
  }

  function buildCreateBody(values: ServiceListingFormData, portfolioImageKey?: string): CreateServiceListingRequest {
    return {
      title: values.title.trim(),
      description: trimmed(values.description),
      category: values.category.trim(),
      pricingType: values.pricingType,
      price: values.pricingType === 'NEGOTIABLE' ? undefined : Number(values.price),
      deliveryMode: values.deliveryMode,
      portfolioImageKey,
    }
  }

  function buildUpdateBody(
    values: ServiceListingFormData,
    existing: ServiceListingResponse | undefined,
    portfolioImageKey?: string,
  ): UpdateServiceListingRequest {
    const price = values.pricingType === 'NEGOTIABLE' ? undefined : Number(values.price)
    const hadPrice = existing?.price != null
    const hadImage = existing?.portfolioImageUrl != null

    return {
      title: values.title.trim(),
      description: values.description?.trim() ?? '',
      category: values.category.trim(),
      pricingType: values.pricingType,
      price,
      clearPrice: price == null && hadPrice ? true : undefined,
      deliveryMode: values.deliveryMode,
      portfolioImageKey,
      clearPortfolioImageKey: !portfolioImageKey && imageRemoved && hadImage ? true : undefined,
    }
  }

  const busy = isSubmitting || uploading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="service-title" className={LABEL_CLASS}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="service-title"
          type="text"
          maxLength={SERVICE_TITLE_MAX}
          placeholder="Calculus & Statistics Tutoring"
          className={inputClass(!!errors.title)}
          {...register('title')}
        />
        {errors.title && <p className={ERROR_CLASS}>{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="service-description" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="service-description"
          rows={4}
          maxLength={SERVICE_DESCRIPTION_MAX}
          placeholder="What you offer, your experience, how sessions or deliverables work."
          className={inputClass(!!errors.description)}
          {...register('description')}
        />
        {errors.description && <p className={ERROR_CLASS}>{errors.description.message}</p>}
      </div>

      <ServiceCategoryField value={category} onChange={(value) => setValue('category', value)} error={errors.category?.message} />

      <fieldset className="space-y-3 rounded-2xl border border-gray-200 p-4 dark:border-[#2D1F4D]">
        <legend className="px-1.5 text-sm font-semibold text-gray-900 dark:text-white">Pricing</legend>

        <div className="grid grid-cols-3 gap-2">
          {PRICING_TYPE_ORDER.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handlePricingTypeChange(type)}
              className={[
                'flex items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors',
                pricingType === type
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] dark:text-gray-400',
              ].join(' ')}
            >
              {PRICING_TYPE_LABEL[type]}
            </button>
          ))}
        </div>

        {pricingType === 'NEGOTIABLE' ? (
          <p className={HINT_CLASS}>No fixed price — you and the client agree a figure over messages.</p>
        ) : (
          <div>
            <label htmlFor="service-price" className={LABEL_CLASS}>
              {pricingType === 'HOURLY' ? 'Rate per hour' : 'Price'} <span className="text-red-500">*</span>
            </label>
            <input
              id="service-price"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              className={inputClass(!!errors.price)}
              {...register('price')}
            />
            {errors.price && <p className={ERROR_CLASS}>{errors.price.message}</p>}
          </div>
        )}
      </fieldset>

      <div>
        <span className={LABEL_CLASS}>Delivery</span>
        <div className="grid grid-cols-3 gap-2">
          {DELIVERY_MODE_ORDER.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setValue('deliveryMode', mode)}
              className={[
                'flex items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors',
                deliveryMode === mode
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] dark:text-gray-400',
              ].join(' ')}
            >
              {DELIVERY_MODE_LABEL[mode]}
            </button>
          ))}
        </div>
      </div>

      <ServicePortfolioImagePicker
        existingUrl={existing?.portfolioImageUrl ?? null}
        pending={pendingImage}
        onPick={setPendingImage}
        removed={imageRemoved}
        onRemove={() => setImageRemoved(true)}
      />

      <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Publish listing'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:text-primary disabled:opacity-50 dark:text-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
