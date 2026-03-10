// User Roles
export type UserRole =
  | 'President'
  | 'VicePresident'
  | 'CEO'
  | 'CFO'
  | 'ProjectManager'
  | 'MarketingManager'
  | 'Member'
  | 'Admin'

// Departments
export type Department =
  | 'Executive'
  | 'Finance'
  | 'Projects'
  | 'Marketing'
  | 'Operations'
  | 'HR'
  | 'IT'

// Project Status
export type ProjectStatus =
  | 'Planning'
  | 'Active'
  | 'OnHold'
  | 'Completed'
  | 'Cancelled'

// Task Status
export type TaskStatus =
  | 'TODO'
  | 'InProgress'
  | 'Review'
  | 'Done'
  | 'Blocked'

// Priority
export type Priority =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical'

// Base User type
export interface User {
  id: string
  supabaseId: string
  email: string
  name: string
  role: UserRole
  avatar: string | null
  department: Department
  phone: string | null
  isActive: boolean
  isDemo: boolean
  lastLogin: string | null
  permissions: string[]
  createdAt: string
  updatedAt: string
}

// Project type
export interface Project {
  id: string
  name: string
  description: string
  category: string
  status: ProjectStatus
  priority: Priority
  startDate: string
  endDate: string | null
  progress: number
  tags: string[]
  budgetAllocated: number
  budgetSpent: number
  budgetRemaining: number
  managerId: string
  createdAt: string
  updatedAt: string
}

// Task type
export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  estimatedHours: number
  actualHours: number
  tags: string[]
  completedAt: string | null
  projectId: string
  assignedToId: string | null
  createdById: string
  createdAt: string
  updatedAt: string
}

// Member type
export interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  category: string
  status: string
  joinDate: string
  dateOfBirth: string | null
  notes: string | null
  avatar: string | null
  interests: string[]
  skills: string[]
  createdAt: string
  updatedAt: string
}

// Event type
export interface Event {
  id: string
  title: string
  description: string
  type: string
  status: string
  startDate: string
  endDate: string
  capacity: number
  banner: string | null
  tags: string[]
  isPublished: boolean
  locationVenue: string
  locationCity: string | null
  locationCountry: string | null
  locationIsVirtual: boolean
  locationVirtualLink: string | null
  pricingIsFree: boolean
  budgetEstimated: number
  budgetActual: number
  organizerId: string
  createdAt: string
  updatedAt: string
}

// Finance type
export interface Finance {
  id: string
  type: string
  category: string
  amount: number
  description: string
  date: string
  paymentMethod: string
  status: string
  reference: string | null
  notes: string | null
  projectId: string | null
  eventId: string | null
  sponsorId: string | null
  memberId: string | null
  recordedById: string
  approvedById: string | null
  createdAt: string
  updatedAt: string
}

// Sponsor type
export interface Sponsor {
  id: string
  name: string
  logo: string | null
  level: string
  status: string
  type: string
  industry: string | null
  contactName: string
  contactEmail: string
  contactPhone: string
  sponsorshipAmount: number
  sponsorshipStartDate: string
  sponsorshipEndDate: string | null
  sponsorshipTotalCommitted: number
  sponsorshipTotalReceived: number
  tags: string[]
  managedById: string | null
  createdAt: string
  updatedAt: string
}

// Attendance type
export interface Attendance {
  id: string
  userId: string
  date: string
  checkInTime: string
  checkOutTime: string | null
  status: string
  workType: string
  hoursWorked: number
  notes: string | null
  checkInLat: number | null
  checkInLng: number | null
  checkInAddress: string | null
  checkOutLat: number | null
  checkOutLng: number | null
  projectId: string | null
  createdAt: string
  updatedAt: string
}

// Report type
export interface Report {
  id: string
  title: string
  type: string
  category: string
  status: string
  summary: string
  content: string
  periodStartDate: string
  periodEndDate: string
  createdById: string
  approvedById: string | null
  createdAt: string
  updatedAt: string
}

// User Profile (for auth context)
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
  permissions: string[]
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
