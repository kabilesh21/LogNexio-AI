/**
 * reportService.js
 * API integration for Module 5 Incident Report Center.
 * Consumes /api/reports endpoints.
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

export async function fetchAllReports() {
  const data = await apiFetch('/api/reports');
  return data.reports || [];
}

export async function fetchReportHistory() {
  const data = await apiFetch('/api/reports/history');
  return data.history || [];
}

export async function fetchReportById(incidentId) {
  return apiFetch(`/api/reports/${incidentId}`);
}

export async function deleteReport(incidentId) {
  return apiFetch(`/api/reports/${incidentId}`, { method: 'DELETE' });
}

export async function compareReports(incidentIds) {
  return apiFetch('/api/reports/compare', {
    method: 'POST',
    body: JSON.stringify({ incident_ids: incidentIds }),
  });
}

export async function searchReports({ query, severity, error_type, keyword, date }) {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (severity && severity !== 'ALL') params.append('severity', severity);
  if (error_type && error_type !== 'ALL') params.append('error_type', error_type);
  if (keyword) params.append('keyword', keyword);
  if (date) params.append('date', date);

  const data = await apiFetch(`/api/reports/search?${params.toString()}`);
  return data.reports || [];
}

export function getExportUrl(incidentId, format) {
  return `${API_BASE}/api/reports/export/${format}/${incidentId}`;
}

export async function triggerFileDownload(incidentId, format, filename) {
  const url = getExportUrl(incidentId, format);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed with status ${response.status}`);
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename || `LogNexio_Incident_${incidentId.slice(0, 8)}.${format === 'markdown' ? 'md' : format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
