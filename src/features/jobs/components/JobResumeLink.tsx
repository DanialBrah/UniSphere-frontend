import { FileText } from 'lucide-react'

/**
 * Opens a presigned GET URL in a new tab — a top-level navigation, not a fetch/img/video load, so
 * it needs no CSP entry. No inline preview: this repo has no `react-pdf` and none of its other
 * upload flows embed documents, only images.
 */
export function JobResumeLink({ resumeUrl }: Readonly<{ resumeUrl: string }>) {
  return (
    <a
      href={resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
    >
      <FileText className="h-3.5 w-3.5" />
      View résumé
    </a>
  )
}
