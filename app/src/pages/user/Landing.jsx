import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Shield, Zap, MapPin, Upload, Brain } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Statistics from './Statistics';
import './Landing.css';

/**
 * Landing page — first thing a user sees.
 * Communicates purpose clearly and directs to the emergency report form.
 */
export default function Landing() {
  return (
    <div className="landing-page">
      <Navbar variant="user" />

      {/* ── Hero Section ── */}
      <section className="landing-hero">
        <div className="container">
          <div className="landing-hero-grid">
            <div className="landing-hero-content">
              <div className="landing-hero-label">
                <span className="landing-hero-dot" />
                AI-Powered Emergency Response
              </div>

              <h1 className="landing-hero-title">
                Report emergencies.<br />
                Save lives faster.
              </h1>

              <p className="landing-hero-description">
                Our AI-powered platform connects citizens with emergency responders in real time.
                Upload a photo, describe the situation, and share your location — our system
                analyzes the severity and routes help where it's needed most.
              </p>

              <div className="landing-hero-actions">
                <Link to="/report" className="landing-hero-cta">
                  Report an Emergency
                  <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="landing-hero-secondary">
                  How it works
                </a>
              </div>

              {/* Quick stats */}
              <div className="landing-hero-stats">
                <div className="landing-hero-stat">
                  <span className="landing-hero-stat-value">{'<'}8 min</span>
                  <span className="landing-hero-stat-label">Avg. response time</span>
                </div>
                <div className="landing-hero-stat-divider" />
                <div className="landing-hero-stat">
                  <span className="landing-hero-stat-value">94%</span>
                  <span className="landing-hero-stat-label">AI accuracy</span>
                </div>
                <div className="landing-hero-stat-divider" />
                <div className="landing-hero-stat">
                  <span className="landing-hero-stat-value">24/7</span>
                  <span className="landing-hero-stat-label">Active monitoring</span>
                </div>
              </div>
            </div>
            
            <div className="landing-hero-stats-panel">
              <Statistics />
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="landing-process" id="how-it-works">
        <div className="container">
          <div className="landing-section-label">Process</div>
          <h2 className="landing-section-title">
            Report an emergency in 3 simple steps
          </h2>
          <p className="landing-section-description">
            No complicated forms. No phone trees. Just fast, direct emergency reporting
            with AI-powered analysis.
          </p>

          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-number">01</div>
              <div className="landing-step-icon">
                <Upload size={22} />
              </div>
              <h3 className="landing-step-title">Capture the Scene</h3>
              <p className="landing-step-description">
                Upload a photo of the emergency situation. Our AI analyzes the image
                to identify the type and severity of the disaster.
              </p>
            </div>

            <div className="landing-step">
              <div className="landing-step-number">02</div>
              <div className="landing-step-icon">
                <MapPin size={22} />
              </div>
              <h3 className="landing-step-title">Share Your Location</h3>
              <p className="landing-step-description">
                Allow location access or enter the address manually. Accurate location
                data helps responders reach you faster.
              </p>
            </div>

            <div className="landing-step">
              <div className="landing-step-number">03</div>
              <div className="landing-step-icon">
                <Brain size={22} />
              </div>
              <h3 className="landing-step-title">AI Analyzes & Routes</h3>
              <p className="landing-step-description">
                Our system instantly evaluates severity, assigns priority, and
                dispatches the appropriate emergency response teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="landing-features">
        <div className="container">
          <div className="landing-section-label">Why use this platform</div>
          <h2 className="landing-section-title">
            Built for real emergencies
          </h2>

          <div className="landing-features-grid">
            <div className="landing-feature">
              <div className="landing-feature-icon">
                <Zap size={20} />
              </div>
              <h3>Instant Analysis</h3>
              <p>AI processes disaster images in seconds, identifying type and severity automatically.</p>
            </div>

            <div className="landing-feature">
              <div className="landing-feature-icon">
                <Shield size={20} />
              </div>
              <h3>Priority Routing</h3>
              <p>Critical incidents are escalated immediately. Every report gets the right level of response.</p>
            </div>

            <div className="landing-feature">
              <div className="landing-feature-icon">
                <Clock size={20} />
              </div>
              <h3>Real-Time Tracking</h3>
              <p>Track your report status and see when help is on the way with live updates.</p>
            </div>

            <div className="landing-feature">
              <div className="landing-feature-icon">
                <MapPin size={20} />
              </div>
              <h3>Precise Location</h3>
              <p>GPS-accurate coordinates ensure emergency teams arrive at the exact right location.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="container">
          <div className="landing-footer-content">
            <div className="landing-footer-brand">
              <Shield size={18} />
              <span>DisasterResponse AI</span>
            </div>
            <p className="landing-footer-text">
              Emergency response platform powered by artificial intelligence.
            </p>
            <p className="landing-footer-text">
              For real emergencies, always call your local emergency number first.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
