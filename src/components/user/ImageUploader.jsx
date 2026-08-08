import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import './ImageUploader.css';

/**
 * Drag-and-drop image uploader with preview.
 *
 * Props:
 *   onImageSelect — callback receiving the selected File object
 *   maxSizeMB    — maximum file size in MB (default: 10)
 */
export default function ImageUploader({ onImageSelect, maxSizeMB = 10 }) {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function handleFile(file) {
    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP)');
      return;
    }

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size must be under ${maxSizeMB}MB`);
      return;
    }

    // Generate preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onImageSelect(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleInputChange(event) {
    const file = event.target.files[0];
    if (file) handleFile(file);
  }

  function handleRemove() {
    setPreview(null);
    setError('');
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="image-uploader">
      {!preview ? (
        /* Drop zone — shown when no image is selected */
        <div
          className={`image-uploader-dropzone ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload disaster image"
        >
          <div className="image-uploader-icon">
            <Upload size={24} />
          </div>
          <p className="image-uploader-text">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="image-uploader-hint">
            JPG, PNG or WebP (max {maxSizeMB}MB)
          </p>
        </div>
      ) : (
        /* Preview — shown when an image is selected */
        <div className="image-uploader-preview">
          <img src={preview} alt="Uploaded disaster image preview" />
          <button
            className="image-uploader-remove"
            onClick={handleRemove}
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="image-uploader-input"
        aria-hidden="true"
      />

      {/* Error message */}
      {error && <p className="image-uploader-error">{error}</p>}
    </div>
  );
}
