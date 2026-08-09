import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Copy, ArrowRight, Home } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import './Success.css';

/**
 * Success confirmation page — shown after a report is submitted.
 * Displays the incident reference number and next steps.
 */
export default function Success() {
  const location = useLocation();
  const incidentId = location.state?.incidentId || 'INC-2026-009';
  const [copied, setCopied] = useState(false);

  function handleCopyId() {
    navigator.clipboard.writeText(incidentId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="success-page">
      <Navbar variant="user" />

      <main className="success-main">
        <div className="container-narrow">
          <div className="success-card animate-fade-in-up">
            {/* Checkmark icon */}
            <div className="success-icon">
              <CheckCircle2 size={36} />
            </div>

            <h1 className="success-title">Report Submitted Successfully</h1>
            <p className="success-description">
              Your emergency report has been received and is being processed.
              Response teams are being notified based on the AI severity assessment.
            </p>

            {/* Reference number */}
            <div className="success-reference">
              <span className="success-reference-label">Reference Number</span>
              <div className="success-reference-id">
                <span>{incidentId}</span>
                <button
                  className="success-copy-btn"
                  onClick={handleCopyId}
                  aria-label="Copy reference number"
                >
                  <Copy size={14} />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* What happens next */}
            <div className="success-next-steps">
              <h3 className="success-next-title">What happens next</h3>
              <ul className="success-next-list">
                <li>Your report is being analyzed by our AI system</li>
                <li>Severity and priority are assigned automatically</li>
                <li>The nearest response team will be dispatched</li>
                <li>You can track status using your reference number</li>
              </ul>
            </div>

            {/* Safety tips */}
            <div className="success-safety">
              <h3 className="success-safety-title">Stay Safe</h3>
              <p className="success-safety-text">
                Move to a safe location if possible. Keep your phone charged and accessible.
                Follow instructions from emergency responders when they arrive.
              </p>
            </div>

            {/* Actions */}
            <div className="success-actions">
              <Link to="/report/track" className="success-action-primary">
                <CheckCircle2 size={16} />
                Track Status
              </Link>
              <Link to="/" className="success-action-secondary">
                <Home size={16} />
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
