import { useState, useEffect } from 'react'
import { Plus, Search, Users, UserCheck, UserX, UserPlus } from 'lucide-react'
import { listUsers, createUser, updateUser } from './api'

// "Loïc Hollay" -> "LH"
function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Date ISO -> "14 juin 2026"
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const roleLabels = {
  super_admin: 'Super admin',
  admin: 'Admin',
  coach: 'Coach',
  member: 'Membre',
}

// --- Badges ---

function RoleBadge({ role }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#2a2a30] text-muted-foreground">
      {roleLabels[role] ?? role}
    </span>
  )
}

function StatusBadge({ status }) {
  const active = status === 'active'
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-mono ${
        active ? 'bg-[#5bd17a]/10 text-[#5bd17a]' : 'bg-white/5 text-muted-foreground'
      }`}
    >
      {active ? 'Actif' : 'Désactivé'}
    </span>
  )
}

// --- Carte de statistique ---

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex-1 bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-muted-foreground text-[13px]">
        <Icon size={16} className="text-primary" />
        {label}
      </div>
      <div className="font-mono text-2xl font-bold">{value}</div>
    </div>
  )
}

// --- Formulaire d'ajout (modale) ---

const labelClass = 'font-mono text-xs uppercase tracking-[0.5px] text-muted-foreground'
const inputClass =
  'font-sans text-[15px] bg-background border border-border rounded-[10px] px-[14px] py-2.5 outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/20'

function AddUserModal({ onCreated, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'coach',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createUser(form)
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-[420px] bg-card border border-border rounded-2xl p-6 flex flex-col gap-4"
      >
        <h2 className="font-mono text-lg font-bold">Nouvel utilisateur</h2>

        {error && (
          <div className="bg-destructive/10 border border-destructive/35 text-destructive text-[13px] rounded-[10px] px-3 py-2.5">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Nom complet</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Email</label>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Mot de passe</label>
          <input
            type="password"
            className={inputClass}
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="8 caractères minimum"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className={labelClass}>Rôle</label>
            <select
              className={inputClass}
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
            >
              <option value="coach">Coach</option>
              <option value="member">Membre</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className={labelClass}>Téléphone</label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="Optionnel"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 font-sans text-sm bg-[#2a2a30] text-foreground rounded-xl py-2.5 cursor-pointer hover:bg-white/10"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 font-mono font-bold text-sm text-primary-foreground bg-primary rounded-xl py-2.5 cursor-pointer hover:brightness-95 disabled:opacity-60"
          >
            {loading ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  )
}

// --- Page Membres ---

const colMembre = 'flex-1 min-w-0'
const colRole = 'w-28 shrink-0'
const colStatus = 'w-28 shrink-0'
const colPhone = 'w-40 shrink-0'
const colDate = 'w-32 shrink-0'
const colAction = 'w-28 shrink-0 text-right'

export default function MembersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showModal, setShowModal] = useState(false)

  function load() {
    setLoading(true)
    setError('')
    listUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  // Stats calculées depuis la vraie liste.
  const now = new Date()
  const stats = {
    total: users.length,
    actifs: users.filter((u) => u.status === 'active').length,
    inactifs: users.filter((u) => u.status === 'disabled').length,
    nouveaux: users.filter((u) => {
      const d = new Date(u.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length,
  }

  // Filtrage côté client (recherche + rôle).
  const filtered = users.filter((u) => {
    const matchSearch = `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  async function toggleStatus(user) {
    const status = user.status === 'active' ? 'disabled' : 'active'
    await updateUser(user.id, { status })
    load()
  }

  return (
    <>
      {/* Bouton d'ajout (en haut à droite du contenu) */}
      <div className="flex justify-end -mt-1">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-mono font-bold text-sm rounded-lg px-4 py-2 cursor-pointer hover:brightness-95"
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {/* Cartes de stats (valeurs réelles) */}
      <div className="flex gap-4">
        <StatCard icon={Users} label="Total" value={stats.total} />
        <StatCard icon={UserCheck} label="Actifs" value={stats.actifs} />
        <StatCard icon={UserX} label="Désactivés" value={stats.inactifs} />
        <StatCard icon={UserPlus} label="Nouveaux (ce mois)" value={stats.nouveaux} />
      </div>

      {/* Barre recherche + filtre rôle */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-lg px-3.5 py-2.5">
          <Search size={18} className="text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none"
        >
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="coach">Coach</option>
          <option value="member">Membre</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center px-4 py-3 bg-[#2e2e2e] text-xs font-mono uppercase tracking-wide text-muted-foreground">
          <span className={colMembre}>Utilisateur</span>
          <span className={colRole}>Rôle</span>
          <span className={colStatus}>Statut</span>
          <span className={colPhone}>Téléphone</span>
          <span className={colDate}>Inscription</span>
          <span className={colAction}>Action</span>
        </div>

        {loading && (
          <div className="px-4 py-6 text-sm text-muted-foreground">Chargement…</div>
        )}

        {error && <div className="px-4 py-6 text-sm text-destructive">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="px-4 py-6 text-sm text-muted-foreground">Aucun utilisateur.</div>
        )}

        {!loading &&
          !error &&
          filtered.map((user) => (
            <div
              key={user.id}
              className="flex items-center px-4 py-3 border-t border-border text-sm"
            >
              <div className={`${colMembre} flex items-center gap-3`}>
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#2a2a30] font-mono font-bold text-xs shrink-0">
                  {initials(user.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate">{user.name}</div>
                  <div className="text-muted-foreground text-xs truncate">{user.email}</div>
                </div>
              </div>
              <div className={colRole}>
                <RoleBadge role={user.role} />
              </div>
              <div className={colStatus}>
                <StatusBadge status={user.status} />
              </div>
              <div className={`${colPhone} text-muted-foreground`}>{user.phone || '—'}</div>
              <div className={`${colDate} text-muted-foreground`}>
                {formatDate(user.created_at)}
              </div>
              <div className={colAction}>
                <button
                  onClick={() => toggleStatus(user)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {user.status === 'active' ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          ))}
      </div>

      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false)
            load()
          }}
        />
      )}
    </>
  )
}
