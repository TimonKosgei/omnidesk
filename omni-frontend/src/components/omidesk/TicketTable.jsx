import PriorityBadge from './PriorityBadge'
import StatusBadge from './StatusBadge'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function ticketId(ticket) {
  const id = ticket._id ?? ticket.id ?? ''
  return id.startsWith('demo-') ? id.toUpperCase() : `#${String(id).slice(-6).toUpperCase()}`
}

export default function TicketTable({ tickets, onSelectTicket }) {
  if (!tickets.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-600">No tickets yet</p>
        <p className="mt-1 text-sm text-slate-400">Raise your first support request to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {['Ticket ID', 'Title', 'Priority', 'Status', 'Date Created', ''].map((heading) => (
                <th
                  key={heading || 'action'}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr key={ticket._id ?? ticket.id} className="hover:bg-slate-50/80">
                <td className="whitespace-nowrap px-4 py-4 text-sm font-mono font-medium text-omidesk-navy">
                  {ticketId(ticket)}
                </td>
                <td className="max-w-xs truncate px-4 py-4 text-sm text-slate-700">{ticket.title}</td>
                <td className="whitespace-nowrap px-4 py-4">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                  {formatDate(ticket.createdAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectTicket(ticket)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-omidesk-navy transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-omidesk-navy focus:ring-offset-2"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
