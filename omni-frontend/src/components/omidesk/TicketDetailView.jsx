import PriorityBadge from './PriorityBadge'
import StatusBadge from './StatusBadge'

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ticketId(ticket) {
  const id = ticket._id ?? ticket.id ?? ''
  return id.startsWith('demo-') ? id.toUpperCase() : `#${String(id).slice(-6).toUpperCase()}`
}

function locationLabel(location) {
  if (!location) return 'Not specified'
  if (typeof location === 'string') return location
  return [location.building, location.floor, location.room].filter(Boolean).join(', ')
}

export default function TicketDetailView({ ticket, onBack }) {
  if (!ticket) return null

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-omidesk-navy transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-omidesk-navy focus:ring-offset-2 rounded-lg px-1 py-1"
      >
        ← Back to dashboard
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ticket {ticketId(ticket)}</p>
            <h2 className="mt-1 text-2xl font-semibold text-omidesk-navy">{ticket.title}</h2>
            <p className="mt-2 text-sm text-slate-500">Created {formatDateTime(ticket.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <dl className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</dt>
            <dd className="mt-1 text-sm font-medium capitalize text-slate-800">
              {ticket.category ?? ticket.asset?.category ?? 'General'}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Asset Tag</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {ticket.assetTag ?? ticket.asset?.assetTag ?? '—'}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Department</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {ticket.department?.name ?? '—'}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {locationLabel(ticket.location)}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Description</h3>
          <p className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-700">
            {ticket.description}
          </p>
        </div>

        {ticket.assignedTechnician && (
          <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Assigned Technician</p>
            <p className="mt-1 text-sm font-medium text-sky-900">
              {ticket.assignedTechnician.name ?? ticket.assignedTechnician}
            </p>
          </div>
        )}

        {ticket.resolutionNotes && (
          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Resolution Notes</p>
            <p className="mt-1 text-sm text-emerald-900">{ticket.resolutionNotes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
