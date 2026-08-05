/**
 * healthService.js
 * Service for fetching system diagnostics and health status.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchSystemHealth() {
  return apiFetch('/api/system/health');
}

export async function fetchSystemVersion() {
  return apiFetch('/api/system/version');
}
