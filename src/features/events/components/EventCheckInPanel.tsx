import { useRef, useState } from 'react'
import { CheckCircle2, Loader2, ScanLine } from 'lucide-react'
import { useCheckInEventTicket } from '../hooks/useEventRegistrations'
import { eventErrorMessage } from '../utils/eventErrors'
import { inputClass } from '../utils/formUtils'
import type { EventRegistrationResponse } from '../types'

/**
 * A single ticket-code input, not a form — the surface is too small to need RHF/zod. Clears and
 * refocuses immediately after every check-in so an organizer scanning a real line at the door can
 * stay in a tight loop, rather than dismissing a modal between each attendee.
 */
export function EventCheckInPanel({ eventId }: Readonly<{ eventId: number }>) {
  const [ticketCode, setTicketCode] = useState('')
  const [lastResult, setLastResult] = useState<EventRegistrationResponse | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const checkIn = useCheckInEventTicket(eventId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = ticketCode.trim()
    if (!code) return

    setLastError(null)
    checkIn.mutate(
      { ticketCode: code },
      {
        onSuccess: (registration) => {
          setLastResult(registration)
          setTicketCode('')
          inputRef.current?.focus()
        },
        onError: (err) => {
          setLastError(eventErrorMessage(err))
          inputRef.current?.focus()
        },
      },
    )
  }

  return (
    <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        <ScanLine className="h-4 w-4 text-primary" />
        Check in
      </h2>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          placeholder="Scan or type the ticket code"
          autoFocus
          className={inputClass()}
        />
        <button
          type="submit"
          disabled={checkIn.isPending || !ticketCode.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checkIn.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Check in
        </button>
      </form>

      {lastResult && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          Checked in user #{lastResult.userId}
        </p>
      )}
      {lastError && <p className="text-sm text-red-500 dark:text-red-400">{lastError}</p>}
    </section>
  )
}
