import { useState } from 'react'
import { login } from './api'

// Écran de connexion. Prévient le parent (onLoggedIn) une fois le login réussi.
export default function Login({ onLoggedIn, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { user, token } = await login(email, password)
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
        <h1 className="font-mono text-[22px] font-bold mb-1.5">Connexion</h1>
        <p className="text-muted-foreground text-sm mb-7">
          Accédez à votre espace GymFlow.
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/35 text-destructive text-[13px] rounded-[10px] px-3 py-2.5 mb-[18px]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-[7px] mb-[18px]">
          <label
            htmlFor="email"
            className="font-mono text-xs uppercase tracking-[0.5px] text-muted-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
            className="font-sans text-[15px] bg-background border border-border rounded-[10px] px-[14px] py-3 outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-[7px] mb-[18px]">
          <label
            htmlFor="password"
            className="font-mono text-xs uppercase tracking-[0.5px] text-muted-foreground"
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="font-sans text-[15px] bg-background border border-border rounded-[10px] px-[14px] py-3 outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full font-mono font-bold text-[15px] text-primary-foreground bg-primary rounded-xl py-[13px] cursor-pointer transition hover:brightness-95 active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        <p className="text-muted-foreground text-[13px] text-center mt-5">
          Pas encore de compte ?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary font-medium cursor-pointer hover:underline"
          >
            S'inscrire
          </button>
        </p>
      </form>
    </div>
  )
}
