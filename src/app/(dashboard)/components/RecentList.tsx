import Link from 'next/link'
import { IconType } from 'react-icons'
import { FiArrowRight } from 'react-icons/fi'

interface RecentListProps<T> {
  title: string
  viewAllHref: string
  viewAllLabel: string
  items: T[]
  renderItem: (item: T) => React.ReactNode
  emptyState: {
    icon: IconType
    message: string
  }
}

export function RecentList<T>({
  title,
  viewAllHref,
  viewAllLabel,
  items,
  renderItem,
  emptyState: { icon: EmptyIcon, message }
}: RecentListProps<T>) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
        >
          {viewAllLabel}
          <FiArrowRight size={16} />
        </Link>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-slate-700">
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400">
            <EmptyIcon size={32} className="mx-auto mb-2 text-gray-300 dark:text-slate-600" />
            <p>{message}</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx}>
              {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
