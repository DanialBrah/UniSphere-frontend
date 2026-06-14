export type ConversationType = 'DIRECT' | 'GROUP'
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
export type MemberRole = 'ADMIN' | 'MEMBER'

export interface ConversationMemberInfo {
  userId: number
  displayName: string
  avatarUrl: string | null
  role: MemberRole
}

// Alias — promote endpoint returns the same shape
export type MemberSummary = ConversationMemberInfo

export interface ConversationResponse {
  id: number
  convType: ConversationType
  name: string | null
  createdBy: number
  createdAt: string
  members: ConversationMemberInfo[]
  lastMessage: MessageResponse | null
}

export interface MessageResponse {
  id: number
  conversationId: number
  senderId: number
  senderName: string
  senderAvatar: string | null
  content: string | null
  msgType: MessageType
  mediaUrl: string | null
  replyToId: number | null
  createdAt: string
}

export interface ReadReceiptEvent {
  conversationId: number
  lastReadMessageId: number
  userId: number
  readAt: string
}

export interface TypingEvent {
  conversationId: number
  userId: number
  displayName: string
  typing: boolean
}

export interface MessageDeletedEvent {
  type: 'MESSAGE_DELETED'
  messageId: number
  conversationId: number
}

export interface CreateConversationRequest {
  type: ConversationType
  participantIds: number[]
  name?: string
}

export interface SendMessageRequest {
  conversationId: number
  content?: string
  msgType?: MessageType
  mediaUrl?: string
  replyToId?: number
}

export interface MarkReadRequest {
  conversationId: number
  lastReadMessageId: number
}

export interface TypingPayload {
  conversationId: number
  typing: boolean
}
