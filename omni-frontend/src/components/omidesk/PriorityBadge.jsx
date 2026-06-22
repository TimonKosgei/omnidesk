const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

export default function PriorityBadge({ priority }) {
  const normalized = priority ?? 'medium'
  const styles = PRIORITY_STYLES[normalized] ?? PRIORITY_STYLES.medium

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}>
      {normalized}
    </span>
  )
}
