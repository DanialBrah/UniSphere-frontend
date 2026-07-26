import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'

// Delay showing the banner so a normal brief connect-on-load window (or a quick
// auto-reconnect — stompClient retries every 5s on its own) never flickers it.
const SHOW_DELAY_MS = 3000

export function ConnectionBanner() {
  const isConnected = useChatStore((s) => s.isStompConnected)
  const [seenConnected, setSeenConnected] = useState(isConnected)
  const [showBanner, setShowBanner] = useState(false)

  // Hide immediately the moment we reconnect — seeded during render (React's
  // documented pattern for adjusting state from a changed prop) rather than a
  // synchronous setState call inside an effect.
  if (isConnected !== seenConnected) {
    setSeenConnected(isConnected)
    if (isConnected) setShowBanner(false)
  }

  useEffect(() => {
    if (isConnected) return
    const timer = setTimeout(() => setShowBanner(true), SHOW_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isConnected])

  if (!showBanner) return null

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-medium shadow-lg">
      <WifiOff size={13} />
      Reconnecting…
    </div>
  )
}
