const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface User {
  utilisateur_id: number;
  nom_utilisateur: string;
  email: string;
  prenom: string;
  nom: string;
  Role?: { libelle: string };
}

export interface Evenement {
  evenement_id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  categorie_id: number;
  est_publie: boolean;
  lieu_id: number;
  organisateur_id: number;
  cree_le: string;
}

export interface Inscription {
  inscription_id: number;
  utilisateur_id: number;
  evenement_id: number;
  date_inscription: string;
}

export interface LoginCredentials {
  email: string;
  mot_de_passe: string;
}

export interface RegisterData {
  nom_utilisateur: string;
  email: string;
  mot_de_passe: string;
  prenom: string;
  nom: string;
}

export interface CreateEventData {
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  categorie_id: number;
  lieu_id: number;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(error.message || 'Une erreur est survenue');
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiCall<{ message: string; token: string }>('/utilisateurs/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: RegisterData) =>
    apiCall<{ message: string; utilisateur: User }>('/utilisateurs/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => apiCall<User>('/utilisateurs/me'),
};

// Events API
export const eventsApi = {
  getAllPublic: () => apiCall<Evenement[]>('/events'),

  getById: (id: number) => apiCall<Evenement>(`/events/${id}`),

  create: (data: CreateEventData) =>
    apiCall<Evenement>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CreateEventData>) =>
    apiCall<Evenement>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  publish: (id: number) =>
    apiCall<Evenement>(`/events/${id}/publish`, {
      method: 'PATCH',
    }),

  delete: (id: number) =>
    apiCall<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    }),

  uploadImage: (id: number, formData: FormData) =>
    fetch(`${API_BASE_URL}/events/${id}/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }).then((res) => res.json()),

  // Nouvelle fonction pour filtrer par date
  getFilteredPublic: (startDate: string, endDate: string) =>
    apiCall<Evenement[]>(`/events/filtered?startDate=${startDate}&endDate=${endDate}`),
};


// Inscriptions API
export const inscriptionsApi = {
  create: (eventId: number) =>
    apiCall<Inscription>(`/inscriptions/events/${eventId}/inscriptions`, {
      method: 'POST',
    }),

  cancel: (inscriptionId: number) =>
    apiCall<{ message: string }>(`/inscriptions/${inscriptionId}`, {
      method: 'DELETE',
    }),

  getByEvent: (eventId: number) =>
    apiCall<Inscription[]>(`/inscriptions/events/${eventId}/inscriptions`),

  getMine: () => apiCall<Inscription[]>('/inscriptions/me'),
};



// User API
export const userApi = {
  getMyEvents: () => apiCall<Evenement[]>('/users/me/events'),
};
export interface Inscription {
  inscription_id: number;
  utilisateur_id: number;
  evenement_id: number;
  date_inscription: string;
  evenement?: Evenement; // <-- Ajoute cette ligne
}

