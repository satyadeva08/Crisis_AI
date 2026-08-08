import { Bell, AlertTriangle, Info } from 'lucide-react';
import './AlertPanel.css';

/**
 * Displays a list of recent alert notifications.
 *
 * Props:
 *   alerts — array of { id, type, message, time }
 */
export default function AlertPanel({ alerts = [] }) {
  // Pick the right icon based on alert type
  function getAlertIcon(type) {
    if (type === 'critical') return <AlertTriangle size={14} />;
    if (type === 'high') return <AlertTriangle size={14} />;
    return <Info size={14} />;
  }

  return (
    <div className="alert-panel">
      <div className="alert-panel-header">
        <Bell size={16} />
        <h3 className="alert-panel-title">Recent Alerts</h3>
        <span className="alert-panel-count">{alerts.length}</span>
      </div>

      <div className="alert-panel-list">
        {alerts.length === 0 ? (
          <p className="alert-panel-empty">No active alerts</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`alert-panel-item alert-${alert.type}`}>
              <div className="alert-panel-item-icon">
                {getAlertIcon(alert.type)}
              </div>
              <div className="alert-panel-item-content">
                <p className="alert-panel-item-message">{alert.message}</p>
                <span className="alert-panel-item-time">{alert.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
