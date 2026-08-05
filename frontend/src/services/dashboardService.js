/**
 * dashboardService.js
 * Centralised API layer for Module 4 Operations Dashboard.
 * Consumes ONLY existing backend endpoints — no business logic here.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with error normalisation.
 */
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

/**
 * Fetches the aggregated dashboard summary.
 * Endpoint: GET /api/dashboard/summary
 */
export async function fetchDashboardSummary() {
  return apiFetch('/api/dashboard/summary');
}

/**
 * Fetches all incidents across all analysed files, enriched with AI status.
 * Endpoint: GET /api/dashboard/incidents
 */
export async function fetchAllIncidents() {
  const data = await apiFetch('/api/dashboard/incidents');
  return data.incidents || [];
}

/**
 * Triggers AI analysis for a single incident.
 * Endpoint: POST /api/ai/analyze/{incident_id}
 */
export async function analyzeIncident(incidentId) {
  return apiFetch(`/api/ai/analyze/${incidentId}`, { method: 'POST' });
}

/**
 * Fetches the raw incident details by ID.
 * Endpoint: GET /api/error/{incident_id}
 */
export async function fetchIncidentById(incidentId) {
  return apiFetch(`/api/error/${incidentId}`);
}
