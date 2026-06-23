export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://omnidesk-backend-qrhy.onrender.com'
export const STORAGE_KEY = 'omidesk-auth'

export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'critical']

export const TICKET_STATUSES = ['pending', 'assigned', 'in_progress', 'resolved', 'closed']

export const TICKET_CATEGORIES = ['computer', 'printer', 'network', 'software', 'other']

export const DEMO_TICKETS = [
  {
    _id: 'demo-001',
    title: 'Laptop not connecting to Wi-Fi',
    description: 'Office laptop drops connection every few minutes.',
    priority: 'high',
    status: 'in_progress',
    category: 'network',
    createdAt: '2026-06-18T09:30:00.000Z',
  },
  {
    _id: 'demo-002',
    title: 'Printer jam on 3rd floor',
    description: 'HP LaserJet shows paper jam error but tray is clear.',
    priority: 'medium',
    status: 'assigned',
    category: 'printer',
    createdAt: '2026-06-17T14:15:00.000Z',
  },
  {
    _id: 'demo-003',
    title: 'Software license renewal',
    description: 'Microsoft Office activation expired on shared PC.',
    priority: 'low',
    status: 'resolved',
    category: 'software',
    createdAt: '2026-06-10T11:00:00.000Z',
  },
]
