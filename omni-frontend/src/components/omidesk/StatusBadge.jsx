const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  assigned: 'bg-sky-100 text-sky-800 border-sky-200',
  in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  closed: 'bg-slate-200 text-slate-700 border-slate-300',
}

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export default function StatusBadge({ status }) {
  const normalized = status ?? 'pending'
  const styles = STATUS_STYLES[normalized] ?? STATUS_STYLES.pending
  const label = STATUS_LABELS[normalized] ?? normalized

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}>
      {label}
    </span>
  )
}
