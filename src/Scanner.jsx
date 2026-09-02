import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { X } from 'lucide-react'
import { validatePresence } from './api'

// Scanner de QR code du coach : ouvre la caméra, lit un code, envoie le jeton à
// l'API. La bibliothèque qr-scanner décode côté navigateur (l'API BarcodeDetector
// native n'existe pas sur iOS, où se fera une bonne partie des scans).
//
// Props :
// - onClose    : fermeture du scanner.
// - onValidated: appelée après chaque présence validée (pour rafraîchir la liste).
export default function Scanner({ onClose, onValidated }) {
  const videoRef = useRef(null)
  const [result, setResult] = useState(null) // { ok: bool, message: string }
  const [error, setError] = useState('')

  // La caméra ne doit démarrer qu'une fois : on garde le callback dans une ref
  // pour qu'un nouveau rendu du parent ne relance pas le scanner.
  const onValidatedRef = useRef(onValidated)

  useEffect(() => {
    onValidatedRef.current = onValidated
  }, [onValidated])

  useEffect(() => {
    // Un même code reste devant l'objectif plusieurs images de suite : on ignore
    // les lectures répétées du même jeton.
    let dernierJeton = null
    let occupe = false

    const scanner = new QrScanner(
      videoRef.current,
      async ({ data }) => {
        if (occupe || data === dernierJeton) return

        occupe = true
        dernierJeton = data

        try {
          const { reservation } = await validatePresence(data)
          setResult({ ok: true, message: `${reservation.user.name} — présence validée` })
          onValidatedRef.current?.()
        } catch (e) {
          setResult({ ok: false, message: e.message })
        } finally {
          occupe = false
          // Au bout de 2 s, le même code peut être relu (nouvelle tentative).
          setTimeout(() => {
            dernierJeton = null
          }, 2000)
        }
      },
      { highlightScanRegion: true, preferredCamera: 'environment' },
    )

    scanner.start().catch(() => setError("Impossible d'accéder à la caméra."))

    return () => scanner.destroy()
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-md flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[15px] font-bold">Scanner une présence</h2>
          <button onClick={onClose} className="text-muted-foreground cursor-pointer hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <video ref={videoRef} className="w-full rounded-xl bg-black aspect-square object-cover" />

        {error && <div className="text-sm text-destructive">{error}</div>}

        {result && (
          <div
            className={`text-sm rounded-xl px-3 py-2 ${
              result.ok ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive'
            }`}
          >
            {result.message}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Présente le QR code du membre devant la caméra. Le scanner reste ouvert pour
          enchaîner les validations.
        </p>
      </div>
    </div>
  )
}
