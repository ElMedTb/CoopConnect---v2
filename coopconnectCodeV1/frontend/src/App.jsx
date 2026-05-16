import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Browse from './pages/Browse'
import ListingDetail from './pages/ListingDetail'
import CreateListing from './pages/CreateListing'
import Matches from './pages/Matches'
import MyListings from './pages/MyListings'
import Profile from './pages/Profile'
import Exchanges from './pages/Exchanges'
import EditListing from './pages/EditListing'
import MapView from './pages/MapView'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function WithNav({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/browse" element={<WithNav><Browse /></WithNav>} />
      <Route path="/map" element={<WithNav><MapView /></WithNav>} />
      <Route path="/listings/:id" element={<WithNav><ListingDetail /></WithNav>} />

      <Route path="/dashboard" element={<PrivateRoute><WithNav><Dashboard /></WithNav></PrivateRoute>} />
      <Route path="/listings/create" element={<PrivateRoute><WithNav><CreateListing /></WithNav></PrivateRoute>} />
      <Route path="/listings/my" element={<PrivateRoute><WithNav><MyListings /></WithNav></PrivateRoute>} />
      <Route path="/listings/:id/edit" element={<PrivateRoute><WithNav><EditListing /></WithNav></PrivateRoute>} />
      <Route path="/matches" element={<PrivateRoute><WithNav><Matches /></WithNav></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><WithNav><Profile /></WithNav></PrivateRoute>} />
      <Route path="/exchanges" element={<PrivateRoute><WithNav><Exchanges /></WithNav></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
