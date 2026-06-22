import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import TicketDetailView from '../components/omidesk/TicketDetailView'
import TicketTable from '../components/omidesk/TicketTable'

const STAT_CARDS = [
  { key: 'my_tasks', label: 'My Active Tasks', accent: 'border-indigo-200 bg-indigo-50 text-indigo-800' },
  { key: 'unassigned', label: 'Unassigned Queue', accent: 'border-amber-200 bg-amber-50 text-amber-800' },
  { key: 'resolved_today', label: 'Resolved (All)', accent: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
]

export function TechnicianDashboardPage() {
  const { token, userId, displayName } = useAuth()

  const [activeView, setActiveView] = useState('queue') // 'queue' or 'ticket-detail'
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [filterMode, setFilterMode] = useState('all') // 'all', 'mine', 'unassigned'

  // Resolution Form States
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false)
  const [resolutionStatus, setResolutionStatus] = useState('resolved')

  const fetchTickets = () => {
    if (!token) return
    setLoading(true)
    fetch('/api/tickets', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setTickets(result.data)
          setFetchError('')
        } else {
          setFetchError('Failed to parse active pipeline records from server.')
        }
      })
      .catch(() => setFetchError('Network failure connecting to OmiDesk server.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTickets()
  }, [token])

  // Compute stats on the fly
  const metrics = useMemo(() => {
    const counts = { my_tasks: 0, unassigned: 0, resolved_today: 0 }
    tickets.forEach((ticket) => {
      if (ticket.assignedTechnician?._id === userId && ['assigned', 'in_progress'].includes(ticket.status)) {
        counts.my_tasks += 1
      }
      if (!ticket.assignedTechnician && ticket.status === 'pending') {
        counts.unassigned += 1
      }
      if (['resolved', 'closed'].includes(ticket.status)) {
        counts.resolved_today += 1
      }
    })
    return counts
  }, [tickets, userId])

  // Filter main workspace view dynamically
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (filterMode === 'mine') return ticket.assignedTechnician?._id === userId
      if (filterMode === 'unassigned') return !ticket.assignedTechnician
      return true // 'all'
    })
  }, [tickets, filterMode, userId])

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
    setResolutionNotes(ticket.resolutionNotes || '')
    setResolutionStatus(ticket.status === 'closed' ? 'closed' : 'resolved')
    setActiveView('ticket-detail')
  }

  // Handle resolution submit from detailed panel
  const handleResolveTicketSubmit = async (e) => {
    e.preventDefault()
    if (!resolutionNotes.trim()) {
      alert("Please provide clear notes explaining how the issue was fixed.")
      return
    }

    setIsSubmittingResolution(true)

    try {
      const response = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: resolutionStatus,
          resolutionNotes: resolutionNotes
        })
      })

      const result = await response.json()

      if (result.success) {
        alert("Ticket resolution logged successfully.")
        setActiveView('queue')
        setSelectedTicket(null)
        fetchTickets()
      } else {
        alert(result.message || "Failed to update ticket status.")
      }
    } catch (error) {
      console.error("Error submitting resolution:", error)
      alert("Network error updating execution profiles.")
    } finally {
      setIsSubmittingResolution(false)
    }
  }

  if (activeView === 'ticket-detail' && selectedTicket) {
    return (
      <div className="space-y-6">
        <TicketDetailView
          ticket={selectedTicket}
          onBack={() => {
            setActiveView('queue')
            setSelectedTicket(null)
            fetchTickets()
          }}
        />

        {/* Inline technician utility to submit resolution notes */}
        {['assigned', 'in_progress', 'pending'].includes(selectedTicket.status) && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Finalize Ticket Resolution</h3>
            <p className="text-xs text-slate-500 mb-4">
              Describe the root cause and steps taken to correct the issue. This logs directly into system audit reports.
            </p>

            <form onSubmit={handleResolveTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Resolution Actions Taken
                </label>
                <textarea
                  rows="3"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g., Replaced blown capacitor on the power supply board and ran diagnostic prints."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-4">
                  <label className="inline-flex items-center text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="resolutionStatus"
                      value="resolved"
                      checked={resolutionStatus === 'resolved'}
                      onChange={() => setResolutionStatus('resolved')}
                      className="text-slate-900 focus:ring-slate-900 mr-2"
                    />
                    Mark Resolved
                  </label>
                  <label className="inline-flex items-center text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="resolutionStatus"
                      value="closed"
                      checked={resolutionStatus === 'closed'}
                      onChange={() => setResolutionStatus('closed')}
                      className="text-slate-900 focus:ring-slate-900 mr-2"
                    />
                    Close Permanently
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingResolution}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
                >
                  {isSubmittingResolution ? 'Saving...' : 'Submit Resolution'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">ICT Operations Room</p>
        <h1 className="mt-1 text-3xl font-semibold text-omidesk-navy">
          Technician Workspace{displayName ? `, ${displayName.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Manage system incidents, review asset tags, submit resolution history logs, and coordinate fixes across rooms.
        </p>
      </div>

      {fetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {fetchError}
        </div>
      )}

      {/* KPI Metric Layout */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className={`rounded-2xl border p-5 shadow-sm ${card.accent}`}>
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="mt-2 text-3xl font-bold">{metrics[card.key] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Workspace Controls */}
      <div className="border-b border-slate-200 pb-1 flex gap-4 text-sm font-semibold">
        <button 
          onClick={() => setFilterMode('all')}
          className={`pb-2 px-1 border-b-2 transition-all ${filterMode === 'all' ? 'border-omidesk-navy text-omidesk-navy' : 'border-transparent text-slate-400'}`}
        >
          Master Pipeline ({tickets.length})
        </button>
        <button 
          onClick={() => setFilterMode('mine')}
          className={`pb-2 px-1 border-b-2 transition-all ${filterMode === 'mine' ? 'border-omidesk-navy text-omidesk-navy' : 'border-transparent text-slate-400'}`}
        >
          My Assignments ({metrics.my_tasks})
        </button>
        <button 
          onClick={() => setFilterMode('unassigned')}
          className={`pb-2 px-1 border-b-2 transition-all ${filterMode === 'unassigned' ? 'border-omidesk-navy text-omidesk-navy' : 'border-transparent text-slate-400'}`}
        >
          Unassigned Queue ({metrics.unassigned})
        </button>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-omidesk-navy">Active Tickets Queue</h2>
          {loading && <span className="text-xs text-slate-400">Syncing updates…</span>}
        </div>
        <TicketTable tickets={filteredTickets} onSelectTicket={handleSelectTicket} />
      </div>
    </section>
  )
}

