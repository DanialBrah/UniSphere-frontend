import {
  ShieldCheck, Users, LayoutGrid, ShoppingBag, Network,
  Newspaper, Award, Calendar, MapPin, Briefcase,
  FolderKanban, MessageSquare, BookOpen, GraduationCap,
  Search, Bot, Users2, Ticket, Clock, Bus,
  Building2, Shield,
} from 'lucide-react'
import type { Feature, UserType } from '../types'

export const FEATURES: Feature[] = [
  { icon: ShieldCheck,    title: 'Verified Identity',    description: 'Matric card & student email verification' },
  { icon: Users,          title: 'Campus Network',        description: 'Connect across universities' },
  { icon: LayoutGrid,     title: 'Social Feed',           description: 'Share updates, media, and moments' },
  { icon: ShoppingBag,    title: 'Marketplace',           description: 'Buy and sell within your campus' },
  { icon: Network,        title: 'Networking',            description: 'Build professional campus connections' },
  { icon: Newspaper,      title: 'Campus News',           description: 'Verified university news feed' },
  { icon: Award,          title: 'Alumni Network',        description: 'Stay connected after graduation' },
  { icon: Calendar,       title: 'Events',                description: 'Discover, create, and attend events' },
  { icon: MapPin,         title: 'Campus Maps',           description: 'Navigate buildings and venues' },
  { icon: Briefcase,      title: 'Jobs & Internships',    description: 'Career opportunities on campus' },
  { icon: FolderKanban,   title: 'Projects',              description: 'Collaborate and contribute' },
  { icon: MessageSquare,  title: 'Community',             description: 'Discussions and interest groups' },
  { icon: BookOpen,       title: 'Study Sessions',        description: 'Organize group study' },
  { icon: GraduationCap,  title: 'Tutoring',              description: 'Find or offer tutoring' },
  { icon: Search,         title: 'Lost & Found',          description: 'Report and recover lost items' },
  { icon: Bot,            title: 'Campus Chatbot',        description: 'AI assistant for campus queries' },
  { icon: Users2,         title: 'Clubs',                 description: 'Manage and join student clubs' },
  { icon: Ticket,         title: 'Event Ticketing',       description: 'QR-based digital tickets' },
  { icon: Clock,          title: 'Timetable',             description: 'Personal schedule integration' },
  { icon: Bus,            title: 'Live Bus Tracking',     description: 'Real-time campus shuttle location' },
]

export const USER_TYPES: UserType[] = [
  {
    role:        'Student',
    tagline:     'Learn. Connect. Grow.',
    description: 'Access everything campus life offers — study groups, job listings, events, and real university networking.',
    icon:        GraduationCap,
    gradient:    'from-primary-600 to-primary-800',
  },
  {
    role:        'Alumni',
    tagline:     'Give back. Stay connected.',
    description: 'Mentor current students, explore career opportunities, and stay part of your university community.',
    icon:        Award,
    gradient:    'from-blue-500 to-indigo-600',
  },
  {
    role:        'Employer',
    tagline:     'Find top talent.',
    description: 'Post jobs and internships, connect with motivated students, and build your on-campus employer brand.',
    icon:        Briefcase,
    gradient:    'from-emerald-500 to-teal-600',
  },
  {
    role:        'University',
    tagline:     'Manage your campus.',
    description: 'Publish news, manage events, oversee clubs, and communicate with your entire university community.',
    icon:        Building2,
    gradient:    'from-orange-500 to-amber-600',
  },
  {
    role:        'Club',
    tagline:     'Grow your community.',
    description: 'Recruit members, organize events, manage schedules, and build an engaged student club community.',
    icon:        Users,
    gradient:    'from-pink-500 to-rose-600',
  },
  {
    role:        'Admin',
    tagline:     'Full platform control.',
    description: 'Moderate content, manage users, configure the platform, and maintain a safe campus environment.',
    icon:        Shield,
    gradient:    'from-slate-500 to-gray-600',
  },
]
