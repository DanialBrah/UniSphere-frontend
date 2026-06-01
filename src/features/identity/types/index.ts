import type { LucideIcon } from 'lucide-react'

export interface Feature {
  icon:        LucideIcon
  title:       string
  description: string
}

export interface UserType {
  role:        string
  tagline:     string
  description: string
  icon:        LucideIcon
  gradient:    string
}

export interface Highlight {
  badge:       string
  badgeVariant: 'purple' | 'green' | 'blue'
  heading:     string
  body:        string
  bullets:     string[]
  bulletColor: string
}
