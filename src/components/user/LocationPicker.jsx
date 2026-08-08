import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import './LocationPicker.css';

/**
 * Location picker with auto-detect and manual entry options.
 *
 * Props:
 *   onLocationSelect — callback receiving { lat, lng, address }
 */
export default function LocationPicker({ onLocationSelect }) {
  const { position, error, isLoading, requestLocation } = useGeolocation();
  const [manualAddress, setManualAddress] = useState('');
  const [mode, setMode] = useState('auto'); // 'auto' or 'manual'

  function handleAutoDetect() {
    requestLocation();
  }

  // Safely trigger callback on position updates when they change
  useEffect(() => {
    if (position && mode === 'auto') {
      onLocationSelect({
        lat: position.lat,
        lng: position.lng,
        address: `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`,
      });
    }
  }, [position, mode, onLocationSelect]);

  function handleManualSubmit() {
    if (!manualAddress.trim()) return;
    onLocationSelect({
      lat: null,
      lng: null,
      address: manualAddress.trim(),
    });
  }

  return (
    <div className="location-picker">
      {/* Mode toggle */}
      <div className="location-picker-tabs">
        <button
          className={`location-picker-tab ${mode === 'auto' ? 'active' : ''}`}
          onClick={() => setMode('auto')}
          type="button"
        >
          <Navigation size={14} />
          Auto Detect
        </button>
        <button
          className={`location-picker-tab ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => setMode('manual')}
          type="button"
        >
          <MapPin size={14} />
          Enter Manually
        </button>
      </div>

      {/* Auto detect mode */}
      {mode === 'auto' && (
        <div className="location-picker-auto">
          {!position && !isLoading && (
            <button
              className="location-picker-detect-btn"
              onClick={handleAutoDetect}
              type="button"
            >
              {isLoading ? (
                <Loader2 size={16} className="loading-spinner-icon" />
              ) : (
                <Navigation size={16} />
              )}
              Detect My Location
            </button>
          )}

          {isLoading && (
            <div className="location-picker-status">
              <Loader2 size={16} className="loading-spinner-icon" />
              <span>Detecting your location…</span>
            </div>
          )}

          {position && (
            <div className="location-picker-result">
              <MapPin size={16} />
              <span>
                Location detected: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </span>
            </div>
          )}

          {error && (
            <div className="location-picker-error">
              <span>Could not detect location: {error}</span>
              <button type="button" onClick={() => setMode('manual')}>
                Enter manually instead
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual entry mode */}
      {mode === 'manual' && (
        <div className="location-picker-manual">
          <input
            type="text"
            className="location-picker-input"
            placeholder="Enter address or landmark (e.g., Sector 14, Gurugram)"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            onBlur={handleManualSubmit}
          />
        </div>
      )}
    </div>
  );
}
