import { QRCodeSVG } from 'qrcode.react'

interface EventTicketQrProps {
  ticketCode: string
  size?: number
}

/**
 * Renders a registration's `ticketCode` as a scannable QR code. The backend hands back a bare
 * string on purpose — turning it into a QR image is a client-side concern (see
 * `EventRegistrationResponse.ticketCode`'s doc comment). The organizer's check-in panel accepts the
 * same code typed or pasted, so this is display-only — no camera-scanning is wired up anywhere.
 */
export function EventTicketQr({ ticketCode, size = 160 }: Readonly<EventTicketQrProps>) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-[#2D1F4D]">
        <QRCodeSVG value={ticketCode} size={size} marginSize={0} />
      </div>
      <p className="select-all text-center font-mono text-[11px] text-gray-500 dark:text-gray-400">
        {ticketCode}
      </p>
    </div>
  )
}
