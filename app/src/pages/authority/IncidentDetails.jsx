import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, User, FileText,
  AlertTriangle, Activity, CheckCircle, Navigation
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import MobileNav from '../../components/common/MobileNav';
import Badge from '../../components/common/Badge';
import AIAnalysisPanel from '../../components/authority/AIAnalysisPanel';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useIncidents } from '../../context/IncidentContext';
import { formatDateTime } from '../../utils/formatters';
import './IncidentDetails.css';

/**
 * Incident detail page — full view of a single incident.
 * Shows description, location, AI analysis, status, and timeline.
 */
export default function IncidentDetails() {
  const { id } = useParams();
  const { selectedIncident: incident, isLoading, fetchIncident, updateStatus } = useIncidents();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleStatusChange(newStatus) {
    if (incident.status === newStatus || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateStatus(incident.id, newStatus);
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    if (id) fetchIncident(id);
  }, [id, fetchIncident]);

  if (isLoading || !incident) {
    return (
      <div className="details-layout">
        <Sidebar />
        <main className="details-main">
          <LoadingSpinner fullPage message="Loading incident details…" />
        </main>
      </div>
    );
  }

  return (
    <div className="details-layout">
      <Sidebar />

      <main className="details-main">
        {/* Back link + header */}
        <div className="details-header">
          <Link to="/authority/dashboard" className="details-back">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="details-header-row">
            <div>
              <div className="details-header-badges">
                <span className="details-id">{incident.id}</span>
                <Badge type="severity" value={incident.severity} />
                <Badge type="status" value={incident.status} />
              </div>
              <h1 className="details-title">{incident.title}</h1>
            </div>
            
            <div className="details-header-actions">
              {incident.status === 'active' && (
                <button 
                  className="details-action-btn primary"
                  onClick={() => handleStatusChange('in-progress')}
                  disabled={isUpdating}
                >
                  <Navigation size={16} />
                  Deploy Team
                </button>
              )}
              {incident.status === 'in-progress' && (
                <button 
                  className="details-action-btn success"
                  onClick={() => handleStatusChange('resolved')}
                  disabled={isUpdating}
                >
                  <CheckCircle size={16} />
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Two-column content */}
        <div className="details-content">
          {/* Left column: main info */}
          <div className="details-left">
            {/* Description */}
            <section className="details-section">
              <h2 className="details-section-title">
                <FileText size={16} />
                Incident Description
              </h2>
              <p className="details-description">{incident.description}</p>
            </section>

            {/* Key Details */}
            <section className="details-section">
              <h2 className="details-section-title">
                <Activity size={16} />
                Key Details
              </h2>
              <div className="details-info-grid">
                <div className="details-info-item">
                  <span className="details-info-label">Category</span>
                  <span className="details-info-value">{incident.category}</span>
                </div>
                <div className="details-info-item">
                  <span className="details-info-label">Reported By</span>
                  <span className="details-info-value">{incident.reportedBy}</span>
                </div>
                <div className="details-info-item">
                  <span className="details-info-label">Reported At</span>
                  <span className="details-info-value">{formatDateTime(incident.reportedAt)}</span>
                </div>
                <div className="details-info-item">
                  <span className="details-info-label">Priority</span>
                  <span className="details-info-value">#{incident.priority}</span>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="details-section">
              <h2 className="details-section-title">
                <MapPin size={16} />
                Location
              </h2>
              <div className="details-location">
                <p className="details-location-address">{incident.location.address}</p>
                <p className="details-location-coords">
                  {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                </p>
              </div>
            </section>

            {/* Activity Timeline */}
            <section className="details-section">
              <h2 className="details-section-title">
                <Clock size={16} />
                Activity Timeline
              </h2>
              <div className="details-timeline">
                {incident.updates.map((update, index) => (
                  <div key={index} className="details-timeline-item">
                    <div className="details-timeline-dot" />
                    <div className="details-timeline-content">
                      <span className="details-timeline-time">{update.time}</span>
                      <span className="details-timeline-text">{update.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column: AI Analysis */}
          <div className="details-right">
            <AIAnalysisPanel analysis={incident.aiAnalysis} />
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
