import { useState, useRef, useEffect } from 'react';
import { Upload, X, Camera, SwitchCamera } from 'lucide-react';
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
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async (mode = facingMode) => {
    setError('');
    setIsCameraMode(true);
    setFacingMode(mode);
    
    try {
      if (stream) {
        stopCamera();
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode }
      });
      
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError('Could not access camera. Please check permissions.');
      setIsCameraMode(false);
    }
  };

  const toggleCameraFacingMode = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(newMode);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to file
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Failed to capture photo');
        return;
      }
      const file = new File([blob], `emergency_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopCamera();
      setIsCameraMode(false);
      handleFile(file);
    }, 'image/jpeg', 0.85);
  };

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
      {isCameraMode ? (
        /* Camera View */
        <div className="image-uploader-camera">
          <video 
            ref={videoRef} 
            className="camera-video" 
            autoPlay 
            playsInline 
            muted
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div className="camera-controls">
            <button 
              type="button" 
              className="camera-btn close"
              onClick={() => {
                stopCamera();
                setIsCameraMode(false);
              }}
              aria-label="Close camera"
            >
              <X size={20} />
            </button>
            <button 
              type="button" 
              className="camera-btn capture"
              onClick={takePhoto}
              aria-label="Take photo"
            >
              <Camera size={24} />
            </button>
            <button 
              type="button" 
              className="camera-btn switch"
              onClick={toggleCameraFacingMode}
              aria-label="Switch camera"
            >
              <SwitchCamera size={20} />
            </button>
          </div>
        </div>
      ) : !preview ? (
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
          <div className="image-uploader-actions">
            <button 
              type="button" 
              className="image-uploader-camera-btn"
              onClick={(e) => {
                e.stopPropagation();
                startCamera();
              }}
            >
              <Camera size={16} /> Open Camera
            </button>
          </div>
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
