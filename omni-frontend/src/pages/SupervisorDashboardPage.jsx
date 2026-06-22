import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function SupervisorDashboardPage() {
  const { token } = useAuth()
  
  // Tab control state: 'analytics' or 'config'
  const [activeTab, setActiveTab] = useState('analytics')
  
  // Datasets loaded from backend
  const [rankingData, setRankingData] = useState([])
  const [unassignedTickets, setUnassignedTickets] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [departments, setDepartments] = useState([])
  const [locations, setLocations] = useState([])

  // UI State management
  const [loadingReports, setLoadingReports] = useState(true)
  const [errorLog, setErrorLog] = useState('')
  const [selectedTech, setSelectedTech] = useState(null)
  const [techHistory, setTechHistory] = useState([])

  // Dynamic dropdown selection maps for reassigning tickets
  const [assignmentState, setAssignmentState] = useState({})

  // Form Management States
  const [deptForm, setDeptForm] = useState({ name: '', description: '' })
  const [locForm, setLocForm] = useState({ building: '', floor: '', room: '', department: '' })
  const [assetForm, setAssetForm] = useState({
    assetTag: '', name: '', category: 'computer', serialNumber: '',
    manufacturer: '', location: '', department: '', purchaseDate: '', warrantyExpiry: ''
  })

  const [formSuccessMessage, setFormSuccessMessage] = useState('')
  const [formErrorMessage, setFormErrorMessage] = useState('')

  // Load all triage cues and reporting parameters
  const loadDashboardData = async () => {
    if (!token) return
    setLoadingReports(true)

    try {
      // 1. Fetch Technician Leaderboard
      const rankingRes = await fetch('/api/reports/technician-ranking', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const rankingResult = await rankingRes.json()
      if (rankingResult.success) setRankingData(rankingResult.data || [])

      // 2. Fetch Unassigned/Pending Tickets Pipeline
      const ticketRes = await fetch('/api/tickets?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const ticketResult = await ticketRes.json()
      if (ticketResult.success) {
        setUnassignedTickets(ticketResult.data || [])
      }

      // 3. Fetch Master User Pool to isolate users with the "technician" role
      const usersRes = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const usersResult = await usersRes.json()
      if (usersResult.success && Array.isArray(usersResult.data)) {
        const filteredTechs = usersResult.data.filter(user => user.role === 'technician')
        setTechnicians(filteredTechs)
      }

      // 4. Fetch Form Infrastructure Dependents
      const setupRes = await fetch('/api/setup-data')
      const setupResult = await setupRes.json()
      if (setupResult.success) {
        setDepartments(setupResult.departments || [])
        setLocations(setupResult.locations || [])
      }

      setErrorLog('')
    } catch (err) {
      setErrorLog('Network dependency failure syncing active triage streams.')
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
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

  // 💡 EXECUTE REASSIGNMENT TRANSACTION CALL
  const handleAssignTechnician = async (ticketId) => {
    const selectedTechId = assignmentState[ticketId]
    if (!selectedTechId) {
      alert("Please select a valid operator from the pool first.")
      return
    }

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          assignedTechnician: selectedTechId,
          status: 'assigned' // Automatically bumps out of pending state
        })
      })

      const result = await response.json()
      if (result.success) {
        alert("Ticket assigned and pushed to the technician's queue successfully!")
        loadDashboardData() // Instantly refresh triage lists
      } else {
        alert(result.message || "Failed to update target route parameters.")
      }
    } catch (error) {
      console.error(error)
      alert("Network exception firing delegation sequence.")
    }
  }

  const handleConfigSubmit = async (e, endpoint, payload, clearFormCallback) => {
    e.preventDefault()
    setFormSuccessMessage('')
    setFormErrorMessage('')

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setFormSuccessMessage('Configuration record added successfully!')
        clearFormCallback()
        loadDashboardData()
      } else {
        setFormErrorMessage(result.message || 'Failed to submit settings.')
      }
    } catch (error) {
      setFormErrorMessage('Network exception finalizing transaction configuration.')
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Management Controls</p>
          <h1 className="mt-1 text-3xl font-semibold text-omidesk-navy">Supervisor Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Triage new system complaints, delegate tickets to technicians, and initialize core infrastructural assets setup.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 bg-slate-100 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-white text-omidesk-navy shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Performance Metrics
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'config' ? 'bg-white text-omidesk-navy shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            System Configurations
          </button>
        </div>
      </div>

      {errorLog && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-700 rounded-lg">
          {errorLog}
        </div>
      )}

      {/* VIEW PANEL 1: PERFORMANCE MATRIX AND LIVE MANIFEST TRIAGE */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* 💡 NEW SUBSECTION: MANUAL TICKETING TRIAGE CONTROLS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-slate-900">Unassigned Incoming Tickets Queue</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {unassignedTickets.length} Awaiting Actions
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Review incoming incident reports and delegate operators below.</p>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                    <th className="p-3 text-xs uppercase tracking-wider">Ticket Details</th>
                    <th className="p-3 text-xs uppercase tracking-wider">Location / Dept</th>
                    <th className="p-3 text-xs uppercase tracking-wider">Priority</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-right">Delegate Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unassignedTickets.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center p-8 text-slate-400 text-xs">
                        🎉 Splendid! No unassigned manual issues waiting in triage buffers.
                      </td>
                    </tr>
                  ) : (
                    unassignedTickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-slate-50/50 transition">
                        <td className="p-3 max-w-[280px]">
                          <p className="font-semibold text-slate-800 truncate">{ticket.title}</p>
                          <p className="text-xs text-slate-400 line-clamp-1">{ticket.description}</p>
                        </td>
                        <td className="p-3 text-xs text-slate-600">
                          <p className="font-medium">{ticket.department?.name || 'Unknown'}</p>
                          <p className="text-slate-400">{ticket.location ? `${ticket.location.floor}, ${ticket.location.room}` : 'N/A'}</p>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                            ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <select
                              value={assignmentState[ticket._id] || ''}
                              onChange={(e) => setAssignmentState({ ...assignmentState, [ticket._id]: e.target.value })}
                              className="px-2 py-1.5 border border-slate-300 bg-white rounded-lg text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                            >
                              <option value="">-- Choose Operator --</option>
                              {technicians.map(t => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignTechnician(ticket._id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow transition"
                            >
                              Assign
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Charts Matrices Block */}
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
        </div>
      )}

      {/* VIEW PANEL 2: CONFIGURATIONS */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {formSuccessMessage && <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-700">{formSuccessMessage}</div>}
          {formErrorMessage && <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">{formErrorMessage}</div>}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form A: Add Department */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold uppercase text-slate-900 tracking-wider mb-3">1. Add Department</h3>
              <form onSubmit={(e) => handleConfigSubmit(e, '/api/departments', deptForm, () => setDeptForm({ name: '', description: '' }))} className="space-y-3">
                <input
                  type="text" placeholder="Department Name (e.g., Accounts)" required
                  value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <textarea
                  placeholder="Functional Scope Summary" rows="2" required
                  value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none resize-none"
                />
                <button type="submit" className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition">Save Department</button>
              </form>
            </div>

            {/* Form B: Add Location */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold uppercase text-slate-900 tracking-wider mb-3">2. Register Location</h3>
              <form onSubmit={(e) => handleConfigSubmit(e, '/api/locations', locForm, () => setLocForm({ building: '', floor: '', room: '', department: '' }))} className="space-y-3">
                <input
                  type="text" placeholder="Building Block" required
                  value={locForm.building} onChange={(e) => setLocForm({ ...locForm, building: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text" placeholder="Floor" required
                    value={locForm.floor} onChange={(e) => setLocForm({ ...locForm, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                  <input
                    type="text" placeholder="Room/Office" required
                    value={locForm.room} onChange={(e) => setLocForm({ ...locForm, room: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <select
                  required value={locForm.department} onChange={(e) => setLocForm({ ...locForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="">-- Assign Department --</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <button type="submit" className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition">Save Location Block</button>
              </form>
            </div>

            {/* Form C: Add Asset */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold uppercase text-slate-900 tracking-wider mb-3">3. Inventory Asset</h3>
              <form onSubmit={(e) => handleConfigSubmit(e, '/api/assets', assetForm, () => setAssetForm({ assetTag: '', name: '', category: 'computer', serialNumber: '', manufacturer: '', location: '', department: '', purchaseDate: '', warrantyExpiry: '' }))} className="space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text" placeholder="Asset Tag ID *" required
                    value={assetForm.assetTag} onChange={(e) => setAssetForm({ ...assetForm, assetTag: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                  <input
                    type="text" placeholder="Hardware Name *" required
                    value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text" placeholder="Serial Num *" required
                    value={assetForm.serialNumber} onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                  <input
                    type="text" placeholder="Manufacturer *" required
                    value={assetForm.manufacturer} onChange={(e) => setAssetForm({ ...assetForm, manufacturer: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={assetForm.category} onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 bg-white rounded-lg text-xs focus:outline-none"
                  >
                    {['computer', 'printer', 'projector', 'switch', 'router', 'server', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    required value={assetForm.department} onChange={(e) => setAssetForm({ ...assetForm, department: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 bg-white rounded-lg text-xs focus:outline-none"
                  >
                    <option value="">-- Dept --</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <select
                  required value={assetForm.location} onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 bg-white rounded-lg text-xs focus:outline-none"
                >
                  <option value="">-- Select Office Location Room --</option>
                  {locations.map(l => <option key={l._id} value={l._id}>{l.floor}, {l.room} ({l.building})</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-500">
                  <div>
                    <label className="block mb-0.5">Purchase Date</label>
                    <input type="date" required value={assetForm.purchaseDate} onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })} className="w-full p-1.5 border rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block mb-0.5">Warranty Expiry</label>
                    <input type="date" required value={assetForm.warrantyExpiry} onChange={(e) => setAssetForm({ ...assetForm, warrantyExpiry: e.target.value })} className="w-full p-1.5 border rounded-lg text-xs" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2 mt-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition">Commit to Inventory</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}