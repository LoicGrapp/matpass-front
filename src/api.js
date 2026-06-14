// Petit module pour parler à l'API Laravel.
// Toutes les requêtes passent par ici : une seule façon d'appeler l'API.

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Fonction interne : envoie une requête et renvoie le JSON.
// En cas d'erreur (status >= 400), elle lève une exception avec un message lisible.
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}/api${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    // Laravel renvoie un "message" ; sinon on prend la première erreur de validation.
    const firstError = data.errors ? Object.values(data.errors)[0]?.[0] : null
    throw new Error(data.message || firstError || 'Une erreur est survenue.')
  }

  return data
}

// Inscription d'un membre : renvoie { user, token }.
export function register(name, email, password, passwordConfirmation) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  })
}

// Connexion : renvoie { user, token }.
export function login(email, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// Utilisateur connecté (nécessite un token).
export function me(token) {
  return request('/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Déconnexion (supprime le token côté serveur).
export function logout(token) {
  return request('/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}
