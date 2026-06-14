import {
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  Calendar,
  CreditCard,
  Settings,
  Euro,
  Dumbbell,
} from 'lucide-react'
import DashboardLayout from './DashboardLayout'

// Navigation de l'administrateur.
const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', active: true },
  { icon: Users, label: 'Membres' },
  { icon: Award, label: 'Coachs' },
  { icon: Calendar, label: 'Planning' },
  { icon: CreditCard, label: 'Finances' },
  { icon: Settings, label: 'Paramètres' },
]

// Libellés des cartes de stats.
const statCards = [
  { icon: Users, label: 'Total membres' },
  { icon: UserCheck, label: 'Membres actifs' },
  { icon: Euro, label: 'Revenus mensuels' },
  { icon: Dumbbell, label: "Séances d'essai" },
]

const panelClass = 'bg-card border border-border rounded-2xl p-5'
const panelTitleClass = 'font-mono text-[15px] font-bold'

export default function AdminDashboard({ user, onLogout }) {
  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      roleLabel="ADMIN"
      title="Tableau de bord"
      navItems={navItems}
    >
      {/* Cartes de stats */}
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

      {/* Deux colonnes */}
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
    </DashboardLayout>
  )
}
