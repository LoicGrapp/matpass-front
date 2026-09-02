import { useState, useEffect } from 'react'
import { User, MapPin } from 'lucide-react'
import { listCreneaux, reserveCreneau } from './api'

function formatDateHeader(iso) {
  const text = new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function hm(time) {
  return time ? time.slice(0, 5) : ''
}

function groupByDate(creneaux) {
  const groups = {}
  for (const c of creneaux) {
    if (!groups[c.date]) groups[c.date] = []
    groups[c.date].push(c)
  }
  return Object.entries(groups)
}

export default function MemberPlanningPage() {
  const [creneaux, setCreneaux] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  function load() {
    setLoading(true)
    setError('')
    listCreneaux()
      .then(setCreneaux)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleReserve(creneau) {
    setActionError('')
    try {
      await reserveCreneau(creneau.id)
      load()
    } catch (e) {
      setActionError(e.message)
    }
  }

  const groups = groupByDate(creneaux)

  return (
    <>
      {actionError && <div className="text-sm text-destructive">{actionError}</div>}
      {loading && <div className="text-sm text-muted-foreground">Chargement…</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {!loading && !error && creneaux.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 text-sm text-muted-foreground">
          Aucun cours planifié pour le moment.
        </div>
      )}

      {!loading &&
        !error &&
        groups.map(([date, items]) => (
          <div key={date} className="flex flex-col gap-3">
            <h2 className="font-mono text-[15px] font-bold">{formatDateHeader(date)}</h2>
            {items.map((c) => {
              const remaining = c.places - c.reserved_count
              const reserved = c.reserved_by_me > 0
              return (
                <div
                  key={c.id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="font-mono text-sm text-primary w-32 shrink-0">
                    {hm(c.start_time)} – {hm(c.end_time)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.cours.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#2a2a30] text-muted-foreground">
                        {c.cours.sport_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground text-xs mt-1">
                      <span className="flex items-center gap-1">
                        <User size={13} />
                        {c.coach.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {c.espace.name}
                      </span>
                      <span>
                        {remaining} place{remaining > 1 ? 's' : ''} restante
                        {remaining > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {reserved ? (
                    <span className="shrink-0 font-mono text-sm font-bold text-[#5bd17a]">
                      Réservé ✓
                    </span>
                  ) : remaining <= 0 ? (
                    <span className="shrink-0 font-mono text-sm text-muted-foreground">
                      Complet
                    </span>
                  ) : (
                    <button
                      onClick={() => handleReserve(c)}
                      className="shrink-0 font-mono font-bold text-sm text-primary-foreground bg-primary rounded-lg px-4 py-2 cursor-pointer hover:brightness-95"
                    >
                      Réserver
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
    </>
  )
}
