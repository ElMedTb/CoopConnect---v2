import React, { useEffect, useState } from 'react'
import { adminApi, usersApi } from '../api/users'
import { Activity, ArrowLeftRight, RefreshCw, ShieldCheck, Sparkles, Users } from 'lucide-react'

function formatPlan(user) {
  if (user.premiumActive) return 'PREMIUM'
  return user.subscriptionPlan || 'STANDARD'
}

function pct(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

function Stat({ label, value, hint, icon: Icon }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-stone-400" aria-hidden="true" />}
      </div>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      {hint && <p className="text-xs text-stone-500 mt-1 leading-relaxed">{hint}</p>}
    </div>
  )
}

function StatusRows({ values }) {
  return (
    <div className="divide-y divide-stone-100">
      {Object.entries(values || {}).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between py-2 text-sm">
          <span className="text-stone-600">{key}</span>
          <span className="font-semibold text-stone-900">{value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminUsers() {
  const [tab, setTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [exchanges, setExchanges] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')

  const loadAll = () => {
    setLoading(true)
    setError('')
    Promise.all([
      adminApi.getStats(),
      usersApi.adminList({ page: 0, size: 100 }),
      adminApi.getExchanges({ page: 0, size: 50 }),
    ])
      .then(([statsRes, usersRes, exchangesRes]) => {
        setStats(statsRes.data)
        setUsers(usersRes.data?.content || [])
        setExchanges(exchangesRes.data?.content || [])
      })
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger les donnees admin.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
  }, [])

  const updatePlan = async (user, plan) => {
    setSavingId(user.id)
    setError('')
    try {
      const { data } = await usersApi.adminUpdateSubscription(user.id, {
        subscriptionPlan: plan,
        matchingMonthlyQuota: user.matchingMonthlyQuota || 3,
      })
      setUsers((items) => items.map((item) => (item.id === user.id ? data : item)))
      adminApi.getStats().then((res) => setStats(res.data)).catch(() => {})
    } catch (err) {
      setError(err.response?.data?.message || 'Mise a jour impossible.')
    } finally {
      setSavingId('')
    }
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest-700" aria-hidden="true" />
            <h1 className="page-header">Administration</h1>
          </div>
          <button onClick={loadAll} className="btn-secondary text-xs px-3 py-1.5 w-fit">
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Actualiser
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            ['overview', 'Vue globale'],
            ['exchanges', 'Echanges'],
            ['users', 'Utilisateurs'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                tab === id ? 'bg-forest-800 text-white border-forest-800' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="card p-8 text-center text-stone-500">Chargement...</div>
        ) : tab === 'overview' ? (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat icon={Users} label="Utilisateurs" value={stats?.totalUsers || 0} hint={`${stats?.activeUsers || 0} actifs`} />
              <Stat icon={Sparkles} label="Premium" value={stats?.premiumUsers || 0} hint={`Conversion: ${pct(stats?.premiumConversionRate)}`} />
              <Stat icon={ArrowLeftRight} label="Echanges" value={stats?.totalExchanges || 0} hint={`Completion: ${pct(stats?.exchangeCompletionRate)}`} />
              <Stat icon={Activity} label="Matching IA" value={stats?.monthlyMatchingUsage || 0} hint={`${stats?.standardUsersAtQuota || 0} standards au quota`} />
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="card p-5">
                <h2 className="section-title mb-4">Qualite utilisateurs</h2>
                <StatusRows values={{
                  'Email verifies': pct(stats?.emailVerificationRate),
                  'Telephone verifies': pct(stats?.phoneVerificationRate),
                  'Onboarding complet': pct(stats?.onboardingCompletionRate),
                  'Credibilite validee': pct(stats?.credibilityVerificationRate),
                }} />
              </div>
              <div className="card p-5">
                <h2 className="section-title mb-4">Pipeline echanges</h2>
                <StatusRows values={stats?.exchangesByStatus} />
              </div>
              <div className="card p-5">
                <h2 className="section-title mb-4">Sante marketplace</h2>
                <StatusRows values={{
                  'Annonces totales': stats?.totalListings || 0,
                  'Annonces actives': stats?.activeListings || 0,
                  'Annonces echangees': stats?.exchangedListings || 0,
                  'Actives / utilisateur actif': stats?.activeListingsPerActiveUser || 0,
                  'QR completion': pct(stats?.qrCompletionRate),
                  'Temps moyen completion': stats?.averageCompletionHours == null ? 'N/A' : `${stats.averageCompletionHours} h`,
                }} />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="card p-5">
                <h2 className="section-title mb-4">Utilisateurs par type</h2>
                <StatusRows values={stats?.usersByType} />
              </div>
              <div className="card p-5">
                <h2 className="section-title mb-4">Annonces par statut</h2>
                <StatusRows values={stats?.listingsByStatus} />
              </div>
            </div>
          </div>
        ) : tab === 'exchanges' ? (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Annonce</th>
                    <th className="text-left font-semibold px-4 py-3">Participants</th>
                    <th className="text-left font-semibold px-4 py-3">Statut</th>
                    <th className="text-left font-semibold px-4 py-3">QR</th>
                    <th className="text-left font-semibold px-4 py-3">Duree</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {exchanges.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-500">Aucun echange.</td></tr>
                  ) : exchanges.map((exchange) => (
                    <tr key={exchange.id} className="bg-white">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-900">{exchange.listingTitle}</p>
                        {exchange.offeredListingTitle && <p className="text-xs text-stone-500">Contre: {exchange.offeredListingTitle}</p>}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        <p>{exchange.requesterName}</p>
                        <p className="text-xs text-stone-400">avec {exchange.providerName}</p>
                      </td>
                      <td className="px-4 py-3"><span className="badge-stone">{exchange.status}</span></td>
                      <td className="px-4 py-3 text-stone-600">
                        {(exchange.requesterQrConfirmed ? 1 : 0) + (exchange.providerQrConfirmed ? 1 : 0)}/2 confirmations
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {exchange.completionHours == null ? 'En cours' : `${exchange.completionHours} h`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Utilisateur</th>
                    <th className="text-left font-semibold px-4 py-3">Type</th>
                    <th className="text-left font-semibold px-4 py-3">Plan</th>
                    <th className="text-left font-semibold px-4 py-3">Quota IA</th>
                    <th className="text-right font-semibold px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-500">Aucun utilisateur.</td></tr>
                  ) : users.map((user) => {
                    const plan = formatPlan(user)
                    const isPremium = plan === 'PREMIUM'
                    return (
                      <tr key={user.id} className="bg-white">
                        <td className="px-4 py-3">
                          <p className="font-medium text-stone-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-stone-500">{user.email}</p>
                        </td>
                        <td className="px-4 py-3 text-stone-600">{user.userType}</td>
                        <td className="px-4 py-3"><span className={isPremium ? 'badge-green' : 'badge-stone'}>{plan}</span></td>
                        <td className="px-4 py-3 text-stone-600">
                          {isPremium ? 'Illimite' : `${user.matchingUsedThisMonth || 0}/${user.matchingMonthlyQuota || 3} ce mois`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => updatePlan(user, isPremium ? 'STANDARD' : 'PREMIUM')}
                              disabled={savingId === user.id}
                              className={isPremium ? 'btn-secondary text-xs px-3 py-1.5' : 'btn-primary text-xs px-3 py-1.5'}
                            >
                              {savingId === user.id ? 'Enregistrement...' : isPremium ? 'Desactiver premium' : 'Activer premium'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
