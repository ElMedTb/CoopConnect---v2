import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { exchangesApi } from '../../api/users'
import { Leaf, Menu, X, ChevronDown, User, LogOut, LayoutDashboard, ListChecks, Sparkles, ArrowLeftRight, Map } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) return
    const load = () => {
      exchangesApi.getMy()
        .then(res => {
          const pending = (res.data || []).filter(
            e => e.status === 'REQUESTED' && e.providerUsername === user?.username
          ).length
          setPendingCount(pending)
        })
        .catch(() => {})
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user?.username])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-forest-800' : 'text-stone-600 hover:text-stone-900'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-forest-800 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-stone-900 text-sm">CoopConnect</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/browse" className={navLinkClass}>Annonces</NavLink>
            <NavLink to="/map" className={navLinkClass}>Carte</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>Tableau de bord</NavLink>
                <NavLink to="/matches" className={navLinkClass}>Mes matchs</NavLink>
              </>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/listings/create"
                  className="hidden sm:inline-flex btn-primary text-xs px-3 py-1.5"
                >
                  Publier une annonce
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Menu utilisateur"
                    className="flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-forest-100 flex items-center justify-center text-forest-800 font-medium text-xs">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:block font-medium">{user?.fullName?.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-dropdown border border-stone-200 py-1 z-20">
                        <div className="px-3 py-2 border-b border-stone-100">
                          <p className="text-sm font-medium text-stone-900">{user?.fullName}</p>
                          <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-stone-400" />
                          Tableau de bord
                        </Link>
                        <Link
                          to="/listings/my"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <ListChecks className="w-4 h-4 text-stone-400" />
                          Mes annonces
                        </Link>
                        <Link
                          to="/matches"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-stone-400" />
                          Recommandations
                        </Link>
                        <Link
                          to="/exchanges"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <ArrowLeftRight className="w-4 h-4 text-stone-400" />
                          Mes échanges
                          {pendingCount > 0 && (
                            <span className="ml-auto text-xs bg-amber-100 text-amber-800 font-medium px-1.5 py-0.5 rounded-full">
                              {pendingCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-stone-400" />
                          Mon profil
                        </Link>
                        <div className="border-t border-stone-100 mt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Se déconnecter
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary text-xs px-3 py-1.5">
                  Rejoindre
                </Link>
              </>
            )}

            <button
              className="md:hidden btn-ghost p-1.5"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1">
          <NavLink
            to="/browse"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-forest-50 text-forest-800' : 'text-stone-700 hover:bg-stone-50'}`
            }
          >
            Annonces
          </NavLink>
          <NavLink
            to="/map"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-forest-50 text-forest-800' : 'text-stone-700 hover:bg-stone-50'}`
            }
          >
            Carte
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-forest-50 text-forest-800' : 'text-stone-700 hover:bg-stone-50'}`
                }
              >
                Tableau de bord
              </NavLink>
              <NavLink
                to="/matches"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-forest-50 text-forest-800' : 'text-stone-700 hover:bg-stone-50'}`
                }
              >
                Mes matchs
              </NavLink>
              <Link
                to="/listings/create"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-forest-800"
              >
                Publier une annonce
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
