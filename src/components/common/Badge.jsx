import { SEVERITY_CONFIG, STATUS_CONFIG } from '../../utils/constants';
import './Badge.css';

/**
 * Badge component for displaying severity or status labels.
 *
 * Usage:
 *   <Badge type="severity" value="critical" />
 *   <Badge type="status" value="active" />
 */
export default function Badge({ type = 'severity', value }) {
  const config = type === 'severity' ? SEVERITY_CONFIG[value] : STATUS_CONFIG[value];

  if (!config) return null;

  return (
    <span
      className={`badge badge-${type} badge-${value}`}
      style={{
        '--badge-color': config.color,
        '--badge-bg': config.bg || 'transparent',
        '--badge-border': config.border || config.color,
      }}
    >
      {type === 'status' && <span className="badge-dot" />}
      {config.label}
    </span>
  );
}
