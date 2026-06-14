export type NotifType = 'LIKE' | 'COMMENT' | 'MENTION'
export type NotifTargetType = 'POST'

export interface NotificationResponse {
  id: number
  actorId: number
  notifType: NotifType
  targetId: number
  targetType: NotifTargetType
  read: boolean
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}
