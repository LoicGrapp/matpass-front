import { LayoutDashboard, Dumbbell, Calendar, User } from 'lucide-react'
import DashboardLayout from './DashboardLayout'

// Navigation du membre (reprise du design .pen).
const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', active: true },
  { icon: Dumbbell, label: 'Mes cours' },
  { icon: Calendar, label: 'Planning' },
  { icon: User, label: 'Mon profil' },
]

export default function MemberDashboard({ user, onLogout }) {
  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      roleLabel="MENU"
      title="Mon espace"
      navItems={navItems}
    >
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-mono text-[15px] font-bold">Bienvenue, {user.name}</h2>
        <p className="text-muted-foreground text-sm mt-2">
          Votre espace membre. Le planning et les réservations arriveront bientôt.
        </p>
      </div>
    </DashboardLayout>
  )
}
