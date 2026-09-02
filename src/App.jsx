import { useState, useEffect } from 'react'
import Login from './Login'
import Register from './Register'
import AdminDashboard from './AdminDashboard'
import MemberDashboard from './MemberDashboard'
import CoachDashboard from './CoachDashboard'
import { me, logout } from './api'

export default function App() {
  // Le token est conservé dans le navigateur (localStorage) pour rester connecté
  // même après un rafraîchissement de la page.
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [mode, setMode] = useState('login') // 'login' ou 'register'

  // Au chargement, si un token existe déjà, on récupère l'utilisateur via /api/me.
  // Si le token n'est plus valide, on le supprime.
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    me(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  function handleLoggedIn(newToken, loggedUser) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(loggedUser)
  }

  async function handleLogout() {
    try {
      await logout(token)
    } catch {
      // Même si l'appel échoue, on déconnecte localement.
    }
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Chargement…
      </div>
    )
  }

  // Pas connecté → inscription ou connexion.
  if (!user) {
    if (mode === 'register') {
      return (
        <Register
          onLoggedIn={handleLoggedIn}
          onSwitchToLogin={() => setMode('login')}
        />
      )
    }
    return (
      <Login
        onLoggedIn={handleLoggedIn}
        onSwitchToRegister={() => setMode('register')}
      />
    )
  }

  // Connecté → tableau de bord selon le rôle.
  if (user.role === 'admin' || user.role === 'super_admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />
  }

  if (user.role === 'coach') {
    return <CoachDashboard user={user} onLogout={handleLogout} />
  }

  return <MemberDashboard user={user} onLogout={handleLogout} />
}
