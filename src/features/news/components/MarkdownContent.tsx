import { memo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ExternalLink } from 'lucide-react'

/**
 * Renders author-supplied markdown.
 *
 * SECURITY — read before changing anything here:
 *
 *  - There is deliberately no `rehype-raw`. Without it react-markdown escapes raw HTML to
 *    plain text, which *is* the sanitiser for this component. Adding rehype-raw to "fix" the
 *    escaped `<div>` someone reports would turn every article into a stored-XSS vector.
 *  - There is no `dangerouslySetInnerHTML` anywhere in this file, and there must not be.
 *  - `urlTransform` is left at its default, which already strips `javascript:`, `vbscript:`
 *    and non-image `data:` URLs from links. Overriding it silently removes that protection.
 *  - Images are host-checked (see below) because the deployed CSP is report-only, so an
 *    off-origin `<img>` would load rather than be blocked.
 *
 * Styling is an explicit `components` map rather than Tailwind's `prose` class: the typography
 * plugin isn't installed, and its defaults would fight the app's dark palette.
 */

/** Hosts that serve this app's own media. Matches the img-src allowlist in vercel.json. */
const ALLOWED_IMAGE_HOSTS = new Set([
  's3.us-west-004.backblazeb2.com',
  'storage.googleapis.com',
])

function isAllowedImageSource(src: string): boolean {
  if (src.startsWith('data:image/') || src.startsWith('blob:')) return true
  try {
    const url = new URL(src, window.location.origin)
    if (url.origin === window.location.origin) return true
    return ALLOWED_IMAGE_HOSTS.has(url.hostname)
  } catch {
    // A malformed URL must not throw during render — just refuse to render it as an image.
    return false
  }
}

const COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-3 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-7 mb-3 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2 first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold text-gray-900 dark:text-white mt-5 mb-2 first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-[15px] leading-7 text-gray-700 dark:text-gray-300 mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc ml-5 mb-4 space-y-1.5 text-[15px] leading-7 text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal ml-5 mb-4 space-y-1.5 text-[15px] leading-7 text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/40 pl-4 py-0.5 mb-4 italic text-gray-600 dark:text-gray-400">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    // react-markdown gives fenced blocks a `language-*` class; inline code has none.
    const isBlock = typeof className === 'string' && className.includes('language-')
    if (isBlock) {
      return <code className="font-mono text-[13px] leading-6">{children}</code>
    }
    return (
      <code className="bg-gray-100 dark:bg-[#1A1226] px-1.5 py-0.5 rounded text-[13px] font-mono text-primary">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-xl p-4 mb-4 bg-gray-50 dark:bg-[#130D22] border border-gray-200 dark:border-[#2D1F4D]">
      {children}
    </pre>
  ),
  // GFM tables render as an unreadable run of text without explicit borders.
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50 dark:bg-[#1A1226]">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-gray-200 dark:border-[#2D1F4D] px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-200 dark:border-[#2D1F4D] px-3 py-2 text-gray-700 dark:text-gray-300">
      {children}
    </td>
  ),
  hr: () => <hr className="my-6 border-gray-200 dark:border-[#2D1F4D]" />,
  del: ({ children }) => <del className="text-gray-400 dark:text-gray-500">{children}</del>,
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
  ),
  input: ({ checked, type }) =>
    type === 'checkbox' ? (
      <input type="checkbox" checked={checked} disabled readOnly className="mr-1.5 align-middle" />
    ) : null,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline inline-flex items-center gap-0.5"
    >
      {children}
      <ExternalLink size={12} className="inline shrink-0" />
    </a>
  ),
  img: ({ src, alt }) => {
    const source = typeof src === 'string' ? src : ''

    // An arbitrary remote <img> is an author-controlled outbound request from every reader's
    // browser — a tracking pixel or IP logger. Article imagery belongs in the cover image and
    // the media gallery, both of which are served from our own storage.
    if (!source || !isAllowedImageSource(source)) {
      return (
        <a
          href={source || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 my-1 rounded-lg border border-gray-200 dark:border-[#2D1F4D] text-xs text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
        >
          <ExternalLink size={12} />
          {alt || 'External image'}
        </a>
      )
    }

    return (
      <img
        src={source}
        alt={alt ?? ''}
        loading="lazy"
        className="rounded-xl max-w-full my-4 border border-gray-200 dark:border-[#2D1F4D]"
      />
    )
  },
}

interface Props {
  content: string
}

function MarkdownContentImpl({ content }: Props) {
  if (!content.trim()) return null

  return (
    <div className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

// Parsing a 100k-character article on every parent render is the one performance cliff in this
// feature — the editor's live preview re-renders on each keystroke.
export const MarkdownContent = memo(MarkdownContentImpl)
