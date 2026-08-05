/**
 * settingsService.js
 * Manages user settings persisted in localStorage.
 */

const SETTINGS_KEY = 'lognexio_user_settings';

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  autoRefreshInterval: 30, // seconds
  notificationsEnabled: true,
  defaultExportFormat: 'pdf', // 'pdf' | 'docx' | 'json' | 'markdown'
  preferredLandingPage: 'dashboard', // 'dashboard' | 'workspace' | 'report-center'
  animationSpeed: 'normal', // 'normal' | 'fast' | 'reduced'
};

export function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(newSettings) {
  try {
    const updated = { ...getSettings(), ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return getSettings();
  }
}
