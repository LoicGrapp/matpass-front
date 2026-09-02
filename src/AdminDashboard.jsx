import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Award,
  Calendar,
  CreditCard,
  Settings,
  UserCheck,
  Euro,
  Dumbbell,
} from 'lucide-react'
import DashboardLayout from './DashboardLayout'
import MembersPage from './MembersPage'
import PlanningPage from './PlanningPage'

// Les pages de l'espace admin (l'ordre = l'ordre dans la sidebar).
const pages = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { id: 'members', icon: Users, label: 'Membres' },
  { id: 'coachs', icon: Award, label: 'Coachs' },
  { id: 'planning', icon: Calendar, label: 'Planning' },
  { id: 'finances', icon: CreditCard, label: 'Finances' },
  { id: 'settings', icon: Settings, label: 'Paramètres' },
]

const panelClass = 'bg-card border border-border rounded-2xl p-5'
const panelTitleClass = 'font-mono text-[15px] font-bold'

// Accueil de l'admin (structure, données à brancher plus tard).
function DashboardHome() {
  const statCards = [
    { icon: Users, label: 'Total membres' },
    { icon: UserCheck, label: 'Membres actifs' },
    { icon: Euro, label: 'Revenus mensuels' },
    { icon: Dumbbell, label: "Séances d'essai" },
  ]

  return (
    <>
      <div className="flex gap-4">
        {statCards.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex-1 bg-card border border-border rounded-2xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-[13px]">
              <Icon size={16} className="text-primary" />
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className={panelClass}>
            <h2 className={panelTitleClass}>Revenus</h2>
          </div>
          <div className={panelClass}>
            <h2 className={panelTitleClass}>Activité récente</h2>
          </div>
        </div>
        <div className="w-[380px] shrink-0 flex flex-col gap-5">
          <div className={panelClass}>
            <h2 className={panelTitleClass}>Top Coachs</h2>
          </div>
          <div className={panelClass}>
            <h2 className={panelTitleClass}>Cours populaires</h2>
          </div>
        </div>
      </div>
    </>
  )
}

// Placeholder pour les pages pas encore construites.
function Placeholder({ label }) {
  return (
    <div className={panelClass}>
      <h2 className={panelTitleClass}>{label}</h2>
      <p className="text-muted-foreground text-sm mt-2">Cette page arrivera bientôt.</p>
    </div>
  )
}

export default function AdminDashboard({ user, onLogout }) {
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
      roleLabel="ADMIN"
      title={current.label}
      navItems={navItems}
    >
      {page === 'dashboard' && <DashboardHome />}
      {page === 'members' && <MembersPage />}
      {page === 'planning' && <PlanningPage />}
      {!['dashboard', 'members', 'planning'].includes(page) && (
        <Placeholder label={current.label} />
      )}
    </DashboardLayout>
  )
}
