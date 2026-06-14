import React, { useEffect, useState } from 'react'
import { usersApi } from '../api/users'
import { ShieldCheck, RefreshCw } from 'lucide-react'

function formatPlan(user) {
  if (user.premiumActive) return 'PREMIUM'
  return user.subscriptionPlan || 'STANDARD'
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')

  const loadUsers = () => {
    setLoading(true)
    setError('')
    usersApi.adminList({ page: 0, size: 100 })
      .then((res) => setUsers(res.data?.content || []))
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger les utilisateurs.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
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
    } catch (err) {
      setError(err.response?.data?.message || 'Mise a jour impossible.')
    } finally {
      setSavingId('')
    }
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest-700" aria-hidden="true" />
            <h1 className="page-header">Administration</h1>
          </div>
          <button onClick={loadUsers} className="btn-secondary text-xs px-3 py-1.5">
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-stone-500">Chargement...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-stone-500">Aucun utilisateur.</td>
                  </tr>
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
                      <td className="px-4 py-3">
                        <span className={isPremium ? 'badge-green' : 'badge-stone'}>{plan}</span>
                      </td>
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
      </div>
    </div>
  )
}
