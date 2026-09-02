// Petit module pour parler à l'API Laravel.
// Toutes les requêtes passent par ici : une seule façon d'appeler l'API.

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Fonction interne : envoie une requête et renvoie le JSON.
// En cas d'erreur (status >= 400), elle lève une exception avec un message lisible.
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    // En-têtes en dernier pour qu'ils ne soient jamais écrasés par options.
    // On garde Accept + Content-Type, et on fusionne ceux d'options (ex. Authorization).
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
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

// En-tête d'authentification basé sur le token stocké dans le navigateur.
function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Liste des utilisateurs (admin), filtre optionnel par rôle.
export function listUsers(role) {
  const query = role ? `?role=${encodeURIComponent(role)}` : ''
  return request(`/users${query}`, { headers: authHeaders() })
}

// Création d'un utilisateur (admin).
export function createUser(data) {
  return request('/users', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
}

// Mise à jour d'un utilisateur (admin) : rôle, statut, etc.
export function updateUser(id, data) {
  return request(`/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
}

// Liste des espaces.
export function listEspaces() {
  return request('/espaces', { headers: authHeaders() })
}

// Liste des cours.
export function listCours() {
  return request('/cours', { headers: authHeaders() })
}

// Liste des créneaux (avec cours, espace, coach).
export function listCreneaux() {
  return request('/creneaux', { headers: authHeaders() })
}

// Création d'un créneau (admin).
export function createCreneau(data) {
  return request('/creneaux', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
}

// Mes réservations.
export function listReservations() {
  return request('/reservations', { headers: authHeaders() })
}

// Réserver un créneau.
export function reserveCreneau(creneauId) {
  return request('/reservations', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ creneau_id: creneauId }),
  })
}

// Annuler une réservation.
export function cancelReservation(id) {
  return request(`/reservations/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

// Le QR code d'une réservation, renvoyé en SVG par l'API (pas du JSON) :
// on récupère l'image brute et on en fait une URL utilisable dans <img>.
export async function reservationQrUrl(id) {
  const response = await fetch(`${API_URL}/api/reservations/${id}/qr`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error("Impossible d'afficher le QR code.")
  }

  return URL.createObjectURL(await response.blob())
}

// Les créneaux du coach connecté, pour une date donnée (YYYY-MM-DD).
export function listMyCreneaux(date) {
  return request(`/creneaux?mine=1&date=${date}`, { headers: authHeaders() })
}

// Les membres inscrits sur un créneau (coach du créneau uniquement).
export function listCreneauReservations(creneauId) {
  return request(`/creneaux/${creneauId}/reservations`, { headers: authHeaders() })
}

// Validation d'une présence à partir du jeton lu dans le QR code.
export function validatePresence(token) {
  return request('/presences', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ token }),
  })
}
