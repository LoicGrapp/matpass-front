import { useState, useEffect } from 'react'
import { Plus, User, MapPin } from 'lucide-react'
import { listCreneaux, listCours, listEspaces, listUsers, createCreneau } from './api'

// "2026-06-20" -> "Vendredi 20 juin 2026"
function formatDateHeader(iso) {
  const text = new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// "18:00:00" -> "18:00"
function hm(time) {
  return time ? time.slice(0, 5) : ''
}

// Regroupe les créneaux par date (l'API les renvoie déjà triés).
function groupByDate(creneaux) {
  const groups = {}
  for (const c of creneaux) {
    if (!groups[c.date]) groups[c.date] = []
    groups[c.date].push(c)
  }
  return Object.entries(groups)
}

const labelClass = 'font-mono text-xs uppercase tracking-[0.5px] text-muted-foreground'
const inputClass =
  'font-sans text-[15px] bg-background border border-border rounded-[10px] px-[14px] py-2.5 outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/20'

// --- Modale de création d'un créneau ---

function AddCreneauModal({ coursList, espacesList, coachsList, onCreated, onClose }) {
  const firstCours = coursList[0]
  const [form, setForm] = useState({
    cours_id: firstCours?.id ?? '',
    espace_id: firstCours?.espace_id ?? '',
    coach_id: firstCours?.coach_id ?? '',
    date: '',
    start_time: '',
    end_time: '',
    places: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  // En changeant de cours, on pré-remplit la salle et le coach par défaut du cours.
  function handleCoursChange(coursId) {
    const cours = coursList.find((c) => String(c.id) === String(coursId))
    setForm((f) => ({
      ...f,
      cours_id: coursId,
      espace_id: cours?.espace_id ?? f.espace_id,
      coach_id: cours?.coach_id ?? f.coach_id,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.places) delete payload.places
      await createCreneau(payload)
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
        <h2 className="font-mono text-lg font-bold">Nouveau créneau</h2>

        {error && (
          <div className="bg-destructive/10 border border-destructive/35 text-destructive text-[13px] rounded-[10px] px-3 py-2.5">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Cours</label>
          <select
            className={inputClass}
            value={form.cours_id}
            onChange={(e) => handleCoursChange(e.target.value)}
            required
          >
            {coursList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className={labelClass}>Salle</label>
            <select
              className={inputClass}
              value={form.espace_id}
              onChange={(e) => set('espace_id', e.target.value)}
              required
            >
              {espacesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className={labelClass}>Coach</label>
            <select
              className={inputClass}
              value={form.coach_id}
              onChange={(e) => set('coach_id', e.target.value)}
              required
            >
              {coachsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Date</label>
          <input
            type="date"
            className={inputClass}
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className={labelClass}>Début</label>
            <input
              type="time"
              className={inputClass}
              value={form.start_time}
              onChange={(e) => set('start_time', e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className={labelClass}>Fin</label>
            <input
              type="time"
              className={inputClass}
              value={form.end_time}
              onChange={(e) => set('end_time', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Places</label>
          <input
            type="number"
            min="1"
            className={inputClass}
            value={form.places}
            onChange={(e) => set('places', e.target.value)}
            placeholder="Par défaut : capacité du cours"
          />
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

// --- Page Planning ---

export default function PlanningPage() {
  const [creneaux, setCreneaux] = useState([])
  const [coursList, setCoursList] = useState([])
  const [espacesList, setEspacesList] = useState([])
  const [coachsList, setCoachsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  function load() {
    setLoading(true)
    setError('')
    Promise.all([listCreneaux(), listCours(), listEspaces(), listUsers('coach')])
      .then(([cr, co, es, ch]) => {
        setCreneaux(cr)
        setCoursList(co)
        setEspacesList(es)
        setCoachsList(ch)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const groups = groupByDate(creneaux)
  const canCreate = coursList.length > 0 && espacesList.length > 0 && coachsList.length > 0

  return (
    <>
      <div className="flex justify-end -mt-1">
        <button
          onClick={() => setShowModal(true)}
          disabled={!canCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-mono font-bold text-sm rounded-lg px-4 py-2 cursor-pointer hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Ajouter un créneau
        </button>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Chargement…</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {!loading && !error && !canCreate && (
        <div className="bg-card border border-border rounded-2xl p-5 text-sm text-muted-foreground">
          Il faut au moins un cours, une salle et un coach pour planifier un créneau.
        </div>
      )}

      {!loading && !error && creneaux.length === 0 && canCreate && (
        <div className="bg-card border border-border rounded-2xl p-5 text-sm text-muted-foreground">
          Aucun créneau planifié. Clique sur « Ajouter un créneau ».
        </div>
      )}

      {!loading &&
        !error &&
        groups.map(([date, items]) => (
          <div key={date} className="flex flex-col gap-3">
            <h2 className="font-mono text-[15px] font-bold">{formatDateHeader(date)}</h2>
            {items.map((c) => (
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
                    <span>{c.places} places</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      {showModal && (
        <AddCreneauModal
          coursList={coursList}
          espacesList={espacesList}
          coachsList={coachsList}
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
