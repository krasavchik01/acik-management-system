'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX, FiUser, FiCalendar, FiFlag, FiFolder,
  FiCheckCircle, FiClock, FiAlertCircle, FiList,
  FiZoomIn, FiZoomOut, FiMaximize2, FiArrowLeft,
  FiChevronRight, FiTarget
} from 'react-icons/fi'
import Link from 'next/link'

// ---------- Types ----------

interface TaskItem {
  id: string
  title: string
  status: 'TODO' | 'InProgress' | 'Review' | 'Done' | 'Blocked'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  dueDate?: string
  project?: { id: string; name: string }
}

interface AssigneeNode {
  user: { id: string; name: string; avatar: string | null; role: string | null; department: string | null }
  tasks: TaskItem[]
  statusCounts: { TODO: number; InProgress: number; Review: number; Done: number; Blocked: number }
  total: number
}

interface CreatorNode {
  creator: { id: string; name: string; avatar: string | null; role: string | null; department: string | null }
  assignees: AssigneeNode[]
  totalAssigned: number
}

interface HubData {
  success: boolean
  data: CreatorNode[]
  totalTasks: number
}

// ---------- Constants ----------

const STATUS_COLORS: Record<string, string> = {
  TODO: '#6b7280',
  InProgress: '#3b82f6',
  Review: '#a855f7',
  Done: '#10b981',
  Blocked: '#ef4444',
}

const PRIORITY_COLORS: Record<string, string> = {
  Low: '#22c55e',
  Medium: '#eab308',
  High: '#f97316',
  Critical: '#ef4444',
}

const STATUS_ICONS: Record<string, typeof FiList> = {
  TODO: FiList,
  InProgress: FiClock,
  Review: FiCheckCircle,
  Done: FiCheckCircle,
  Blocked: FiAlertCircle,
}

// ---------- Helper: Avatar ----------

function Avatar({ name, avatar, size = 40 }: { name: string; avatar?: string | null; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = [
    'from-indigo-500 to-violet-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
    'from-purple-500 to-fuchsia-500',
  ]
  const colorIdx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white font-bold ring-2 ring-white dark:ring-slate-800`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  )
}

// ---------- Helper: Status mini bar ----------

function StatusBar({ counts, total }: { counts: Record<string, number>; total: number }) {
  if (total === 0) return null
  return (
    <div className="flex h-1.5 w-full rounded-full overflow-hidden gap-px">
      {(['TODO', 'InProgress', 'Review', 'Done', 'Blocked'] as const).map(s => {
        const pct = (counts[s] / total) * 100
        if (pct === 0) return null
        return (
          <div
            key={s}
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[s] }}
          />
        )
      })}
    </div>
  )
}

// ---------- Main Component ----------

export default function TaskHubPage() {
  const { profile } = useAuth()
  const { t, language } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [data, setData] = useState<CreatorNode[]>([])
  const [totalTasks, setTotalTasks] = useState(0)
  const [loading, setLoading] = useState(true)

  // Interaction state
  const [expandedCreator, setExpandedCreator] = useState<string | null>(null)
  const [selectedLink, setSelectedLink] = useState<{ creatorId: string; assigneeId: string } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Fetch data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/tasks/hub')
        const json: HubData = await res.json()
        if (json.success) {
          setData(json.data)
          setTotalTasks(json.totalTasks)
        }
      } catch (e) {
        console.error('Failed to load task hub:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ---------- Layout calculation ----------

  const layout = useMemo(() => {
    const centerX = 600
    const centerY = 450
    const creatorRadius = 280
    const assigneeRadius = 160

    const sorted = [...data].sort((a, b) => b.totalAssigned - a.totalAssigned)

    const creators: Array<{
      node: CreatorNode
      x: number
      y: number
      assignees: Array<{ node: AssigneeNode; x: number; y: number }>
    }> = []

    sorted.forEach((creator, i) => {
      const angle = (2 * Math.PI * i) / Math.max(sorted.length, 1) - Math.PI / 2
      const cx = centerX + creatorRadius * Math.cos(angle)
      const cy = centerY + creatorRadius * Math.sin(angle)

      const assignees = creator.assignees.map((assignee, j) => {
        const aAngle = angle + ((j - (creator.assignees.length - 1) / 2) * 0.45)
        const ax = cx + assigneeRadius * Math.cos(aAngle)
        const ay = cy + assigneeRadius * Math.sin(aAngle)
        return { node: assignee, x: ax, y: ay }
      })

      creators.push({ node: creator, x: cx, y: cy, assignees })
    })

    return { centerX, centerY, creators }
  }, [data])

  // ---------- Pan & Zoom handlers ----------

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    setZoom(z => Math.max(0.3, Math.min(2.5, z + delta)))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).closest('.mind-map-bg')) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }, [isPanning, panStart])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  // ---------- Selected tasks panel ----------

  const selectedTasks = useMemo(() => {
    if (!selectedLink) return null
    const creator = data.find(c => c.creator.id === selectedLink.creatorId)
    if (!creator) return null
    const assignee = creator.assignees.find(a => a.user.id === selectedLink.assigneeId)
    if (!assignee) return null
    return { creator: creator.creator, assignee: assignee.user, tasks: assignee.tasks, statusCounts: assignee.statusCounts }
  }, [selectedLink, data])

  // ---------- Status labels ----------

  const statusLabel = useCallback((s: string) => {
    const map: Record<string, string> = {
      TODO: t('tasks', 'todo'),
      InProgress: t('tasks', 'inProgress'),
      Review: t('tasks', 'review'),
      Done: t('tasks', 'done'),
      Blocked: language === 'ru' ? 'Заблокировано' : 'Blocked',
    }
    return map[s] || s
  }, [t, language])

  const priorityLabel = useCallback((p: string) => {
    const map: Record<string, string> = {
      Low: t('tasks', 'priorityLow'),
      Medium: t('tasks', 'priorityMedium'),
      High: t('tasks', 'priorityHigh'),
      Critical: t('tasks', 'priorityUrgent'),
    }
    return map[p] || p
  }, [t])

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <Header
          title={language === 'ru' ? 'Хаб задач' : 'Task Hub'}
          subtitle={language === 'ru' ? 'Визуализация распределения задач' : 'Task distribution visualization'}
        />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('common', 'loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <Header
        title={language === 'ru' ? 'Хаб задач' : 'Task Hub'}
        subtitle={language === 'ru' ? 'Кто кому какие задачи поставил' : 'Who assigned tasks to whom'}
        action={
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            {language === 'ru' ? 'К задачам' : 'Back to Tasks'}
          </Link>
        }
      />

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 shadow-sm flex items-center gap-2">
          <FiTarget className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'ru' ? 'Всего задач:' : 'Total tasks:'} <span className="text-indigo-600 dark:text-indigo-400 font-bold">{totalTasks}</span>
          </span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 shadow-sm flex items-center gap-2">
          <FiUser className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'ru' ? 'Назначающих:' : 'Assigners:'} <span className="text-violet-600 dark:text-violet-400 font-bold">{data.length}</span>
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center mb-4">
            <FiTarget className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {language === 'ru' ? 'Пока нет задач' : 'No tasks yet'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === 'ru' ? 'Создайте задачи, чтобы увидеть карту распределения' : 'Create tasks to see the distribution map'}
          </p>
        </div>
      ) : (
        <div className="flex gap-4" style={{ height: 'calc(100vh - 220px)' }}>
          {/* Mind Map Area */}
          <div
            ref={containerRef}
            className="flex-1 relative rounded-2xl bg-white dark:bg-slate-900/80 border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
          >
            {/* Grid background */}
            <div className="mind-map-bg absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
              style={{
                backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Zoom controls */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
              <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <FiZoomIn className="w-4 h-4" />
              </button>
              <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <FiZoomOut className="w-4 h-4" />
              </button>
              <button onClick={resetView} className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <FiMaximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom level badge */}
            <div className="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs font-mono text-gray-500 dark:text-gray-400 backdrop-blur-sm">
              {Math.round(zoom * 100)}%
            </div>

            {/* SVG Mind Map */}
            <svg
              ref={svgRef}
              className="w-full h-full"
              viewBox="0 0 1200 900"
              preserveAspectRatio="xMidYMid meet"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <defs>
                {/* Gradient for center node */}
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </radialGradient>
                {/* Arrow marker */}
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#a5b4fc" opacity="0.6" />
                </marker>
                {/* Line gradients for each connection */}
                <linearGradient id="lineGradCreator" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="lineGradAssignee" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Center glow */}
              <circle cx={layout.centerX} cy={layout.centerY} r="80" fill="url(#centerGlow)" />

              {/* Lines from center to creators */}
              {layout.creators.map(({ node, x, y }) => {
                const isExpanded = expandedCreator === node.creator.id
                return (
                  <g key={`line-c-${node.creator.id}`}>
                    <line
                      x1={layout.centerX} y1={layout.centerY}
                      x2={x} y2={y}
                      stroke="url(#lineGradCreator)"
                      strokeWidth={isExpanded ? 3 : 2}
                      strokeDasharray={isExpanded ? 'none' : '6 4'}
                      className="transition-all duration-300"
                    />
                    {/* Task count on line */}
                    <circle
                      cx={(layout.centerX + x) / 2}
                      cy={(layout.centerY + y) / 2}
                      r="14"
                      fill="white"
                      className="dark:fill-slate-800"
                      stroke="#c7d2fe"
                      strokeWidth="1.5"
                    />
                    <text
                      x={(layout.centerX + x) / 2}
                      y={(layout.centerY + y) / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-indigo-600 dark:fill-indigo-400 text-[11px] font-bold"
                    >
                      {node.totalAssigned}
                    </text>
                  </g>
                )
              })}

              {/* Lines from creators to assignees (when expanded) */}
              {layout.creators.map(({ node, x: cx, y: cy, assignees }) => {
                if (expandedCreator !== node.creator.id) return null
                return assignees.map(({ node: assignee, x: ax, y: ay }) => {
                  const isSelected = selectedLink?.creatorId === node.creator.id && selectedLink?.assigneeId === assignee.user.id
                  // Curved path
                  const midX = (cx + ax) / 2
                  const midY = (cy + ay) / 2
                  const dx = ax - cx
                  const dy = ay - cy
                  const perpX = -dy * 0.15
                  const perpY = dx * 0.15
                  const ctrlX = midX + perpX
                  const ctrlY = midY + perpY

                  return (
                    <g key={`line-a-${node.creator.id}-${assignee.user.id}`}>
                      <path
                        d={`M ${cx} ${cy} Q ${ctrlX} ${ctrlY} ${ax} ${ay}`}
                        fill="none"
                        stroke={isSelected ? '#818cf8' : 'url(#lineGradAssignee)'}
                        strokeWidth={isSelected ? 3 : 2}
                        markerEnd="url(#arrowhead)"
                        className="transition-all duration-300"
                      />
                      {/* Task count bubble */}
                      <circle
                        cx={ctrlX}
                        cy={ctrlY}
                        r="12"
                        fill="white"
                        className="dark:fill-slate-800"
                        stroke="#e9d5ff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={ctrlX}
                        y={ctrlY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-violet-600 dark:fill-violet-400 text-[10px] font-bold"
                      >
                        {assignee.total}
                      </text>
                    </g>
                  )
                })
              })}

              {/* Center node */}
              <g className="cursor-pointer" onClick={resetView}>
                <circle cx={layout.centerX} cy={layout.centerY} r="45" fill="white" className="dark:fill-slate-800" stroke="#c7d2fe" strokeWidth="2.5" />
                <circle cx={layout.centerX} cy={layout.centerY} r="38" fill="none" stroke="#e0e7ff" strokeWidth="1" className="dark:stroke-slate-700" />
                <text x={layout.centerX} y={layout.centerY - 8} textAnchor="middle" className="fill-indigo-700 dark:fill-indigo-300 text-[13px] font-bold">
                  {language === 'ru' ? 'ХАБ' : 'HUB'}
                </text>
                <text x={layout.centerX} y={layout.centerY + 10} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[10px]">
                  {totalTasks} {language === 'ru' ? 'задач' : 'tasks'}
                </text>
              </g>

              {/* Creator nodes */}
              {layout.creators.map(({ node, x, y, assignees }) => {
                const isExpanded = expandedCreator === node.creator.id
                const nodeR = isExpanded ? 38 : 32
                return (
                  <g key={`creator-${node.creator.id}`}>
                    {/* Assignee nodes (when expanded) */}
                    <AnimatePresence>
                      {isExpanded && assignees.map(({ node: assignee, x: ax, y: ay }) => {
                        const isSelected = selectedLink?.creatorId === node.creator.id && selectedLink?.assigneeId === assignee.user.id
                        return (
                          <g
                            key={`assignee-${assignee.user.id}`}
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLink(
                                isSelected ? null : { creatorId: node.creator.id, assigneeId: assignee.user.id }
                              )
                            }}
                          >
                            {/* Outer ring for selection */}
                            {isSelected && (
                              <circle cx={ax} cy={ay} r="32" fill="none" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 3">
                                <animateTransform attributeName="transform" type="rotate" from={`0 ${ax} ${ay}`} to={`360 ${ax} ${ay}`} dur="8s" repeatCount="indefinite" />
                              </circle>
                            )}
                            {/* Node bg */}
                            <circle cx={ax} cy={ay} r="26" fill="white" className="dark:fill-slate-800" stroke={isSelected ? '#818cf8' : '#e9d5ff'} strokeWidth={isSelected ? 2 : 1.5} />
                            {/* Initials */}
                            <text x={ax} y={ay - 3} textAnchor="middle" dominantBaseline="central" className="fill-gray-700 dark:fill-gray-300 text-[11px] font-semibold">
                              {assignee.user.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </text>
                            {/* Task count */}
                            <text x={ax} y={ay + 11} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[8px]">
                              {assignee.total} {language === 'ru' ? 'зд' : 'ts'}
                            </text>
                            {/* Status dot */}
                            {assignee.statusCounts.Blocked > 0 && (
                              <circle cx={ax + 18} cy={ay - 18} r="5" fill="#ef4444" stroke="white" strokeWidth="1.5" className="dark:stroke-slate-800" />
                            )}
                            {/* Name label */}
                            <foreignObject x={ax - 50} y={ay + 28} width="100" height="30">
                              <div className="text-center">
                                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
                                  {assignee.user.name.split(' ')[0]}
                                </span>
                              </div>
                            </foreignObject>
                          </g>
                        )
                      })}
                    </AnimatePresence>

                    {/* Creator node */}
                    <g
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedCreator(isExpanded ? null : node.creator.id)
                        setSelectedLink(null)
                      }}
                    >
                      {/* Pulse ring when expanded */}
                      {isExpanded && (
                        <circle cx={x} cy={y} r={nodeR + 6} fill="none" stroke="#818cf8" strokeWidth="1.5" opacity="0.4">
                          <animate attributeName="r" values={`${nodeR + 4};${nodeR + 12};${nodeR + 4}`} dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {/* Node bg */}
                      <circle
                        cx={x} cy={y} r={nodeR}
                        fill="white" className="dark:fill-slate-800"
                        stroke={isExpanded ? '#818cf8' : '#c7d2fe'}
                        strokeWidth={isExpanded ? 2.5 : 2}
                      />
                      {/* Initials */}
                      <text x={x} y={y - 4} textAnchor="middle" dominantBaseline="central" className="fill-gray-800 dark:fill-gray-200 text-[13px] font-bold">
                        {node.creator.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </text>
                      {/* Assignee count */}
                      <text x={x} y={y + 12} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[9px]">
                        → {node.assignees.length}
                      </text>
                      {/* Name label */}
                      <foreignObject x={x - 55} y={y + nodeR + 4} width="110" height="36">
                        <div className="text-center">
                          <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-slate-800/90 px-2 py-0.5 rounded-lg backdrop-blur-sm shadow-sm border border-gray-100 dark:border-slate-700/50 whitespace-nowrap">
                            {node.creator.name.length > 14 ? node.creator.name.split(' ')[0] : node.creator.name}
                          </span>
                          {node.creator.role && (
                            <div className="mt-0.5">
                              <span className="text-[8px] text-gray-400 dark:text-gray-500">
                                {node.creator.role}
                              </span>
                            </div>
                          )}
                        </div>
                      </foreignObject>
                      {/* Expand indicator */}
                      <g transform={`translate(${x + nodeR - 8}, ${y - nodeR + 8})`}>
                        <circle r="8" fill="#818cf8" opacity="0.9" />
                        <text textAnchor="middle" dominantBaseline="central" className="fill-white text-[9px] font-bold">
                          {isExpanded ? '−' : '+'}
                        </text>
                      </g>
                    </g>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Side panel — task details */}
          <AnimatePresence>
            {selectedTasks && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="h-full overflow-hidden flex-shrink-0"
              >
                <div className="w-[380px] h-full rounded-2xl bg-white dark:bg-slate-900/80 border border-gray-100 dark:border-slate-700/50 shadow-sm flex flex-col overflow-hidden">
                  {/* Panel header */}
                  <div className="p-4 border-b border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {language === 'ru' ? 'Задачи' : 'Tasks'}
                      </h3>
                      <button
                        onClick={() => setSelectedLink(null)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-slate-800 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Creator → Assignee */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Avatar name={selectedTasks.creator.name} avatar={selectedTasks.creator.avatar} size={24} />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{selectedTasks.creator.name}</span>
                      <FiChevronRight className="w-3 h-3 flex-shrink-0" />
                      <Avatar name={selectedTasks.assignee.name} avatar={selectedTasks.assignee.avatar} size={24} />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{selectedTasks.assignee.name}</span>
                    </div>
                    {/* Status summary */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {Object.entries(selectedTasks.statusCounts).map(([status, count]) => {
                        if (count === 0) return null
                        const Icon = STATUS_ICONS[status] || FiList
                        return (
                          <span
                            key={status}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ backgroundColor: STATUS_COLORS[status] + '18', color: STATUS_COLORS[status] }}
                          >
                            <Icon className="w-3 h-3" />
                            {count} {statusLabel(status)}
                          </span>
                        )
                      })}
                    </div>
                    <div className="mt-2">
                      <StatusBar counts={selectedTasks.statusCounts} total={selectedTasks.tasks.length} />
                    </div>
                  </div>

                  {/* Task list */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {selectedTasks.tasks.map(task => (
                      <Link
                        key={task.id}
                        href={`/tasks`}
                        className="block p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/30 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-start gap-2">
                          {/* Status dot */}
                          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[task.status] }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {/* Priority */}
                              <span
                                className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: PRIORITY_COLORS[task.priority] + '18', color: PRIORITY_COLORS[task.priority] }}
                              >
                                <FiFlag className="w-2.5 h-2.5" />
                                {priorityLabel(task.priority)}
                              </span>
                              {/* Status */}
                              <span
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: STATUS_COLORS[task.status] + '18', color: STATUS_COLORS[task.status] }}
                              >
                                {statusLabel(task.status)}
                              </span>
                              {/* Due date */}
                              {task.dueDate && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                                  <FiCalendar className="w-2.5 h-2.5" />
                                  {new Date(task.dueDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                              {/* Project */}
                              {task.project && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                                  <FiFolder className="w-2.5 h-2.5" />
                                  {task.project.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Legend */}
      {data.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-4 px-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {language === 'ru' ? 'Легенда:' : 'Legend:'}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white border-2 border-indigo-300" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{language === 'ru' ? 'Назначающий' : 'Assigner'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white border-2 border-purple-300" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{language === 'ru' ? 'Исполнитель' : 'Assignee'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 bg-indigo-300 rounded" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{language === 'ru' ? 'Связь (число = кол-во задач)' : 'Link (number = task count)'}</span>
          </div>
          {['TODO', 'InProgress', 'Review', 'Done', 'Blocked'].map(s => (
            <div key={s} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{statusLabel(s)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
