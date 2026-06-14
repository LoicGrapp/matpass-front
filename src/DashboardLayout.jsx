import { Dumbbell, Bell, LogOut } from 'lucide-react'

// Coque réutilisable de tableau de bord (sidebar + top bar), partagée par tous
// les rôles (admin, coach, membre). Chaque rôle fournit son propre titre, sa nav
// et son contenu (children).
//
// Props :
// - user      : l'utilisateur connecté (pour l'avatar).
// - onLogout  : fonction de déconnexion.
// - roleLabel : libellé du rôle affiché dans la sidebar (ex. "ADMIN").
// - title     : titre affiché dans la barre du haut.
// - navItems  : [{ icon, label, active }] — éléments de navigation.
// - children  : le contenu de la page.

// Initiales d'un nom : "Loïc Hollay" -> "LH".
function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const navItemBase =
  'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-left cursor-pointer transition'

export default function DashboardLayout({ user, onLogout, roleLabel, title, navItems, children }) {
  return (
    <div className="flex min-h-screen">
      {/* ===== Sidebar ===== */}
      <aside className="w-[260px] shrink-0 bg-sidebar border-r border-white/10 py-6 px-5 flex flex-col gap-7">
        <div className="flex items-center gap-2.5 text-primary">
          <Dumbbell size={22} />
          <span className="font-mono font-bold text-lg text-foreground">GymFlow</span>
        </div>

        {roleLabel && (
          <span className="text-[11px] font-semibold tracking-[1.2px] text-primary">
            {roleLabel}
          </span>
        )}

        <nav className="flex flex-col gap-1">
          {navItems.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`${navItemBase} ${
                active
                  ? 'bg-[#2a2a30] text-foreground'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <Icon size={18} className={active ? 'text-primary' : ''} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={onLogout}
            className={`${navItemBase} text-muted-foreground hover:bg-white/5 hover:text-foreground`}
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ===== Zone principale ===== */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-border">
          <h1 className="font-mono text-[22px] font-bold">{title}</h1>
          <div className="flex items-center gap-4">
            <button className="flex text-muted-foreground cursor-pointer hover:text-foreground">
              <Bell size={20} />
            </button>
            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-primary text-primary-foreground font-mono font-bold text-[13px]">
              {initials(user.name)}
            </div>
          </div>
        </header>

        <div className="p-7 flex flex-col gap-6">{children}</div>
      </div>
    </div>
  )
}
