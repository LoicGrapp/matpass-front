import { useState, useEffect } from 'react'
import { User, MapPin, QrCode, X, Check } from 'lucide-react'
import { listReservations, cancelReservation, reservationQrUrl } from './api'

// Le QR code d'une réservation, présenté au coach à l'entrée du cours.
function QrModal({ reservation, onClose }) {
  const [url, setUrl] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let objectUrl = null

    reservationQrUrl(reservation.id)
      .then((u) => {
        objectUrl = u
        setUrl(u)
      })
      .catch((e) => setError(e.message))

    // L'URL locale de l'image est libérée à la fermeture.
    return () => objectUrl && URL.revokeObjectURL(objectUrl)
  }, [reservation.id])

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[15px] font-bold">{reservation.creneau.cours.name}</h2>
          <button onClick={onClose} className="text-muted-foreground cursor-pointer hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}
        {url && <img src={url} alt="QR code de la réservation" className="w-full rounded-xl bg-white p-3" />}

        <p className="text-xs text-muted-foreground">
          Présente ce code à ton coach au début du cours pour valider ta présence.
        </p>
      </div>
    </div>
  )
}

function formatDate(iso) {
  const text = new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function hm(time) {
  return time ? time.slice(0, 5) : ''
}

export default function MesReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qrFor, setQrFor] = useState(null)

  function load() {
    setLoading(true)
    setError('')
    listReservations()
      .then((all) =>
        setReservations(all.filter((r) => ['confirmed', 'present'].includes(r.status))),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCancel(reservation) {
    setError('')
    try {
      await cancelReservation(reservation.id)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <>
      {loading && <div className="text-sm text-muted-foreground">Chargement…</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {!loading && !error && reservations.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 text-sm text-muted-foreground">
          Tu n'as aucune réservation. Va dans « Planning » pour réserver un cours.
        </div>
      )}

      {!loading &&
        !error &&
        reservations.map((r) => {
          const c = r.creneau
          return (
            <div
              key={r.id}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.cours.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#2a2a30] text-muted-foreground">
                    {c.cours.sport_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-xs mt-1">
                  <span>
                    {formatDate(c.date)} · {hm(c.start_time)}–{hm(c.end_time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={13} />
                    {c.coach.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {c.espace.name}
                  </span>
                </div>
              </div>

              {r.status === 'present' ? (
                <span className="shrink-0 flex items-center gap-1 text-xs text-primary">
                  <Check size={14} />
                  Présent
                </span>
              ) : (
                <>
                  <button
                    onClick={() => setQrFor(r)}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-primary cursor-pointer"
                  >
                    <QrCode size={15} />
                    Mon QR code
                  </button>

                  <button
                    onClick={() => handleCancel(r)}
                    className="shrink-0 text-xs font-medium text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    Annuler
                  </button>
                </>
              )}
            </div>
          )
        })}

      {qrFor && <QrModal reservation={qrFor} onClose={() => setQrFor(null)} />}
    </>
  )
}
