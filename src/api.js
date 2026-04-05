// ── Trove API Service ─────────────────────────────
// Connects the frontend to the Express backend.
// Set VITE_API_URL in your .env file or it defaults to localhost:3001

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

let token = localStorage.getItem('trove_token') || null;

function setToken(t) {
  token = t;
  if (t) localStorage.setItem('trove_token', t);
  else localStorage.removeItem('trove_token');
}

function getToken() {
  return token;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Auth ──────────────────────────────────────────
export async function register({ name, email, phone, birthday, password }) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, birthday, password }),
  });
  setToken(data.token);
  return data;
}

export async function login({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export function logout() {
  setToken(null);
}

export async function getMe() {
  return request('/auth/me');
}

export async function updateMe(updates) {
  return request('/auth/me', { method: 'PUT', body: JSON.stringify(updates) });
}

// ── Profiles ──────────────────────────────────────
export async function getProfiles() {
  return request('/profiles');
}

export async function getProfile(id) {
  return request(`/profiles/${id}`);
}

export async function createProfile({ name, type, species, birthdate, avatar }) {
  return request('/profiles', {
    method: 'POST',
    body: JSON.stringify({ name, type, species, birthdate, avatar }),
  });
}

export async function updateProfile(id, updates) {
  return request(`/profiles/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function deleteProfile(id) {
  return request(`/profiles/${id}`, { method: 'DELETE' });
}

// ── Age Data ──────────────────────────────────────
export async function getAgeData(profileId) {
  return request(`/agedata/${profileId}`);
}

export async function addAgeDataItem(profileId, ageKey, { section, subsection, value }) {
  return request(`/agedata/${profileId}/${ageKey}`, {
    method: 'POST',
    body: JSON.stringify({ section, subsection, value }),
  });
}

export async function removeAgeDataItem(profileId, ageKey, { section, subsection, value }) {
  return request(`/agedata/${profileId}/${ageKey}`, {
    method: 'DELETE',
    body: JSON.stringify({ section, subsection, value }),
  });
}

export async function setAgeDataSection(profileId, ageKey, section, data) {
  return request(`/agedata/${profileId}/${ageKey}/${section}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

// ── Photos ────────────────────────────────────────
export async function uploadPhoto(profileId, ageKey, file, setAsProfile = false) {
  const formData = new FormData();
  formData.append('photo', file);
  if (setAsProfile) formData.append('set_as_profile', 'true');

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}/photos/${profileId}/${ageKey}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  return res.json();
}

export async function getPhotos(profileId) {
  return request(`/photos/${profileId}`);
}

export async function setTimelinePhoto(photoId) {
  return request(`/photos/${photoId}/timeline`, { method: 'PUT' });
}

export async function deletePhoto(photoId) {
  return request(`/photos/${photoId}`, { method: 'DELETE' });
}

// ── Share ─────────────────────────────────────────
export async function shareProfile(profileId, recipientEmail, sections) {
  return request(`/share/${profileId}`, {
    method: 'POST',
    body: JSON.stringify({ recipient_email: recipientEmail, sections }),
  });
}

export async function getShareHistory(profileId) {
  return request(`/share/${profileId}/history`);
}

// ── Export ─────────────────────────────────────────
export function getExportUrl(profileId, format = 'txt') {
  return `${API}/export/${profileId}?format=${format}&token=${token}`;
}

// ── Check if logged in ────────────────────────────
export function isLoggedIn() {
  return !!token;
}
