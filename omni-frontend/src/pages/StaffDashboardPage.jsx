import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { DEMO_TICKETS } from '../data/omidesk'
import RaiseTicketForm from '../components/omidesk/RaiseTicketForm'
import TicketDetailView from '../components/omidesk/TicketDetailView'
import TicketTable from '../components/omidesk/TicketTable'

const SUMMARY_CARDS = [
  { key: 'pending', label: 'Pending', accent: 'border-amber-200 bg-amber-50 text-amber-800' },
  { key: 'in_progress', label: 'In Progress', accent: 'border-indigo-200 bg-indigo-50 text-indigo-800' },
  { key: 'resolved', label: 'Resolved', accent: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
]

export function StaffDashboardPage() {
  const { token, displayName } = useAuth()

  const [activeView, setActiveView] = useState('dashboard')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [tickets, setTickets] = useState(DEMO_TICKETS)
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    if (!token) return

    setLoadingTickets(true)
    fetch('/api/tickets', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setTickets(result.data.length ? result.data : DEMO_TICKETS)
          setFetchError('')
        } else {
          setFetchError('Showing sample tickets — connect to the backend for live data.')
        }
      })
      .catch(() => {
        setFetchError('Unable to reach the server. Showing sample tickets.')
      })
      .finally(() => setLoadingTickets(false))
  }, [token])

  const summary = useMemo(() => {
    const counts = { pending: 0, in_progress: 0, resolved: 0 }
    tickets.forEach((ticket) => {
      if (ticket.status === 'pending' || ticket.status === 'assigned') counts.pending += 1
      if (ticket.status === 'in_progress') counts.in_progress += 1
      if (ticket.status === 'resolved' || ticket.status === 'closed') counts.resolved += 1
    })
    return counts
  }, [tickets])

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
    setActiveView('ticket-detail')
  }

  const handleTicketCreated = (ticket) => {
    setTickets((prev) => [ticket, ...prev])
    setActiveView('dashboard')
  }

  if (activeView === 'ticket-detail' && selectedTicket) {
    return (
      <TicketDetailView
        ticket={selectedTicket}
        onBack={() => {
          setActiveView('dashboard')
          setSelectedTicket(null)
        }}
      />
    )
  }

  return (
    <>
      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Staff Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold text-omidesk-navy">
              Welcome{displayName ? `, ${displayName.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Track your active support requests, raise new tickets, and stay updated on ICT resolutions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('raise-ticket')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-omidesk-navy px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-omidesk-navy focus:ring-offset-2 sm:hidden"
          >
            + Raise a Ticket
          </button>
        </div>

        {fetchError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {fetchError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {SUMMARY_CARDS.map((card) => (
            <div
              key={card.key}
              className={`rounded-2xl border p-5 shadow-sm ${card.accent}`}
            >
              <p className="text-sm font-medium opacity-80">{card.label}</p>
              <p className="mt-2 text-3xl font-bold">{summary[card.key] ?? 0}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-omidesk-navy">My Recent Tickets</h2>
              {loadingTickets && (
                <span className="text-xs text-slate-400">Loading…</span>
              )}
            </div>
            <TicketTable tickets={tickets} onSelectTicket={handleSelectTicket} />
          </div>

          <button
            type="button"
            onClick={() => setActiveView('raise-ticket')}
            className="hidden h-fit flex-col items-start rounded-2xl border border-omidesk-navy bg-omidesk-navy p-6 text-left text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-omidesk-navy focus:ring-offset-2 lg:flex"
          >
            <span className="text-3xl leading-none">+</span>
            <span className="mt-4 text-lg font-semibold">Raise a Ticket</span>
            <span className="mt-2 text-sm text-slate-300">
              Report hardware, network, or software issues to the ICT team.
            </span>
          </button>
        </div>
      </section>

      {activeView === 'raise-ticket' && (
        <RaiseTicketForm
          token={token}
          onClose={() => setActiveView('dashboard')}
          onSubmit={handleTicketCreated}
        />
      )}

      <button
        type="button"
        onClick={() => setActiveView('raise-ticket')}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-omidesk-navy text-2xl text-white shadow-xl transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-omidesk-navy focus:ring-offset-2 lg:hidden"
        aria-label="Raise a ticket"
      >
        +
      </button>
    </>
  )
}
