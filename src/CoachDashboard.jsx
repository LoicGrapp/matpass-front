import { useState, useEffect, useCallback } from 'react'
import { Calendar, QrCode, MapPin, Check } from 'lucide-react'
import DashboardLayout from './DashboardLayout'
import Scanner from './Scanner'
import { listMyCreneaux, listCreneauReservations } from './api'

function hm(time) {
  return time ? time.slice(0, 5) : ''
}

// Espace coach : ses créneaux du jour, la liste des inscrits de chacun, et le
// scanner de QR code qui valide les présences.
export default function CoachDashboard({ user, onLogout }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [creneaux, setCreneaux] = useState([])
  const [selected, setSelected] = useState(null)
  const [reservations, setReservations] = useState([])
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listMyCreneaux(date).then(setCreneaux).catch((e) => setError(e.message))
  }, [date])

  function changeDate(nouvelleDate) {
    setDate(nouvelleDate)
    setSelected(null)
    setError('')
  }

  // Rechargée après chaque scan pour voir les présences arriver.
  const loadReservations = useCallback(() => {
    if (!selected) return
    listCreneauReservations(selected.id).then(setReservations).catch((e) => setError(e.message))
  }, [selected])

  useEffect(loadReservations, [loadReservations])

  const navItems = [
    { icon: Calendar, label: 'Mes créneaux', active: true, onClick: () => setSelected(null) },
  ]

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      roleLabel="COACH"
      title="Mes créneaux"
      navItems={navItems}
    >
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => changeDate(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={() => setScanning(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium cursor-pointer"
        >
          <QrCode size={16} />
          Scanner
        </button>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      {creneaux.length === 0 && !error && (
        <div className="bg-card border border-border rounded-2xl p-5 text-sm text-muted-foreground">
          Aucun cours ce jour-là.
        </div>
      )}

      {creneaux.map((c) => (
        <div key={c.id} className="bg-card border border-border rounded-2xl p-4">
          <button
            onClick={() => setSelected(selected?.id === c.id ? null : c)}
            className="w-full flex items-center gap-4 text-left cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium">{c.cours.name}</div>
              <div className="flex items-center gap-3 text-muted-foreground text-xs mt-1">
                <span>
                  {hm(c.start_time)}–{hm(c.end_time)}
                </span>
                {c.espace && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {c.espace.name}
                  </span>
                )}
              </div>
            </div>
            <span className="shrink-0 font-mono text-sm text-muted-foreground">
              {c.reserved_count}/{c.places}
            </span>
          </button>

          {selected?.id === c.id && (
            <ul className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
              {reservations.length === 0 && (
                <li className="text-sm text-muted-foreground">Personne d'inscrit.</li>
              )}
              {reservations.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <span>{r.user.name}</span>
                  {r.status === 'present' ? (
                    <span className="flex items-center gap-1 text-primary text-xs">
                      <Check size={14} />
                      Présent
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">En attente</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {scanning && (
        <Scanner onClose={() => setScanning(false)} onValidated={loadReservations} />
      )}
    </DashboardLayout>
  )
}
