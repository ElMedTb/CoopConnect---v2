import React, { useEffect, useState } from 'react'
import { adminApi, usersApi } from '../api/users'

const STATUS_STYLES = {
  REQUESTED: 'bg-blue-100 text-blue-800 border-blue-200',
  ACCEPTED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-rose-100 text-rose-800 border-rose-200',
  CANCELLED: 'bg-stone-100 text-stone-700 border-stone-200',
  DISPUTED: 'bg-red-100 text-red-800 border-red-200',
}

const BAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-stone-500',
]

function formatPlan(user) {
  if (user.premiumActive) return 'PREMIUM'
  return user.subscriptionPlan || 'STANDARD'
}

function pct(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

function Stat({ label, value, hint, tone = 'stone' }) {
  const tones = {
    blue: 'border-l-blue-500',
    green: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    rose: 'border-l-rose-500',
    stone: 'border-l-stone-400',
  }
  return (
    <div className={`card p-4 border-l-4 ${tones[tone] || tones.stone}`}>
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{label}</p>
      </div>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      {hint && <p className="text-xs text-stone-500 mt-1 leading-relaxed">{hint}</p>}
    </div>
  )
}

function ProgressMetric({ label, value, color = 'bg-forest-700', detail }) {
  const numeric = Math.max(0, Math.min(100, Number(value || 0)))
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="text-sm text-stone-600">{label}</span>
        <span className="text-sm font-semibold text-stone-900">{pct(numeric)}</span>
      </div>
      <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${numeric}%` }} />
      </div>
      {detail && <p className="text-xs text-stone-400 mt-1">{detail}</p>}
    </div>
  )
}

function DistributionChart({ values, total, labelMap = {} }) {
  const entries = Object.entries(values || {}).filter(([, value]) => Number(value) > 0)
  if (entries.length === 0) {
    return <p className="text-sm text-stone-500">Aucune donnee disponible.</p>
  }
  const baseTotal = total || entries.reduce((sum, [, value]) => sum + Number(value || 0), 0)

  return (
    <div className="space-y-3">
      <div className="flex h-3 rounded-full overflow-hidden bg-stone-100">
        {entries.map(([key, value], index) => (
          <div
            key={key}
            className={BAR_COLORS[index % BAR_COLORS.length]}
            style={{ width: `${baseTotal ? (Number(value) / baseTotal) * 100 : 0}%` }}
            title={`${labelMap[key] || key}: ${value}`}
          />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
        {entries.map(([key, value], index) => (
          <div key={key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${BAR_COLORS[index % BAR_COLORS.length]}`} />
              <span className="text-stone-600 truncate">{labelMap[key] || key}</span>
            </span>
            <span className="font-semibold text-stone-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarRows({ values, total, labelMap = {} }) {
  const entries = Object.entries(values || {})
  const max = Math.max(1, ...entries.map(([, value]) => Number(value || 0)))
  return (
    <div className="space-y-3">
      {entries.map(([key, value], index) => {
        const width = total ? (Number(value || 0) / total) * 100 : (Number(value || 0) / max) * 100
        return (
          <div key={key}>
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-sm text-stone-600">{labelMap[key] || key}</span>
              <span className="text-sm font-semibold text-stone-900">{value}</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${BAR_COLORS[index % BAR_COLORS.length]}`} style={{ width: `${Math.max(4, width)}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function statusClass(status) {
  return STATUS_STYLES[status] || 'bg-stone-100 text-stone-700 border-stone-200'
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
          <h1 className="page-header">Administration</h1>
          <button onClick={loadAll} className="btn-secondary text-xs px-3 py-1.5 w-fit">
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
              <Stat tone="blue" label="Utilisateurs" value={stats?.totalUsers || 0} hint={`${stats?.activeUsers || 0} actifs`} />
              <Stat tone="green" label="Premium" value={stats?.premiumUsers || 0} hint={`Conversion: ${pct(stats?.premiumConversionRate)}`} />
              <Stat tone="amber" label="Echanges" value={stats?.totalExchanges || 0} hint={`Completion: ${pct(stats?.exchangeCompletionRate)}`} />
              <Stat tone="rose" label="Matching IA" value={stats?.monthlyMatchingUsage || 0} hint={`${stats?.standardUsersAtQuota || 0} standards au quota`} />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="card p-5">
                <h2 className="section-title mb-4">Qualite utilisateurs</h2>
                <div className="space-y-4">
                  <ProgressMetric label="Emails verifies" value={stats?.emailVerificationRate} color="bg-blue-500" />
                  <ProgressMetric label="Telephones verifies" value={stats?.phoneVerificationRate} color="bg-emerald-500" />
                  <ProgressMetric label="Onboarding complet" value={stats?.onboardingCompletionRate} color="bg-amber-500" />
                  <ProgressMetric label="Credibilite validee" value={stats?.credibilityVerificationRate} color="bg-violet-500" />
                </div>
              </div>
              <div className="card p-5">
                <h2 className="section-title mb-4">Monetisation et matching</h2>
                <div className="space-y-4">
                  <ProgressMetric label="Conversion premium" value={stats?.premiumConversionRate} color="bg-emerald-500" detail={`${stats?.premiumUsers || 0} premium / ${stats?.totalUsers || 0} utilisateurs`} />
                  <ProgressMetric label="Standards au quota IA" value={stats?.standardUsers ? ((stats?.standardUsersAtQuota || 0) * 100) / stats.standardUsers : 0} color="bg-rose-500" detail={`${stats?.standardUsersAtQuota || 0} comptes bloques par quota`} />
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2">
                      <p className="text-xs text-cyan-700 font-medium">Usage IA mensuel</p>
                      <p className="text-xl font-bold text-cyan-900">{stats?.monthlyMatchingUsage || 0}</p>
                    </div>
                    <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                      <p className="text-xs text-amber-700 font-medium">Quota standard restant</p>
                      <p className="text-xl font-bold text-amber-900">{stats?.totalRemainingStandardQuota || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="card p-5">
                <h2 className="section-title mb-4">Pipeline echanges</h2>
                <DistributionChart values={stats?.exchangesByStatus} total={stats?.totalExchanges} />
              </div>
              <div className="card p-5">
                <h2 className="section-title mb-4">Sante marketplace</h2>
                <div className="space-y-4">
                  <ProgressMetric label="Taux de completion echange" value={stats?.exchangeCompletionRate} color="bg-green-500" />
                  <ProgressMetric label="Taux acceptation" value={stats?.exchangeAcceptanceRate} color="bg-blue-500" />
                  <ProgressMetric label="Validation QR complete" value={stats?.qrCompletionRate} color="bg-violet-500" />
                  <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">
                    Temps moyen completion: <span className="font-semibold text-stone-900">{stats?.averageCompletionHours == null ? 'N/A' : `${stats.averageCompletionHours} h`}</span>
                  </div>
                </div>
              </div>
              <div className="card p-5">
                <h2 className="section-title mb-4">Activite annonces</h2>
                <BarRows values={stats?.listingsByStatus} total={stats?.totalListings} />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="card p-5">
                <h2 className="section-title mb-4">Utilisateurs par type</h2>
                <BarRows values={stats?.usersByType} total={stats?.totalUsers} />
              </div>
              <div className="card p-5">
                <h2 className="section-title mb-4">Indicateurs de densite</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-3">
                    <p className="text-xs text-blue-700 font-medium">Annonces totales</p>
                    <p className="text-xl font-bold text-blue-900">{stats?.totalListings || 0}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3">
                    <p className="text-xs text-emerald-700 font-medium">Annonces actives</p>
                    <p className="text-xl font-bold text-emerald-900">{stats?.activeListings || 0}</p>
                  </div>
                  <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-3">
                    <p className="text-xs text-amber-700 font-medium">Actives / user actif</p>
                    <p className="text-xl font-bold text-amber-900">{stats?.activeListingsPerActiveUser || 0}</p>
                  </div>
                </div>
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
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass(exchange.status)}`}>
                          {exchange.status}
                        </span>
                      </td>
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
