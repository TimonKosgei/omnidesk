import { useEffect, useState } from 'react'
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../../data/omidesk'

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  priority: 'medium',
  assetTag: '',
  department: '',
  location: '',
}

function FieldError({ show, message }) {
  if (!show) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

export default function RaiseTicketForm({ token, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [touched, setTouched] = useState({})
  const [departments, setDepartments] = useState([])
  const [locations, setLocations] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/setup-data')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setDepartments(result.departments ?? [])
          setLocations(result.locations ?? [])
        }
      })
      .catch(() => {})
  }, [])

  const filteredLocations = form.department
    ? locations.filter((loc) => String(loc.department) === String(form.department))
    : locations

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'department') next.location = ''
      return next
    })
    setError('')
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const isEmpty = (field) => !String(form[field] ?? '').trim()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched({ title: true, description: true, category: true, priority: true, department: true, location: true })

    if (isEmpty('title') || isEmpty('description') || isEmpty('category') || isEmpty('priority') || isEmpty('department') || isEmpty('location')) {
      return
    }

    setSubmitting(true)
    setError('')

    const descriptionParts = [`Category: ${form.category}`]
    if (form.assetTag.trim()) descriptionParts.push(`Asset Tag: ${form.assetTag.trim()}`)
    descriptionParts.push('', form.description.trim())

    const payload = {
      title: form.title.trim(),
      description: descriptionParts.join('\n'),
      department: form.department,
      location: form.location,
      priority: form.priority,
    }

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message ?? 'Failed to create ticket')
      }

      onSubmit({ ...result.data, category: form.category, assetTag: form.assetTag.trim() || undefined })
      setForm(EMPTY_FORM)
      setTouched({})
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field, required = true) => {
    const invalid = required && touched[field] && isEmpty(field)
    return [
      'w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 shadow-sm transition',
      'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-omidesk-navy focus:border-transparent',
      invalid ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white',
    ].join(' ')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-omidesk-navy/40 p-4 sm:items-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-omidesk-navy">Raise a Ticket</h2>
            <p className="text-sm text-slate-500">Describe your IT issue and we will assign a technician.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-omidesk-navy"
            aria-label="Close form"
          >
            ✕
          </button>
        </div>

        <form className="space-y-5 px-6 py-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              onBlur={() => handleBlur('title')}
              className={inputClass('title')}
              placeholder="Brief summary of the issue"
            />
            <FieldError show={touched.title && isEmpty('title')} message="Title is required." />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              className={inputClass('description')}
              placeholder="Provide details about what happened and any error messages"
            />
            <FieldError show={touched.description && isEmpty('description')} message="Description is required." />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                onBlur={() => handleBlur('category')}
                className={inputClass('category')}
              >
                <option value="">Select category</option>
                {TICKET_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <FieldError show={touched.category && isEmpty('category')} message="Please select a category." />
            </div>

            <div>
              <label htmlFor="priority" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                onBlur={() => handleBlur('priority')}
                className={inputClass('priority')}
              >
                {TICKET_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="assetTag" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Asset Tag <span className="font-normal normal-case text-slate-400">(optional)</span>
            </label>
            <input
              id="assetTag"
              name="assetTag"
              value={form.assetTag}
              onChange={handleChange}
              className={inputClass('assetTag', false)}
              placeholder="e.g. ICT-LPT-0042"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="department" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                onBlur={() => handleBlur('department')}
                className={inputClass('department')}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
              <FieldError show={touched.department && isEmpty('department')} message="Department is required." />
            </div>

            <div>
              <label htmlFor="location" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                onBlur={() => handleBlur('location')}
                className={inputClass('location')}
                disabled={!form.department && filteredLocations.length === 0}
              >
                <option value="">Select location</option>
                {filteredLocations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.building} — {loc.floor}, {loc.room}
                  </option>
                ))}
              </select>
              <FieldError show={touched.location && isEmpty('location')} message="Location is required." />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-omidesk-navy focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-omidesk-navy px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-omidesk-navy focus:ring-offset-2 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
