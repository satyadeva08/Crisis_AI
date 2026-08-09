import { useState, useEffect } from 'react';
import { Search, Activity, CheckCircle2, AlertTriangle, ArrowRight, MapPin, Clock } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Badge from '../../components/common/Badge';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import './TrackStatus.css';

export default function TrackStatus() {
  const { fetchIncident } = useIncidents();
  const { user, isAuthenticated } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [historyIds, setHistoryIds] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Load history from localStorage on mount
  useEffect(() => {
    async function loadData() {
      let uniqueIds = [];
      try {
        const stored = JSON.parse(localStorage.getItem('my_reports') || '[]');
        uniqueIds = [...new Set(stored)];
        setHistoryIds(uniqueIds);
      } catch (err) {
        console.warn("Could not read history", err);
      }

      // If logged in as citizen, fetch DB reports
      if (isAuthenticated && user?.role === 'citizen') {
        try {
          const { incidentService } = await import('../../services/incidents.js');
          const dbReports = await incidentService.getAllForUser(user.id);
          setUserReports(dbReports);
          
          // Auto-load if exactly 1 report total and no search yet
          if (uniqueIds.length === 0 && dbReports.length === 1 && !result) {
            handleSearch(dbReports[0].id);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        if (uniqueIds.length === 1 && !result) {
          handleSearch(uniqueIds[0]);
        }
      }
    }
    
    loadData();
  }, [isAuthenticated, user]); // Reload if login state changes

  async function handleSearch(idToSearch) {
    const id = idToSearch || searchId;
    if (!id.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // We can't easily use context state directly without it affecting global state,
      // but fetchIncident doesn't return data directly, it dispatches. 
      // Let's import incidentService directly just for this isolated view to avoid polluting context state.
      // Wait, we can't cleanly do that without an import. I'll just use dynamic import or standard import.
      
      // Actually, since fetchIncident is available, let's use the service directly.
      const { incidentService } = await import('../../services/incidents.js');
      const data = await incidentService.getById(id.trim());
      setResult(data);
      
      // Add to history if not there
      if (!historyIds.includes(data.id)) {
        const newHistory = [data.id, ...historyIds];
        setHistoryIds(newHistory);
        localStorage.setItem('my_reports', JSON.stringify(newHistory));
      }
      
    } catch (err) {
      setError("Report not found. Please check your reference number.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    handleSearch(searchId);
  }

  return (
    <div className="track-page">
      <Navbar variant="user" />

      <main className="track-main">
        <div className="container-narrow">
          <div className="track-header">
            <div className="track-header-icon">
              <Activity size={22} />
            </div>
            <h1 className="track-title">Track Your Report</h1>
            <p className="track-description">
              Enter your Reference Number to check the live status of your emergency report.
            </p>
          </div>

          <form className="track-search-card" onSubmit={handleFormSubmit}>
            <label className="track-search-label" htmlFor="ref-search">
              Reference Number
            </label>
            <div className="track-search-row">
              <input
                id="ref-search"
                type="text"
                className="track-search-input"
                placeholder="e.g. INC-..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button 
                type="submit" 
                className="track-search-btn"
                disabled={!searchId.trim() || isLoading}
              >
                {isLoading ? 'Searching...' : 'Track'}
              </button>
            </div>
            {error && <p className="track-error">{error}</p>}
          </form>

          {result ? (
            <div className="track-result-card animate-fade-in-up">
              <div className="track-result-header">
                <div>
                  <p className="track-result-id">{result.id}</p>
                  <h2 className="track-result-title">{result.title}</h2>
                </div>
                <div className="track-result-badges">
                  <Badge type="severity" value={result.severity} />
                  <Badge type="status" value={result.status} />
                </div>
              </div>
              
              <div className="track-result-timeline">
                <h3 className="track-search-label" style={{marginBottom: '0'}}>Updates & Timeline</h3>
                {result.updates && result.updates.length > 0 ? (
                  result.updates.map((update, idx) => (
                    <div key={idx} className={`track-timeline-item ${idx === 0 ? 'active' : ''}`}>
                      <div className="track-timeline-dot">
                        {idx === 0 ? <CheckCircle2 size={14} /> : <div style={{width: 6, height: 6, borderRadius: '50%', background: 'var(--color-border-focus)'}} />}
                      </div>
                      <div className="track-timeline-content">
                        <span className="track-timeline-time">{update.time}</span>
                        <p className="track-timeline-text">{update.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="track-description">No updates yet.</p>
                )}
              </div>
            </div>
          ) : (
            (historyIds.length > 0 || userReports.length > 0) && (
              <div className="track-history-section">
                <h3 className="track-history-title">Your Recent Reports</h3>
                <div className="track-history-list">
                  {/* Database Reports */}
                  {userReports.map((report) => (
                    <button 
                      key={report.id} 
                      className="track-history-item"
                      onClick={() => handleSearch(report.id)}
                    >
                      <div className="track-item-left">
                        <span className="track-item-id">{report.title || report.id}</span>
                        <span className="track-item-date">
                          {report.status} • {new Date(report.reportedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <ArrowRight size={18} color="var(--color-text-tertiary)" />
                    </button>
                  ))}

                  {/* LocalStorage Reports (if not already listed in DB reports) */}
                  {historyIds.filter(id => !userReports.find(r => r.id === id)).map((id) => (
                    <button 
                      key={id} 
                      className="track-history-item"
                      onClick={() => handleSearch(id)}
                    >
                      <div className="track-item-left">
                        <span className="track-item-id">{id}</span>
                        <span className="track-item-date">Guest Session Report • Click to view status</span>
                      </div>
                      <ArrowRight size={18} color="var(--color-text-tertiary)" />
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
