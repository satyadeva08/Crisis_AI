import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import Sidebar from '../../components/common/Sidebar';
import MobileNav from '../../components/common/MobileNav';
import Badge from '../../components/common/Badge';
import { useIncidents } from '../../context/IncidentContext';
import { SEVERITY_CONFIG } from '../../utils/constants';
import 'leaflet/dist/leaflet.css';
import './LiveMap.css';

/**
 * Full-screen live map with incident markers, color-coded by severity.
 * Uses Leaflet + OpenStreetMap tiles (free, no API key).
 */

// Custom marker icons by severity (simple colored circles via SVG)
function createMarkerIcon(severity) {
  const color = severity === 'critical' ? '#DC2626'
    : severity === 'high' ? '#D97706'
    : severity === 'medium' ? '#2563EB'
    : '#059669';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="12" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-map-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export default function LiveMap() {
  const { incidents, isLoading, fetchIncidents } = useIncidents();
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Filter incidents by severity
  const filteredIncidents = severityFilter === 'all'
    ? incidents
    : incidents.filter((i) => i.severity === severityFilter);

  // Center the map on India (Delhi area)
  const mapCenter = [28.58, 77.20];
  const mapZoom = 9;

  return (
    <div className="map-layout">
      <Sidebar />

      <main className="map-main">
        {/* Header bar */}
        <div className="map-header">
          <div>
            <h1 className="map-title">Live Map</h1>
            <p className="map-subtitle">
              {filteredIncidents.length} incidents displayed
            </p>
          </div>

          {/* Severity filter chips */}
          <div className="map-filters">
            {['all', 'critical', 'high', 'medium', 'low'].map((level) => (
              <button
                key={level}
                className={`map-filter-chip ${severityFilter === level ? 'active' : ''}`}
                onClick={() => setSeverityFilter(level)}
              >
                {level === 'all' ? 'All' : SEVERITY_CONFIG[level].label}
              </button>
            ))}
          </div>
        </div>

        {/* Map container */}
        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="map-leaflet"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredIncidents.map((incident) => (
              <Marker
                key={incident.id}
                position={[incident.location.lat, incident.location.lng]}
                icon={createMarkerIcon(incident.severity)}
              >
                <Tooltip direction="top" offset={[0, -14]} opacity={1}>
                  <strong style={{ fontSize: '12px' }}>{incident.location.address}</strong>
                </Tooltip>
                <Popup>
                  <div className="map-popup">
                    <div className="map-popup-header">
                      <span className="map-popup-id">{incident.id}</span>
                      <Badge type="severity" value={incident.severity} />
                    </div>
                    <h4 className="map-popup-title">{incident.title}</h4>
                    <p className="map-popup-address">{incident.location.address}</p>
                    <p className="map-popup-category">{incident.category}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
