export interface User {
  id: string
  supabaseId: string
  name: string
  email: string
  role: string
  department: string
  isActive: boolean
  isDemo: boolean
  permissions: string[]
  lastLogin?: string
  createdAt: string
  activeTasks?: number
  activeProjects?: number
  location?: string
}

export interface AdminStats {
  stats: {
    users: { total: number; active: number }
    projects: { total: number; active: number }
    tasks: { total: number; completed: number }
    members: { total: number; active: number }
    events: { total: number }
    finance: { totalIncome: number }
    system?: {
      financeRecords: number
      sponsors: number
      members: number
    }
  }
  recent: {
    users: Array<{ id: string; name: string; email: string; role: string; createdAt: string }>
    projects: Array<{ id: string; name: string; status: string; createdAt: string }>
  }
  presence?: Array<{
    id: string
    userId: string
    status: string
    workType: string
    checkInTime: string
    checkInAddress?: string
  }>
}

export const ROLES = ['Admin', 'President', 'VicePresident', 'CEO', 'CFO', 'ProjectManager', 'MarketingManager', 'Member']
export const DEPARTMENTS = ['Executive', 'Finance', 'Projects', 'Marketing', 'Operations', 'HR', 'IT']

export const getPermissionsList = (t: (cat: string, key: string) => string) => [
  { id: 'projects.view', label: t('permissions', 'projects.view'), category: 'Projects' },
  { id: 'projects.create', label: t('permissions', 'projects.create'), category: 'Projects' },
  { id: 'projects.edit', label: t('permissions', 'projects.edit'), category: 'Projects' },
  { id: 'projects.delete', label: t('permissions', 'projects.delete'), category: 'Projects' },
  { id: 'tasks.view', label: t('permissions', 'tasks.view'), category: 'Tasks' },
  { id: 'tasks.viewAll', label: t('permissions', 'tasks.viewAll'), category: 'Tasks' },
  { id: 'tasks.create', label: t('permissions', 'tasks.create'), category: 'Tasks' },
  { id: 'tasks.edit', label: t('permissions', 'tasks.edit'), category: 'Tasks' },
  { id: 'tasks.delete', label: t('permissions', 'tasks.delete'), category: 'Tasks' },
  { id: 'members.view', label: t('permissions', 'members.view'), category: 'Members' },
  { id: 'members.manage', label: t('permissions', 'members.manage'), category: 'Members' },
  { id: 'finance.view', label: t('permissions', 'finance.view'), category: 'Finance' },
  { id: 'finance.manage', label: t('permissions', 'finance.manage'), category: 'Finance' },
  { id: 'events.view', label: t('permissions', 'events.view'), category: 'Events' },
  { id: 'events.manage', label: t('permissions', 'events.manage'), category: 'Events' },
  { id: 'reports.view', label: t('permissions', 'reports.view'), category: 'Reports' },
  { id: 'reports.manage', label: t('permissions', 'reports.manage'), category: 'Reports' },
  { id: 'admin.access', label: t('permissions', 'admin.access'), category: 'Admin' },
]
