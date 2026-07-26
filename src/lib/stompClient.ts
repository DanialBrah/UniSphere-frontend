import { Client, type IFrame } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export const stompClient = new Client({
  webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL as string),
  reconnectDelay: 5_000,
})

// Multi-listener event system.
// The single-property pattern (stompClient.onConnect = fn) means whichever
// caller runs last silently drops every previous assignment.  Using Sets here
// lets DashboardLayout, useLogin, and the subscription hook all register
// independent callbacks without knowing about each other.
const connectListeners    = new Set<() => void>()
const disconnectListeners = new Set<() => void>()
const errorListeners      = new Set<(frame: IFrame) => void>()

stompClient.onConnect    = () => connectListeners.forEach((fn) => fn())
stompClient.onDisconnect = () => disconnectListeners.forEach((fn) => fn())
stompClient.onStompError = (frame) => errorListeners.forEach((fn) => fn(frame))

/** Register a callback that fires every time STOMP connects (or reconnects).
 *  Returns a cleanup function that removes the listener. */
export function addStompConnectListener(cb: () => void): () => void {
  connectListeners.add(cb)
  return () => connectListeners.delete(cb)
}

/** Register a callback that fires every time STOMP disconnects.
 *  Returns a cleanup function that removes the listener. */
export function addStompDisconnectListener(cb: () => void): () => void {
  disconnectListeners.add(cb)
  return () => disconnectListeners.delete(cb)
}

/** Register a callback that fires on every STOMP ERROR frame (e.g. a CONNECT auth
 *  failure or a rate-limit breach on SEND, both thrown server-side as
 *  MessageDeliveryException). Returns a cleanup function that removes the listener. */
export function addStompErrorListener(cb: (frame: IFrame) => void): () => void {
  errorListeners.add(cb)
  return () => errorListeners.delete(cb)
}
