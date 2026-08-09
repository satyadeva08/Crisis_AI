export const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: 'var(--color-critical)', bg: 'var(--color-critical-light)', border: 'var(--color-critical-border)' },
  high: { label: 'High', color: 'var(--color-high)', bg: 'var(--color-high-light)', border: 'var(--color-high-border)' },
  medium: { label: 'Medium', color: 'var(--color-medium)', bg: 'var(--color-medium-light)', border: 'var(--color-medium-border)' },
  low: { label: 'Low', color: 'var(--color-low)', bg: 'var(--color-low-light)', border: 'var(--color-low-border)' },
};

export const STATUS_CONFIG = {
  active: { label: 'Active', color: 'var(--color-critical)' },
  'in-progress': { label: 'In Progress', color: 'var(--color-pending)' },
  resolved: { label: 'Resolved', color: 'var(--color-resolved)' },
};

export const DISASTER_CATEGORIES = [
  'Flood',
  'Earthquake',
  'Fire',
  'Structural Collapse',
  'Landslide',
  'Chemical Hazard',
  'Road Accident',
  'Infrastructure Failure',
  'Storm / Cyclone',
  'Other',
];

export const NAV_LINKS_USER = [
  { path: '/', label: 'Home' },
  { path: '/report', label: 'Report Emergency' },
];

export const NAV_LINKS_AUTHORITY = [
  { path: '/authority/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/authority/map', label: 'Live Map', icon: 'Map' },
  { path: '/authority/analytics', label: 'Analytics', icon: 'BarChart3' },
];
