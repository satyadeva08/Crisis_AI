import {
  TrendingDown,
  TrendingUp,
  Droplets,
  Wind,
  Thermometer,
  Waves,
  AlertTriangle,
  IndianRupee,
  Users,
  ShieldCheck,
} from 'lucide-react';

import Navbar from '../../components/common/Navbar';
import './Statistics.css';

const hazardFrequency = [
  { name: 'Floods', value: 33 },
  { name: 'Heatwaves', value: 24 },
  { name: 'Droughts', value: 22 },
  { name: 'Cold Spells', value: 16 },
  { name: 'Cyclones', value: 5 },
];

const deathDistribution = [
  { name: 'Cyclones', value: 48 },
  { name: 'Heatwaves', value: 26 },
  { name: 'Floods', value: 18 },
  { name: 'Cold Waves', value: 8 },
];

const recentDisasters = [
  {
    year: '2018',
    event: 'Kerala Floods',
    deaths: '483',
    damage: '~$10B',
  },
  {
    year: '2019',
    event: 'Cyclone Fani',
    deaths: '89',
    damage: 'Major regional losses',
  },
  {
    year: '2020',
    event: 'Cyclone Amphan',
    deaths: '103',
    damage: '$14B',
  },
  {
    year: '2021',
    event: 'Monsoon Floods',
    deaths: '1,282',
    damage: 'Severe regional losses',
  },
];

const impactScenarios = [
  {
    level: 'Low',
    adoption: '10%',
    response: '-10%',
    unmet: '-15%',
    deaths: '-10%',
    losses: '-5%',
  },
  {
    level: 'Medium',
    adoption: '25%',
    response: '-25%',
    unmet: '-35%',
    deaths: '-25%',
    losses: '-15%',
  },
  {
    level: 'High',
    adoption: '50%',
    response: '-50%',
    unmet: '-60%',
    deaths: '-50%',
    losses: '-30%',
  },
];

function getHazardIcon(name) {
  switch (name) {
    case 'Floods':
      return <Droplets size={18} />;
    case 'Heatwaves':
      return <Thermometer size={18} />;
    case 'Droughts':
      return <Waves size={18} />;
    case 'Cold Spells':
      return <Thermometer size={18} />;
    case 'Cyclones':
      return <Wind size={18} />;
    default:
      return <AlertTriangle size={18} />;
  }
}

export default function Statistics() {
  return (
    <div className="statistics-page">
      <Navbar variant="user" />

      {/* Hero */}
      <section className="statistics-hero">
        <div className="container">
          <div className="statistics-hero-content">
            <div className="statistics-eyebrow">
              <span className="statistics-eyebrow-dot" />
              INDIA DISASTER DATA
            </div>

            <h1>
              India's Disaster Reality
              <span>By the Numbers.</span>
            </h1>

            <p>
              A data-driven view of the frequency, human cost and economic
              impact of disasters across India.
            </p>

            <div className="statistics-period">
              <span>DATA PERIOD</span>
              <strong>1995 — 2021</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Key numbers */}
      <section className="statistics-section statistics-overview">
        <div className="container">
          <div className="statistics-section-heading">
            <span>01</span>
            <div>
              <p className="statistics-label">THE BIG PICTURE</p>
              <h2>Disaster impact at a glance</h2>
            </div>
          </div>

          <div className="statistics-metrics">
            <div className="statistics-metric">
              <div className="statistics-metric-icon">
                <IndianRupee size={22} />
              </div>
              <strong>$79.5B</strong>
              <span>
                Estimated economic losses from natural disasters
                <small>1998 — 2017</small>
              </span>
            </div>

            <div className="statistics-metric">
              <div className="statistics-metric-icon">
                <Users size={22} />
              </div>
              <strong>104,311</strong>
              <span>
                Deaths from four major climate hazards
                <small>1995 — 2020</small>
              </span>
            </div>

            <div className="statistics-metric">
              <div className="statistics-metric-icon">
                <Droplets size={22} />
              </div>
              <strong>33%</strong>
              <span>
                Of recorded disaster events were floods
                <small>1995 — 2020</small>
              </span>
            </div>

            <div className="statistics-metric">
              <div className="statistics-metric-icon">
                <AlertTriangle size={22} />
              </div>
              <strong>48%</strong>
              <span>
                Of disaster deaths were attributed to cyclones
                <small>1995 — 2020</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Hazard frequency */}
      <section className="statistics-section statistics-light-section">
        <div className="container">
          <div className="statistics-section-heading">
            <span>02</span>
            <div>
              <p className="statistics-label">EVENT FREQUENCY</p>
              <h2>What disasters occur most often?</h2>
            </div>
          </div>

          <div className="statistics-chart-card">
            <div className="statistics-chart-header">
              <div>
                <h3>Hazard distribution</h3>
                <p>Share of recorded disaster events</p>
              </div>
              <span className="statistics-source-tag">
                1995 — 2020
              </span>
            </div>

            <div className="statistics-bars">
              {hazardFrequency.map((hazard, index) => (
                <div className="statistics-bar-row" key={hazard.name}>
                  <div className="statistics-bar-label">
                    <span className="statistics-bar-number">
                      0{index + 1}
                    </span>
                    <span className="statistics-bar-icon">
                      {getHazardIcon(hazard.name)}
                    </span>
                    <strong>{hazard.name}</strong>
                  </div>

                  <div className="statistics-bar-track">
                    <div
                      className="statistics-bar-fill"
                      style={{ width: `${hazard.value}%` }}
                    />
                  </div>

                  <strong className="statistics-bar-value">
                    {hazard.value}%
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Death distribution */}
      <section className="statistics-section">
        <div className="container">
          <div className="statistics-section-heading">
            <span>03</span>
            <div>
              <p className="statistics-label">HUMAN COST</p>
              <h2>Frequency doesn't tell the whole story</h2>
            </div>
          </div>

          <div className="statistics-death-layout">
            <div className="statistics-death-card">
              <div className="statistics-death-circle">
                <strong>48%</strong>
                <span>CYCLONES</span>
              </div>

              <div>
                <p>
                  Cyclones were relatively less frequent than floods,
                  droughts and heatwaves, yet accounted for the largest
                  share of recorded disaster deaths.
                </p>
              </div>
            </div>

            <div className="statistics-death-list">
              {deathDistribution.map((item) => (
                <div className="statistics-death-item" key={item.name}>
                  <div className="statistics-death-item-top">
                    <span>{item.name}</span>
                    <strong>{item.value}%</strong>
                  </div>

                  <div className="statistics-death-track">
                    <div
                      className="statistics-death-fill"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent disasters */}
      <section className="statistics-section statistics-dark-section">
        <div className="container">
          <div className="statistics-section-heading statistics-heading-dark">
            <span>04</span>
            <div>
              <p className="statistics-label">RECENT EVENTS</p>
              <h2>Recent disasters. Real consequences.</h2>
            </div>
          </div>

          <div className="statistics-events">
            {recentDisasters.map((event) => (
              <div className="statistics-event" key={event.year}>
                <div className="statistics-event-year">
                  {event.year}
                </div>

                <div className="statistics-event-main">
                  <h3>{event.event}</h3>
                  <span>Reported impact</span>
                </div>

                <div className="statistics-event-stat">
                  <strong>{event.deaths}</strong>
                  <span>Deaths</span>
                </div>

                <div className="statistics-event-stat">
                  <strong>{event.damage}</strong>
                  <span>Economic impact</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fani comparison */}
      <section className="statistics-section">
        <div className="container">
          <div className="statistics-section-heading">
            <span>05</span>
            <div>
              <p className="statistics-label">PREPAREDNESS MATTERS</p>
              <h2>The evacuation effect</h2>
            </div>
          </div>

          <div className="statistics-comparison">
            <div className="statistics-comparison-side">
              <span>1999</span>
              <strong>~10,000</strong>
              <p>Deaths in the Odisha super cyclone</p>
            </div>

            <div className="statistics-comparison-arrow">
              <TrendingDown size={32} />
              <strong>&gt;99%</strong>
              <span>Reduction</span>
            </div>

            <div className="statistics-comparison-side statistics-comparison-highlight">
              <span>2019</span>
              <strong>64</strong>
              <p>Deaths in Odisha during Cyclone Fani</p>
            </div>
          </div>

          <div className="statistics-evidence">
            <ShieldCheck size={20} />
            <p>
              Odisha evacuated approximately 1.2 million people ahead of
              Cyclone Fani. The comparison illustrates how preparedness
              and early evacuation can dramatically reduce casualties.
            </p>
          </div>
        </div>
      </section>

      {/* CrisisAI model */}
      <section className="statistics-section statistics-model-section">
        <div className="container">
          <div className="statistics-section-heading">
            <span>06</span>
            <div>
              <p className="statistics-label">CRISISAI MODEL</p>
              <h2>Potential impact of faster response</h2>
            </div>
          </div>

          <div className="statistics-model-intro">
            <p>
              These figures are <strong>illustrative model scenarios</strong>,
              not measured real-world results. They show how improvements in
              response time and unmet needs could translate into potential
              reductions in casualties and losses.
            </p>
          </div>

          <div className="statistics-model-table">
            <div className="statistics-model-row statistics-model-header">
              <span>Adoption</span>
              <span>Response Time</span>
              <span>Unmet Needs</span>
              <span>Deaths</span>
              <span>Losses</span>
            </div>

            {impactScenarios.map((scenario) => (
              <div
                className="statistics-model-row"
                key={scenario.level}
              >
                <span>
                  <strong>{scenario.level}</strong>
                  <small>{scenario.adoption} adoption</small>
                </span>
                <strong>{scenario.response}</strong>
                <strong>{scenario.unmet}</strong>
                <strong>{scenario.deaths}</strong>
                <strong>{scenario.losses}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer source */}
      <section className="statistics-source-section">
        <div className="container">
          <div className="statistics-source">
            <div>
              <p className="statistics-label">DATA NOTE</p>
              <h3>Sources & methodology</h3>
            </div>

            <p>
              Statistics compiled from the research material provided for
              CrisisAI, including NDMA/NIDM analyses, UNDRR data and
              disaster case reports. Historical figures and modelled
              scenarios should be interpreted within their stated periods
              and assumptions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
