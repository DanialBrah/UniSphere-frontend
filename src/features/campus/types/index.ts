// Matches backend record ChatTurn(String role, String text, LocalDateTime timestamp)
export interface ChatTurn {
  role: 'user' | 'model'
  text: string
  timestamp?: string
}

// Matches backend record ChatResponse(String reply, boolean fromCache, LocalDateTime timestamp)
export interface ChatResponse {
  reply: string
  fromCache: boolean
  timestamp: string
}

// UI model — ChatTurn + optional local timestamp for display
export interface ChatMessage {
  role: 'user' | 'model'
  text: string
  timestamp?: string
}

export interface ChatRequest {
  message: string
}
