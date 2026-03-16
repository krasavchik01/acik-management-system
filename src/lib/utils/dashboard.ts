export const getGreeting = (language: string) => {
  const hour = new Date().getHours()
  if (language === 'ru') {
    if (hour < 12) return 'Доброе утро'
    if (hour < 18) return 'Добрый день'
    return 'Добрый вечер'
  }
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
    case 'Completed': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
    case 'OnHold': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
    case 'TODO': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    case 'InProgress': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
    case 'Done': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  }
}

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical': return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
    case 'High': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400'
    case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
    case 'Low': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  }
}
