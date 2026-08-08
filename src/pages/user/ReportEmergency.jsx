import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Send } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import ImageUploader from '../../components/user/ImageUploader';
import LocationPicker from '../../components/user/LocationPicker';
import { DISASTER_CATEGORIES } from '../../utils/constants';
import './ReportEmergency.css';

/**
 * Emergency report form page.
 * Users upload an image, describe the situation, choose a category,
 * share location, and submit.
 */
export default function ReportEmergency() {
  const navigate = useNavigate();

  // Form state — kept flat and simple
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  function validateForm() {
    const newErrors = {};

    if (!image) {
      newErrors.image = 'Please upload an image of the emergency';
    }
    if (!description.trim()) {
      newErrors.description = 'Please describe the emergency situation';
    }
    if (description.trim().length > 0 && description.trim().length < 10) {
      newErrors.description = 'Please provide more detail (at least 10 characters)';
    }
    if (!category) {
      newErrors.category = 'Please select a disaster category';
    }
    if (!location) {
      newErrors.location = 'Please provide your location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Bundle form data for the processing page
    const reportData = {
      image,
      description: description.trim(),
      category,
      location,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      submittedAt: new Date().toISOString(),
    };

    // Store in sessionStorage so the Processing page can access it
    sessionStorage.setItem('pendingReport', JSON.stringify({
      ...reportData,
      image: image ? image.name : null, // Can't serialize File to JSON
    }));

    // Navigate to the processing screen
    navigate('/report/processing', { state: { reportData } });
  }

  return (
    <div className="report-page">
      <Navbar variant="user" />

      <main className="report-main">
        <div className="container-narrow">
          {/* Page header */}
          <div className="report-header">
            <div className="report-header-icon">
              <AlertTriangle size={22} />
            </div>
            <h1 className="report-header-title">Report an Emergency</h1>
            <p className="report-header-description">
              Provide details about the emergency situation. Your report will be analyzed
              by AI and routed to the appropriate response team.
            </p>
          </div>

          {/* Report form */}
          <form className="report-form" onSubmit={handleSubmit} noValidate>
            {/* Step 1: Image Upload */}
            <div className="report-section">
              <label className="report-label">
                Emergency Image <span className="report-required">*</span>
              </label>
              <p className="report-help">
                Upload a clear photo of the emergency scene
              </p>
              <ImageUploader onImageSelect={setImage} />
              {errors.image && <p className="report-error">{errors.image}</p>}
            </div>

            {/* Step 2: Category */}
            <div className="report-section">
              <label className="report-label" htmlFor="category">
                Disaster Category <span className="report-required">*</span>
              </label>
              <select
                id="category"
                className="report-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a category…</option>
                {DISASTER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="report-error">{errors.category}</p>}
            </div>

            {/* Step 3: Description */}
            <div className="report-section">
              <label className="report-label" htmlFor="description">
                Description <span className="report-required">*</span>
              </label>
              <p className="report-help">
                What happened? Include details about injuries, people trapped, or immediate dangers.
              </p>
              <textarea
                id="description"
                className="report-textarea"
                placeholder="Describe the emergency situation…"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
              <div className="report-textarea-footer">
                <span>{description.length}/1000</span>
              </div>
              {errors.description && <p className="report-error">{errors.description}</p>}
            </div>

            {/* Step 4: Location */}
            <div className="report-section">
              <label className="report-label">
                Location <span className="report-required">*</span>
              </label>
              <p className="report-help">
                Help responders find you — allow GPS access or enter the address manually
              </p>
              <LocationPicker onLocationSelect={setLocation} />
              {errors.location && <p className="report-error">{errors.location}</p>}
            </div>

            {/* Step 5: Contact (optional) */}
            <div className="report-section">
              <label className="report-label">Contact Information (optional)</label>
              <p className="report-help">
                So responders can reach you if needed
              </p>
              <div className="report-contact-row">
                <input
                  type="text"
                  className="report-input"
                  placeholder="Your name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
                <input
                  type="tel"
                  className="report-input"
                  placeholder="Phone number"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="report-submit-btn"
              disabled={isSubmitting}
            >
              <Send size={18} />
              {isSubmitting ? 'Submitting…' : 'Submit Emergency Report'}
            </button>

            <p className="report-disclaimer">
              For immediate life-threatening emergencies, please also call your local
              emergency number (112 / 100 / 101).
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
