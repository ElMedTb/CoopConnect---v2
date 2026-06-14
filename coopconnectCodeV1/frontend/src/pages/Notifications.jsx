import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, ArrowRight } from 'lucide-react'
import { notificationsApi } from '../api/users'

function label(type) {
  if (type === 'EXCHANGE_REQUEST') return 'Demande'
  if (type === 'EXCHANGE_ACCEPTED') return 'Accepte'
  if (type === 'EXCHANGE_REJECTED') return 'Refuse'
  if (type === 'EXCHANGE_COMPLETED') return 'Termine'
  if (type === 'MESSAGE') return 'Message'
  return 'Info'
}

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    notificationsApi.getMy()
      .then(res => setItems(res.data?.content || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markAll = async () => {
    await notificationsApi.markAllRead()
    load()
  }

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      await notificationsApi.markRead(notification.id)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-lg font-bold text-stone-900">Notifications</h1>
            <p className="text-sm text-stone-500">{items.length} notification{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={markAll} className="btn-secondary text-sm">
            <CheckCheck className="w-4 h-4" />
            Tout lire
          </button>
        </div>

        {loading ? (
          <div className="card p-6 text-sm text-stone-500">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="card p-8 text-center">
            <Bell className="w-8 h-8 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-600 font-medium">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <Link
                key={item.id}
                to={item.targetUrl || '/dashboard'}
                onClick={() => openNotification(item)}
                className={`card p-4 flex items-center justify-between gap-3 transition-colors ${item.isRead ? 'bg-white' : 'bg-forest-50 border-forest-100'}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-stone">{label(item.type)}</span>
                    {!item.isRead && <span className="w-2 h-2 rounded-full bg-forest-700" />}
                  </div>
                  <p className="text-sm font-medium text-stone-900">{item.title}</p>
                  <p className="text-sm text-stone-500 line-clamp-2">{item.message}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
