import { MapPin, Clock, ChevronRight } from 'lucide-react';
import Badge from '../common/Badge';
import { timeAgo, truncate } from '../../utils/formatters';
import './IncidentCard.css';

/**
 * Compact card displaying one incident in a list.
 *
 * Props:
 *   incident — incident data object
 *   onClick  — callback when the card is clicked
 *   isActive — whether this card is currently selected
 */
export default function IncidentCard({ incident, onClick, isActive = false }) {
  return (
    <button
      className={`incident-card ${isActive ? 'active' : ''}`}
      onClick={() => onClick(incident)}
      aria-label={`View incident ${incident.id}`}
    >
      {/* Top row: ID and severity badge */}
      <div className="incident-card-header">
        <span className="incident-card-id">{incident.id}</span>
        <Badge type="severity" value={incident.severity} />
      </div>

      {/* Title */}
      <h4 className="incident-card-title">{incident.title}</h4>

      {/* Description preview */}
      <p className="incident-card-description">
        {truncate(incident.description, 90)}
      </p>

      {/* Bottom row: location and time */}
      <div className="incident-card-footer">
        <span className="incident-card-meta">
          <MapPin size={13} />
          {truncate(incident.location.address, 30)}
        </span>
        <span className="incident-card-meta">
          <Clock size={13} />
          {timeAgo(incident.reportedAt)}
        </span>
      </div>

      {/* Arrow indicator */}
      <ChevronRight size={16} className="incident-card-arrow" />
    </button>
  );
}
