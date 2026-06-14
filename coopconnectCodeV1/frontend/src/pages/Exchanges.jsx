import React, { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { exchangesApi } from '../api/users'
import {
  ArrowLeft, MessageSquare, CheckCircle, XCircle, Clock,
  Send, ChevronRight, ArrowRight, QrCode
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

function extractQrPayload(value) {
  if (!value) return ''
  try {
    const url = new URL(value)
    return url.searchParams.get('scan') || value
  } catch {
    return value
  }
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
                {!mine && <p className="text-xs font-medium mb-0.5 opacity-70">{m.senderName}</p>}
                <p>{m.content}</p>
                <p className={`text-xs mt-0.5 ${mine ? 'text-white/70' : 'text-stone-500'}`}>{timeAgo(m.sentAt)}</p>
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
          aria-label="Message"
        />
        <button
          type="submit"
          aria-label="Envoyer"
          className="btn-primary px-3 py-2"
          disabled={sending || !newMsg.trim()}
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}

function QrValidationPanel({ exchange, currentUsername, onAction }) {
  const [searchParams] = useSearchParams()
  const [payload, setPayload] = useState('')
  const [scanError, setScanError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const scannerRef = useRef(null)
  const scannerIdRef = useRef(`qr-reader-${exchange.id}`)
  const isRequester = exchange.requesterUsername === currentUsername
  const myPayload = isRequester ? exchange.requesterQrPayload : exchange.providerQrPayload
  const otherSideScannedMe = isRequester ? exchange.providerQrConfirmed : exchange.requesterQrConfirmed
  const iScannedOtherSide = isRequester ? exchange.requesterQrConfirmed : exchange.providerQrConfirmed
  const canUseQr = ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(exchange.status)

  useEffect(() => {
    const exchangeParam = searchParams.get('exchange')
    const scanParam = searchParams.get('scan')
    if (canUseQr && myPayload && exchangeParam === exchange.id && scanParam) {
      setPayload(extractQrPayload(scanParam))
    }
  }, [canUseQr, exchange.id, myPayload, searchParams])

  const publicBaseUrl = import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin
  const qrLink = `${publicBaseUrl}/exchanges?exchange=${encodeURIComponent(exchange.id)}&scan=${encodeURIComponent(myPayload)}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrLink)}`

  const stopCamera = () => {
    scannerRef.current?.stop().catch(() => {})
    scannerRef.current = null
    setCameraOpen(false)
  }

  useEffect(() => stopCamera, [])

  if (!canUseQr || !myPayload) return null

  const startCameraScan = async () => {
    setScanError('')
    try {
      setCameraOpen(true)
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(scannerIdRef.current)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        decoded => {
          setPayload(extractQrPayload(decoded))
          stopCamera()
        },
        () => {}
      )
    } catch {
      setScanError('Impossible d ouvrir la camera. Verifiez les permissions du navigateur.')
      stopCamera()
    }
  }

  const submitScan = async () => {
    if (!payload.trim()) return
    setScanning(true)
    setScanError('')
    try {
      await exchangesApi.scanQr(exchange.id, extractQrPayload(payload.trim()))
      setPayload('')
      onAction()
    } catch (err) {
      setScanError(err.response?.data?.message || 'QR code invalide.')
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="border border-stone-200 rounded-xl p-4 bg-white">
      <p className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 mb-3">
        <QrCode className="w-3.5 h-3.5" /> Validation QR
      </p>
      <div className="grid sm:grid-cols-[180px_1fr] gap-4">
        <div>
          <img src={qrUrl} alt="QR code de validation" className="w-40 h-40 border border-stone-200 rounded-lg" />
          <p className="text-xs text-stone-500 mt-2">A montrer a l'autre participant.</p>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={iScannedOtherSide ? 'badge-green' : 'badge-amber'}>Votre scan: {iScannedOtherSide ? 'fait' : 'en attente'}</span>
            <span className={otherSideScannedMe ? 'badge-green' : 'badge-amber'}>Scan recu: {otherSideScannedMe ? 'fait' : 'en attente'}</span>
          </div>
          <textarea
            className="input w-full text-sm"
            rows={3}
            placeholder="Collez ici le contenu du QR code scanne..."
            value={payload}
            onChange={e => { setPayload(e.target.value); setScanError('') }}
            disabled={exchange.status === 'COMPLETED'}
          />
          {cameraOpen && (
            <div id={scannerIdRef.current} className="w-full rounded-lg overflow-hidden bg-stone-900" />
          )}
          {scanError && <p className="text-xs text-red-600">{scanError}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={startCameraScan}
              disabled={exchange.status === 'COMPLETED' || cameraOpen}
              className="btn-secondary text-sm"
            >
              Scanner avec la camera
            </button>
            {cameraOpen && (
              <button onClick={stopCamera} className="btn-secondary text-sm">
                Fermer la camera
              </button>
            )}
            <button
              onClick={submitScan}
              disabled={scanning || !payload.trim() || exchange.status === 'COMPLETED'}
              className="btn-primary text-sm"
            >
              {exchange.status === 'COMPLETED' ? 'Echange termine' : scanning ? 'Validation...' : 'Valider le QR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExchangeCard({ exchange, currentUsername, onAction }) {
  const [open, setOpen] = useState(false)
  const [responding, setResponding] = useState(false)
  const [responseMsg, setResponseMsg] = useState('')
  const [actionError, setActionError] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const isProvider = exchange.providerUsername === currentUsername
  const isRequester = exchange.requesterUsername === currentUsername
  const conf = STATUS_CONFIG[exchange.status] || { label: exchange.status, color: 'badge-stone' }
  const canAct = isProvider && exchange.status === 'REQUESTED'
  const canCancel = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(exchange.status) && (isRequester || isProvider)

  const handleAccept = async () => {
    setResponding(true)
    setActionError('')
    try {
      await exchangesApi.accept(exchange.id, responseMsg)
      onAction()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Erreur lors de l\'acceptation.')
    } finally {
      setResponding(false)
    }
  }

  const handleReject = async () => {
    setResponding(true)
    setActionError('')
    try {
      await exchangesApi.reject(exchange.id, responseMsg)
      onAction()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Erreur lors du refus.')
    } finally {
      setResponding(false)
    }
  }

  const handleCancel = async () => {
    try {
      await exchangesApi.cancel(exchange.id)
      onAction()
    } catch (err) {
      setShowCancelConfirm(false)
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
                onChange={e => { setResponseMsg(e.target.value); setActionError('') }}
              />
              {actionError && (
                <p className="text-xs text-red-600">{actionError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleAccept}
                  disabled={responding}
                  className="btn-primary flex items-center gap-1.5 text-sm"
                >
                  <CheckCircle className="w-4 h-4" aria-hidden="true" /> Accepter
                </button>
                <button
                  onClick={handleReject}
                  disabled={responding}
                  className="btn-secondary flex items-center gap-1.5 text-sm text-red-600 hover:border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4" aria-hidden="true" /> Refuser
                </button>
              </div>
            </div>
          )}

          {exchange.responseMessage && (
            <div className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
              Réponse : "{exchange.responseMessage}"
            </div>
          )}

          <QrValidationPanel exchange={exchange} currentUsername={currentUsername} onAction={onAction} />

          {/* Chat */}
          <div>
            <p className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-3.5 h-3.5" /> Messages
            </p>
            <Chat exchange={exchange} currentUsername={currentUsername} />
          </div>

          {canCancel && (
            <div className="flex justify-end items-center gap-2">
              {showCancelConfirm ? (
                <>
                  <span className="text-xs text-stone-500">Confirmer l'annulation ?</span>
                  <button
                    onClick={handleCancel}
                    className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="text-xs text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    Non
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-xs text-stone-500 hover:text-red-600 transition-colors"
                >
                  Annuler la demande
                </button>
              )}
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
    <div className="min-h-screen bg-stone-100">
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
          <div className="card p-8 text-center">
            <Clock className="w-8 h-8 text-stone-300 mx-auto mb-3" aria-hidden="true" />
            {filter === 'received' ? (
              <>
                <p className="text-stone-600 font-medium mb-1">Aucune demande reçue</p>
                <p className="text-stone-500 text-sm">Les demandes d'échange sur vos annonces apparaîtront ici.</p>
              </>
            ) : filter === 'sent' ? (
              <>
                <p className="text-stone-600 font-medium mb-2">Aucune demande envoyée</p>
                <p className="text-stone-500 text-sm mb-5">Proposez un échange à partir d'une annonce ou de vos recommandations IA.</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Link to="/browse" className="btn-secondary text-sm">Parcourir les annonces</Link>
                  <Link to="/matches" className="btn-secondary text-sm">Recommandations IA</Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-stone-600 font-medium mb-2">Aucun échange pour l'instant</p>
                <p className="text-stone-500 text-sm mb-5">Parcourez les annonces ou utilisez les recommandations IA pour trouver des échanges.</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Link to="/browse" className="btn-secondary text-sm">Parcourir les annonces</Link>
                  <Link to="/matches" className="btn-secondary text-sm">Recommandations IA</Link>
                </div>
              </>
            )}
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
