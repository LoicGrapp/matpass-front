import { useState } from 'react'
import { register } from './api'

const labelClass = 'font-mono text-xs uppercase tracking-[0.5px] text-muted-foreground'
const inputClass =
  'font-sans text-[15px] bg-background border border-border rounded-[10px] px-[14px] py-3 outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/20'

// Écran d'inscription d'un nouveau membre.
export default function Register({ onLoggedIn, onSwitchToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { user, token } = await register(name, email, password, passwordConfirmation)
      onLoggedIn(token, user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] bg-card border border-border rounded-2xl p-10 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]"
      >
        <h1 className="font-mono text-[22px] font-bold mb-1.5">Inscription</h1>
        <p className="text-muted-foreground text-sm mb-7">
          Créez votre compte membre GymFlow.
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/35 text-destructive text-[13px] rounded-[10px] px-3 py-2.5 mb-[18px]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-[7px] mb-[18px]">
          <label htmlFor="name" className={labelClass}>Nom complet</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Loïc Hollay"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-[7px] mb-[18px]">
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-[7px] mb-[18px]">
          <label htmlFor="password" className={labelClass}>Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-[7px] mb-[18px]">
          <label htmlFor="password_confirmation" className={labelClass}>
            Confirmer le mot de passe
          </label>
          <input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="••••••••"
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full font-mono font-bold text-[15px] text-primary-foreground bg-primary rounded-xl py-[13px] cursor-pointer transition hover:brightness-95 active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Création…' : 'Créer mon compte'}
        </button>

        <p className="text-muted-foreground text-[13px] text-center mt-5">
          Déjà un compte ?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary font-medium cursor-pointer hover:underline"
          >
            Se connecter
          </button>
        </p>
      </form>
    </div>
  )
}
