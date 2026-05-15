import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { exchangesApi } from '../api/users'
import {
  ArrowLeft, MessageSquare, CheckCircle, XCircle, Clock,
  Send, ChevronRight, ArrowRight
} from 'lucide-react'

const STATUS_CONFIG = {
  REQUESTED:   { label: 'En attente',  color: 'badge-amber' },
  ACCEPTED:    { label: 'Accepté',     color: 'badge-green' },
  REJECTED:    { label: 'Refusé',      color: 'badge-stone' },
  CANCELLED:   { label: 'Annulé',      color: 'badge-stone' },
  IN_PROGRESS: { label: 'En cours',    color: 'badge-blue' },
  COMPLETED:   { label: 'Complété',    color: 'badge-green' },
  DISPUTED:    { label: 'Litige',      color: 'badge-amber' },
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${Math.floor(hours / 24)}j`
}

function Chat({ exchange, currentUsername }) {
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    exchangesApi.getMessages(exchange.id)
      .then(res => setMessages(res.data || []))
      .catch(() => {})
  }, [exchange.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!newMsg.trim()) return
    setSending(true)
    try {
      const res = await exchangesApi.sendMessage(exchange.id, newMsg.trim())
      setMessages(prev => [...prev, res.data])
      setNewMsg('')
    } catch {}
    setSending(false)
  }

  return (
    <div className="flex flex-col h-80">
      <div className="flex-1 overflow-y-auto space-y-2 px-1 py-2">
        {messages.length === 0 && (
          <p className="text-xs text-stone-400 text-center py-6">Aucun message. Démarrez la conversation.</p>
        )}
        {messages.map(m => {
          const mine = m.senderUsername === currentUsername
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${mine ? 'bg-forest-800 text-white' : 'bg-stone-100 text-stone-800'}`}>
                {!mine && <p className="text-xs font-medium mb-0.5 opacity-60">{m.senderName}</p>}
                <p>{m.content}</p>
                <p className={`text-xs mt-0.5 ${mine ? 'text-white/50' : 'text-stone-400'}`}>{timeAgo(m.sentAt)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 pt-2 border-t border-stone-100">
        <input
          className="input flex-1 text-sm"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Écrire un message..."
          disabled={sending}
        />
        <button type="submit" className="btn-primary px-3 py-2" disabled={sending || !newMsg.trim()}>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

function ExchangeCard({ exchange, currentUsername, onAction }) {
  const [open, setOpen] = useState(false)
  const [responding, setResponding] = useState(false)
  const [responseMsg, setResponseMsg] = useState('')

  const isProvider = exchange.providerUsername === currentUsername
  const isRequester = exchange.requesterUsername === currentUsername
  const conf = STATUS_CONFIG[exchange.status] || { label: exchange.status, color: 'badge-stone' }
  const canAct = isProvider && exchange.status === 'REQUESTED'
  const canCancel = exchange.status === 'REQUESTED' && (isRequester || isProvider)

  const handleAccept = async () => {
    setResponding(true)
    try {
      await exchangesApi.accept(exchange.id, responseMsg)
      onAction()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setResponding(false)
    }
  }

  const handleReject = async () => {
    setResponding(true)
    try {
      await exchangesApi.reject(exchange.id, responseMsg)
      onAction()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setResponding(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Annuler cette demande d\'échange ?')) return
    try {
      await exchangesApi.cancel(exchange.id)
      onAction()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    }
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-stone-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={conf.color}>{conf.label}</span>
            {isProvider ? (
              <span className="text-xs text-stone-400">Reçu de <strong>{exchange.requesterName}</strong></span>
            ) : (
              <span className="text-xs text-stone-400">Envoyé à <strong>{exchange.providerName}</strong></span>
            )}
          </div>
          <Link
            to={`/listings/${exchange.listingId}`}
            onClick={e => e.stopPropagation()}
            className="text-sm font-medium text-stone-900 hover:text-forest-800 transition-colors flex items-center gap-1"
          >
            {exchange.listingTitle}
            <ArrowRight className="w-3 h-3 inline" />
          </Link>
          {exchange.requestMessage && (
            <p className="text-xs text-stone-500 mt-1 line-clamp-1">"{exchange.requestMessage}"</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-stone-400">{timeAgo(exchange.createdAt)}</span>
          <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-100 p-4 space-y-4">
          {/* Action panel for provider */}
          {canAct && (
            <div className="bg-amber-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-stone-900">Répondre à cette demande</p>
              <textarea
                className="input w-full text-sm"
                rows={2}
                placeholder="Message optionnel..."
                value={responseMsg}
                onChange={e => setResponseMsg(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAccept}
                  disabled={responding}
                  className="btn-primary flex items-center gap-1.5 text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Accepter
                </button>
                <button
                  onClick={handleReject}
                  disabled={responding}
                  className="btn-secondary flex items-center gap-1.5 text-sm text-red-600 hover:border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4" /> Refuser
                </button>
              </div>
            </div>
          )}

          {exchange.responseMessage && (
            <div className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
              Réponse : "{exchange.responseMessage}"
            </div>
          )}

          {/* Chat */}
          <div>
            <p className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-3.5 h-3.5" /> Messages
            </p>
            <Chat exchange={exchange} currentUsername={currentUsername} />
          </div>

          {canCancel && (
            <div className="flex justify-end">
              <button onClick={handleCancel} className="text-xs text-stone-400 hover:text-red-600 transition-colors">
                Annuler la demande
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Exchanges() {
  const { user } = useAuth()
  const [exchanges, setExchanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'received' | 'sent'

  const load = () => {
    setLoading(true)
    exchangesApi.getMy()
      .then(res => setExchanges(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = exchanges.filter(e => {
    if (filter === 'received') return e.providerUsername === user?.username
    if (filter === 'sent') return e.requesterUsername === user?.username
    return true
  })

  const pending = exchanges.filter(e => e.status === 'REQUESTED' && e.providerUsername === user?.username).length

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/profile" className="text-stone-500 hover:text-stone-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-stone-900">Mes échanges</h1>
            <p className="text-sm text-stone-500">
              {exchanges.length} échange{exchanges.length !== 1 ? 's' : ''}
              {pending > 0 && <span className="ml-2 badge-amber">{pending} en attente</span>}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'received', label: 'Reçus' },
            { key: 'sent', label: 'Envoyés' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${filter === key ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-stone-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-stone-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <Clock className="w-8 h-8 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">Aucun échange pour l'instant.</p>
            <Link to="/browse" className="btn-secondary text-sm mt-4 inline-flex">
              Parcourir les annonces
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(e => (
              <ExchangeCard
                key={e.id}
                exchange={e}
                currentUsername={user?.username}
                onAction={load}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
