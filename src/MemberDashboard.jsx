import { useState } from 'react'
import { LayoutDashboard, Dumbbell, Calendar, User } from 'lucide-react'
import DashboardLayout from './DashboardLayout'
import MemberPlanningPage from './MemberPlanningPage'
import MesReservationsPage from './MesReservationsPage'

// Pages de l'espace membre (reprises du design .pen).
const pages = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { id: 'mescours', icon: Dumbbell, label: 'Mes cours' },
  { id: 'planning', icon: Calendar, label: 'Planning' },
  { id: 'profil', icon: User, label: 'Mon profil' },
]

function Home({ user }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="font-mono text-[15px] font-bold">Bienvenue, {user.name}</h2>
      <p className="text-muted-foreground text-sm mt-2">
        Va dans « Planning » pour réserver un cours, et retrouve tes séances dans « Mes
        cours ».
      </p>
    </div>
  )
}

function Placeholder({ label }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="font-mono text-[15px] font-bold">{label}</h2>
      <p className="text-muted-foreground text-sm mt-2">Cette page arrivera bientôt.</p>
    </div>
  )
}

export default function MemberDashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard')

  const navItems = pages.map((p) => ({
    ...p,
    active: p.id === page,
    onClick: () => setPage(p.id),
  }))

  const current = pages.find((p) => p.id === page)

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      roleLabel="MENU"
      title={current.label}
      navItems={navItems}
    >
      {page === 'dashboard' && <Home user={user} />}
      {page === 'planning' && <MemberPlanningPage />}
      {page === 'mescours' && <MesReservationsPage />}
      {page === 'profil' && <Placeholder label="Mon profil" />}
    </DashboardLayout>
  )
}
