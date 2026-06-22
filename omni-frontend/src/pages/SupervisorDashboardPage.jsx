import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function SupervisorDashboardPage() {
  const { token } = useAuth()
  const [rankingData, setRankingData] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [errorLog, setErrorLog] = useState('')
  const [selectedTech, setSelectedTech] = useState(null)
  const [techHistory, setTechHistory] = useState([])

  // Load analytical rankings array
  useEffect(() => {
    if (!token) return
    fetch('/api/reports/technician-ranking', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setRankingData(result.data || [])
        else setErrorLog('Unauthorized permission authorization required to process reports.')
      })
      .catch(() => setErrorLog('Network error generating analytics pipeline.'))
      .finally(() => setLoadingReports(false))
  }, [token])

  // Drill down to see individual historical log portfolio
  const handleViewTechHistory = async (techId, techName) => {
    try {
      const res = await fetch(`/api/reports/technician-history/${techId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await res.json()
      if (result.success) {
        setSelectedTech(techName)
        setTechHistory(result.data || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Management Controls</p>
        <h1 className="mt-1 text-3xl font-semibold text-omidesk-navy">Supervisor Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Monitor response matrices, tracking fulfillment logs, and optimize deployment speeds within the Ministry.
        </p>
      </div>

      {errorLog && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-700 rounded-lg">
          {errorLog}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Leaderboard Section */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-omidesk-navy">Technician Leaderboard</h2>
            {loadingReports && <span className="text-xs text-slate-400">Processing aggregates…</span>}
          </div>
          
          <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
            {rankingData.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No structural resolution records found.</p>
            ) : (
              rankingData.map((tech, index) => (
                <div key={tech._id} className="flex items-center justify-between py-3 hover:bg-slate-50/50 px-2 rounded-lg transition">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${index === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{tech.name}</p>
                      <p className="text-xs text-slate-400">{tech.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                      {tech.fulfilledCount} Resolved
                    </span>
                    <button
                      onClick={() => handleViewTechHistory(tech._id, tech.name)}
                      className="text-xs text-omidesk-navy font-semibold hover:underline"
                    >
                      Audit Log →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detailed Drilled Down Logs Portfolio Container */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-omidesk-navy">
            {selectedTech ? `Fulfillment Portfolio: ${selectedTech}` : 'Select a Technician to Audit'}
          </h2>
          <p className="text-xs text-slate-400 mb-4">Review complete ticket lifecycle files processed by the selected operator.</p>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {!selectedTech ? (
              <div className="h-48 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-sm text-slate-400">
                Click "Audit Log" to load performance assets history.
              </div>
            ) : techHistory.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No completed ticket tracks linked to this profile.</p>
            ) : (
              techHistory.map((ticket) => (
                <div key={ticket._id} className="p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/40">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800 truncate max-w-[70%]">{ticket.title}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ticket.description}</p>
                  {ticket.resolutionNotes && (
                    <div className="mt-2 text-xs p-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-md">
                      <strong>Resolution Note:</strong> {ticket.resolutionNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  )
}