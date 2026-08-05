import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, Loader2, PenLine, Save, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { useGoBack } from '../hooks/useGoBack'
import { MarkdownContent } from './MarkdownContent'
import { MarkdownToolbar } from './MarkdownToolbar'
import { NewsCategorySelect } from './NewsCategorySelect'
import { NewsCoverImagePicker } from './NewsCoverImagePicker'
import { NewsMediaPicker } from './NewsMediaPicker'
import { NewsSchedulePicker } from './NewsSchedulePicker'
import { NewsStatusBar } from './NewsStatusBar'
import { NewsTagInput } from './NewsTagInput'
import { NewsVisibilitySelect } from './NewsVisibilitySelect'
import { ConfirmModal } from './ConfirmModal'
import { newsMediaApi } from '../api/newsMediaApi'
import {
  useChangeNewsStatus,
  useCreateNewsArticle,
  useUpdateNewsArticle,
} from '../hooks/useNewsMutations'
import {
  NEWS_CONTENT_MAX,
  NEWS_SUMMARY_MAX,
  NEWS_TITLE_MAX,
  canPublish,
  newsArticleSchema,
  type NewsArticleFormData,
} from '../schemas'
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '../utils/dateUtils'
import { newsErrorMessage } from '../utils/newsErrors'
import { inputClass } from '../../social/utils/formUtils'
import type {
  NewsArticleResponse,
  NewsMediaItem,
  NewsMediaResponse,
  PendingNewsMedia,
} from '../types'

type EditorTab = 'write' | 'preview'
type SaveIntent = 'draft' | 'publish'

interface Props {
  /** null when composing a new article. */
  article: NewsArticleResponse | null
}

/**
 * Mounted with a `key` derived from the article id, so every piece of state below can be
 * initialised straight from props. That's deliberate: seeding a form from fetched data inside
 * an effect means a render with empty values first, and a whole class of stale-state bugs when
 * the query refetches. Here there is simply nothing to sync.
 */
export function NewsEditorForm({ article }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = article != null
  const articleId = article?.id ?? 0

  const goBack = useGoBack(isEdit ? `/news/${articleId}` : '/news')

  // Set by the article page's Edit affordances. When it's present the entry directly behind us
  // is that article, so a save can step back onto it instead of pushing a duplicate.
  const cameFromArticle = (location.state as { fromArticle?: boolean } | null)?.fromArticle === true

  const createArticle = useCreateNewsArticle()
  const updateArticle = useUpdateNewsArticle(articleId)
  const changeStatus = useChangeNewsStatus(articleId)

  const [tab, setTab] = useState<EditorTab>('write')
  const [tags, setTags] = useState<string[]>(article?.tags ?? [])
  const [cover, setCover] = useState<PendingNewsMedia | null>(null)
  const [coverRemoved, setCoverRemoved] = useState(false)
  const [pendingMedia, setPendingMedia] = useState<PendingNewsMedia[]>([])
  const [removeMediaIds, setRemoveMediaIds] = useState<number[]>([])
  const [schedule, setSchedule] = useState(() => toDateTimeLocalValue(article?.scheduledAt))
  const [isUploading, setIsUploading] = useState(false)
  // Cover, media, tags and schedule live outside react-hook-form, so isDirty can't see them.
  const [sideloadDirty, setSideloadDirty] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  /*
   * The leave-guard reads its inputs from a ref rather than closing over state.
   *
   * useBlocker's function form runs at navigation time, which matters here: saving sets the
   * form pristine and calls navigate() in the same handler, and a boolean blocker would still
   * be holding the pre-save value at that moment and prompt on the way out.
   */
  const guard = useRef({ dirty: false, isSaving: false, bypass: false })

  // Staged blob URLs, so they can be released if the editor unmounts before a save.
  const staged = useRef<{ cover: PendingNewsMedia | null; media: PendingNewsMedia[] }>({
    cover: null,
    media: [],
  })

  useEffect(() => {
    staged.current = { cover, media: pendingMedia }
  }, [cover, pendingMedia])

  useEffect(() => {
    const current = staged
    return () => {
      if (current.current.cover) URL.revokeObjectURL(current.current.cover.previewUrl)
      current.current.media.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<NewsArticleFormData>({
    resolver: zodResolver(newsArticleSchema),
    defaultValues: {
      title: article?.title ?? '',
      summary: article?.summary ?? '',
      content: article?.content ?? '',
      category: article?.category ?? 'GENERAL',
      visibility: article?.visibility ?? 'PUBLIC',
    },
  })

  const { ref: contentFormRef, ...contentField } = register('content')

  // useWatch rather than the destructured watch(): it subscribes per-field instead of
  // re-rendering on every change, and it doesn't defeat the React Compiler's memoization.
  const title = useWatch({ control, name: 'title' })
  const summary = useWatch({ control, name: 'summary' }) ?? ''
  const content = useWatch({ control, name: 'content' }) ?? ''
  const category = useWatch({ control, name: 'category' })
  const visibility = useWatch({ control, name: 'visibility' })

  // Re-parsing 100k characters on every keystroke is the one real performance cliff here.
  const debouncedContent = useDebouncedValue(content, 250)

  const dirty = isDirty || sideloadDirty
  const isSaving =
    isUploading || createArticle.isPending || updateArticle.isPending || changeStatus.isPending

  useEffect(() => {
    guard.current.dirty = dirty
    guard.current.isSaving = isSaving
  }, [dirty, isSaving])

  // The data router intercepts in-app navigation; beforeunload covers reloads and tab closes.
  const blocker = useBlocker(
    useCallback(() => {
      const { dirty: isDirtyNow, isSaving: saving, bypass } = guard.current
      return isDirtyNow && !saving && !bypass
    }, []),
  )

  useEffect(() => {
    if (!dirty || isSaving) return
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty, isSaving])

  const status = article?.status ?? 'DRAFT'
  const publishable = canPublish({ title, content })
  const remainingMedia: NewsMediaResponse[] = (article?.media ?? []).filter(
    (m) => !removeMediaIds.includes(m.id),
  )

  /**
   * Uploads run here rather than at file-select because a presigned PUT URL is valid for only
   * five minutes — far shorter than it takes to write an article.
   */
  async function uploadPending(): Promise<{
    coverImageKey?: string
    media: NewsMediaItem[]
  } | null> {
    if (!cover && pendingMedia.length === 0) {
      return { coverImageKey: undefined, media: [] }
    }

    setIsUploading(true)
    try {
      const [uploadedCover, media] = await Promise.all([
        cover ? newsMediaApi.upload(cover.file) : Promise.resolve(null),
        Promise.all(pendingMedia.map((item) => newsMediaApi.upload(item.file))),
      ])
      return { coverImageKey: uploadedCover?.mediaKey, media }
    } catch (err) {
      toast.error(newsErrorMessage(err))
      return null
    } finally {
      setIsUploading(false)
    }
  }

  /** Drops every staged blob URL once its file has been uploaded and accepted. */
  function releaseStagedPreviews() {
    if (cover) URL.revokeObjectURL(cover.previewUrl)
    pendingMedia.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setCover(null)
    setPendingMedia([])
  }

  async function onSubmit(data: NewsArticleFormData, intent: SaveIntent) {
    if (intent === 'publish' && !publishable) {
      toast.error('Add a title and some content before publishing.')
      return
    }

    const uploaded = await uploadPending()
    if (!uploaded) return

    const scheduledAt = fromDateTimeLocalValue(schedule)

    if (!article) {
      const created = await createArticle.mutateAsync({
        title: data.title,
        summary: data.summary || undefined,
        content: data.content || undefined,
        category: data.category,
        visibility: data.visibility,
        status: intent === 'publish' ? 'PUBLISHED' : 'DRAFT',
        // A scheduledAt is meaningless on something being published immediately.
        scheduledAt: intent === 'draft' ? scheduledAt : undefined,
        coverImageKey: uploaded.coverImageKey,
        tags,
        media: uploaded.media.length > 0 ? uploaded.media : undefined,
      })

      // Mark everything pristine before navigating, or the blocker prompts on the way out.
      reset(data)
      setSideloadDirty(false)
      releaseStagedPreviews()
      guard.current.bypass = true
      // Land on the article's own editor URL so a second Save updates rather than duplicating.
      navigate(intent === 'publish' ? `/news/${created.id}` : `/news/editor/${created.id}`, {
        replace: true,
      })
      return
    }

    // A new key replaces the cover, "" clears it, and omitting the field leaves it alone.
    const coverImageKey = uploaded.coverImageKey ?? (coverRemoved ? '' : undefined)

    await updateArticle.mutateAsync({
      title: data.title,
      summary: data.summary ?? '',
      content: data.content ?? '',
      category: data.category,
      visibility: data.visibility,
      coverImageKey,
      // Replace semantics — always the complete set, never a delta.
      tags,
      removeMediaIds: removeMediaIds.length > 0 ? removeMediaIds : undefined,
      addMedia: uploaded.media.length > 0 ? uploaded.media : undefined,
    })

    // Status lives behind its own endpoint, so publishing an existing draft is a second call.
    if (intent === 'publish' && status !== 'PUBLISHED') {
      await changeStatus.mutateAsync({ status: 'PUBLISHED' })
    } else if (intent === 'draft' && status === 'DRAFT') {
      // DRAFT -> DRAFT is how a schedule is set, changed or cleared.
      await changeStatus.mutateAsync({ status: 'DRAFT', scheduledAt })
    }

    // reset(data) is what actually clears react-hook-form's isDirty. Without it the form stays
    // dirty after a successful save and the leave-guard fires on the way out.
    reset(data)
    setSideloadDirty(false)
    setRemoveMediaIds([])
    releaseStagedPreviews()

    guard.current.bypass = true

    /*
     * Never push here — the editor entry has to leave the history stack, or Back lands the
     * author right back in the form they just saved.
     *
     * Arriving from the article page means that entry is directly behind us, so stepping back
     * onto it keeps the stack clean. From anywhere else (the Studio, a deep link) we replace
     * the editor entry instead, so Back reaches whatever preceded it.
     */
    if (cameFromArticle) {
      navigate(-1)
    } else {
      navigate(`/news/${articleId}`, { replace: true })
    }
  }

  return (
    <>
      <div className="sticky top-0 z-30 bg-white/85 dark:bg-[#0F0A1B]/85 backdrop-blur border-b border-gray-200 dark:border-[#2D1F4D]">
        <div className="max-w-5xl mx-auto w-full px-6 lg:px-8 py-3 flex items-center gap-3">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
            {isSaving ? 'Saving…' : dirty ? 'Unsaved changes' : isEdit ? 'All changes saved' : ''}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              // handleSubmit() is invoked inside the click, not during render — building the
              // handler up front would run onSubmit's ref reads at render time.
              onClick={() => handleSubmit((d) => onSubmit(d, 'draft'))()}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {status === 'PUBLISHED' ? 'Save changes' : 'Save draft'}
            </button>

            {status !== 'PUBLISHED' && (
              <button
                onClick={() => handleSubmit((d) => onSubmit(d, 'publish'))()}
                disabled={isSaving || !publishable}
                title={publishable ? undefined : 'Add a title and some content before publishing'}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                {status === 'ARCHIVED' ? 'Restore' : 'Publish'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {article && <NewsStatusBar article={article} />}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 mt-5">
          <div className="min-w-0">
            <label
              htmlFor="news-title"
              className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
            >
              Title
            </label>
            <input
              {...register('title')}
              id="news-title"
              type="text"
              placeholder="Article title"
              maxLength={NEWS_TITLE_MAX}
              className={`${inputClass(!!errors.title)} text-lg font-semibold mb-1`}
            />
            <div className="flex items-center justify-between mb-4">
              {errors.title ? (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              ) : (
                <span />
              )}
              {title.length > 200 && (
                <span className="text-[11px] text-gray-400">
                  {title.length}/{NEWS_TITLE_MAX}
                </span>
              )}
            </div>

            <label
              htmlFor="news-summary"
              className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
            >
              Summary
            </label>
            <textarea
              {...register('summary')}
              id="news-summary"
              rows={2}
              placeholder="A one- or two-sentence summary (shown on cards)"
              maxLength={NEWS_SUMMARY_MAX}
              className={`${inputClass(!!errors.summary)} resize-none text-sm mb-1`}
            />
            <div className="flex items-center justify-between mb-4">
              {errors.summary ? (
                <p className="text-xs text-red-500">{errors.summary.message}</p>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-gray-400">
                {summary.length}/{NEWS_SUMMARY_MAX}
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-[#2D1F4D] bg-white dark:bg-[#1A1226] overflow-hidden">
              <div className="flex items-center border-b border-gray-200 dark:border-[#2D1F4D]">
                {(['write', 'preview'] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={[
                      'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
                      tab === id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                    ].join(' ')}
                  >
                    {id === 'write' ? <PenLine size={14} /> : <Eye size={14} />}
                    {id}
                  </button>
                ))}
              </div>

              {tab === 'write' ? (
                <>
                  <MarkdownToolbar
                    textareaRef={textareaRef}
                    value={content}
                    onChange={(next) =>
                      setValue('content', next, { shouldDirty: true, shouldValidate: true })
                    }
                  />
                  <textarea
                    {...contentField}
                    // The toolbar needs the element to read selectionStart/End, and RHF needs
                    // its own ref — so both get it from one callback.
                    ref={(el) => {
                      contentFormRef(el)
                      textareaRef.current = el
                    }}
                    rows={20}
                    maxLength={NEWS_CONTENT_MAX}
                    aria-label="Article content"
                    placeholder={
                      'Write your article in Markdown.\n\n## A heading\n\nSome **bold** text and a [link](https://example.com).'
                    }
                    className="w-full px-4 py-3 bg-transparent font-mono text-sm text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 outline-none resize-y"
                  />
                </>
              ) : (
                <div className="px-4 py-4 min-h-[24rem]">
                  {debouncedContent.trim() ? (
                    <MarkdownContent content={debouncedContent} />
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Nothing to preview yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-1.5">
              {errors.content ? (
                <p className="text-xs text-red-500">{errors.content.message}</p>
              ) : (
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  Markdown supported. Raw HTML is shown as text.
                </span>
              )}
              <span
                className={[
                  'text-[11px]',
                  content.length > 90_000 ? 'text-amber-500 font-medium' : 'text-gray-400',
                ].join(' ')}
              >
                {content.length.toLocaleString()}/{NEWS_CONTENT_MAX.toLocaleString()}
              </span>
            </div>
          </div>

          <aside className="space-y-5">
            <NewsCoverImagePicker
              existingUrl={article?.coverImageUrl ?? null}
              pending={cover}
              onPick={(next) => {
                setCover(next)
                if (next) setCoverRemoved(false)
                setSideloadDirty(true)
              }}
              removed={coverRemoved}
              onRemove={() => {
                setCoverRemoved(true)
                setSideloadDirty(true)
              }}
            />

            <NewsCategorySelect
              value={category}
              onChange={(value) => setValue('category', value, { shouldDirty: true })}
            />

            <NewsVisibilitySelect
              value={visibility}
              onChange={(value) => setValue('visibility', value, { shouldDirty: true })}
            />

            <NewsTagInput
              tags={tags}
              onChange={(next) => {
                setTags(next)
                setSideloadDirty(true)
              }}
            />

            {/* Only a draft can carry a schedule — publishing clears it, and archiving isn't
                reachable from a draft at all. */}
            {status === 'DRAFT' && (
              <NewsSchedulePicker
                value={schedule}
                onChange={(value) => {
                  setSchedule(value)
                  setSideloadDirty(true)
                }}
                disabled={isSaving}
              />
            )}

            {article ? (
              <NewsMediaPicker
                existing={remainingMedia}
                onRemoveExisting={(mediaId) => {
                  setRemoveMediaIds((ids) => [...ids, mediaId])
                  setSideloadDirty(true)
                }}
                pending={pendingMedia}
                onChangePending={(next) => {
                  setPendingMedia(next)
                  setSideloadDirty(true)
                }}
              />
            ) : (
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Save the draft first to attach gallery media.
              </p>
            )}
          </aside>
        </div>
      </div>

      {blocker.state === 'blocked' && (
        <ConfirmModal
          title="Leave without saving?"
          body="This article has changes that haven't been saved. They'll be lost if you leave now."
          confirmLabel="Discard changes"
          destructive
          onCancel={() => blocker.reset?.()}
          onConfirm={() => blocker.proceed?.()}
        />
      )}
    </>
  )
}
