import './StatCard.css';

/**
 * Dashboard stat card showing a number, label, and optional icon.
 *
 * Props:
 *   icon    — Lucide icon component
 *   value   — the main number to display
 *   label   — descriptive text below the number
 *   accent  — CSS color string for the icon background
 *   trend   — optional trend text like "+3 today"
 */
export default function StatCard({ icon: Icon, value, label, accent, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div
          className="stat-card-icon"
          style={{ background: accent ? `${accent}14` : 'var(--color-bg-tertiary)', color: accent || 'var(--color-text-secondary)' }}
        >
          {Icon && <Icon size={20} />}
        </div>
        {trend && <span className="stat-card-trend">{trend}</span>}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
