import type {
  User,
  Project,
  Task,
  Member,
  Event,
  Finance,
  Sponsor,
  Attendance,
  Report,
  UserRole,
  Department,
  ProjectStatus,
  TaskStatus,
  Priority,
} from '@prisma/client'

export type {
  User,
  Project,
  Task,
  Member,
  Event,
  Finance,
  Sponsor,
  Attendance,
  Report,
  UserRole,
  Department,
  ProjectStatus,
  TaskStatus,
  Priority,
}

export interface UserProfile {
  id: string
  supabaseId: string
  email: string
  name: string
  role: UserRole
  department: Department
  avatar: string | null
  phone: string | null
  isActive: boolean
  isDemo: boolean
}

export interface AuthState {
  user: import('@supabase/supabase-js').User | null
  profile: UserProfile | null
  session: import('@supabase/supabase-js').Session | null
  loading: boolean
  isAuthenticated: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  count?: number
}

export interface ProjectWithRelations extends Project {
  manager: Pick<User, 'id' | 'name' | 'email' | 'role' | 'avatar'>
  team: Array<{
    user: Pick<User, 'id' | 'name' | 'email' | 'avatar'>
    role: string
  }>
  _count?: {
    tasks: number
  }
  taskCount?: number
  completedTasks?: number
}

export interface TaskWithRelations extends Task {
  project: Pick<Project, 'id' | 'name'>
  assignedTo: Pick<User, 'id' | 'name' | 'avatar'> | null
  createdBy: Pick<User, 'id' | 'name'>
}

export interface DashboardStats {
  projects: {
    total: number
    active: number
    completed: number
  }
  tasks: {
    total: number
    todo: number
    inProgress: number
    done: number
  }
  members: {
    total: number
    active: number
  }
  finance: {
    totalIncome: number
    totalExpenses: number
    balance: number
  }
}
