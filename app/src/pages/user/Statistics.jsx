import {
  Wind,
  Droplets,
  AlertTriangle,
  IndianRupee,
  Users,
} from 'lucide-react';
import './Statistics.css';

const hazardFrequency = [
  { name: 'Floods', value: 33 },
  { name: 'Heatwaves', value: 24 },
  { name: 'Droughts', value: 22 },
  { name: 'Cold Spells', value: 16 },
  { name: 'Cyclones', value: 5 },
];

export default function Statistics() {
  return (
    <div className="statistics-panel">
      <div className="statistics-panel-header">
        <span className="statistics-eyebrow-dot" />
        <span className="statistics-label">INDIA DISASTER DATA (1995-2021)</span>
      </div>

      <div className="statistics-metrics-grid">
        <div className="statistics-metric-card">
          <IndianRupee size={20} className="text-primary" />
          <div className="metric-info">
            <strong>$79.5B</strong>
            <span>Economic Losses</span>
          </div>
        </div>
        
        <div className="statistics-metric-card">
          <Users size={20} className="text-danger" />
          <div className="metric-info">
            <strong>104,311</strong>
            <span>Total Deaths</span>
          </div>
        </div>
        
        <div className="statistics-metric-card">
          <Droplets size={20} className="text-info" />
          <div className="metric-info">
            <strong>33%</strong>
            <span>Flood Events</span>
          </div>
        </div>
        
        <div className="statistics-metric-card">
          <AlertTriangle size={20} className="text-warning" />
          <div className="metric-info">
            <strong>48%</strong>
            <span>Cyclone Fatalities</span>
          </div>
        </div>
      </div>

      <div className="statistics-chart-section">
        <div className="statistics-section-header">
          <Wind size={16} />
          <span>Major Hazards</span>
        </div>
        <div className="hazard-bars">
          {hazardFrequency.map(h => (
            <div key={h.name} className="hazard-bar-row">
              <span className="hazard-name">{h.name}</span>
              <div className="hazard-bar-container">
                <div className="hazard-bar" style={{ width: `${h.value}%` }} />
              </div>
              <span className="hazard-value">{h.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
