'use client';

import { useState, useRef } from 'react';
import { API_URL } from '../../config/api';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    // Validate number of files
    if (images.length + filesArray.length > maxImages) {
      alert(`Massimo ${maxImages} immagini consentite`);
      return;
    }

    // Validate file types
    const validFiles = filesArray.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        alert(`${file.name} non è un'immagine valida`);
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(`Caricamento di ${validFiles.length} immagine/i...`);

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      validFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_URL}/upload/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore durante il caricamento');
      }

      const data = await response.json();
      const newImages = [...images, ...data.urls];
      onImagesChange(newImages);
      setUploadProgress('Caricamento completato!');

      setTimeout(() => {
        setUploadProgress('');
      }, 2000);
    } catch (error: any) {
      alert(error.message || 'Errore durante il caricamento delle immagini');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageUrl: string, index: number) => {
    if (!confirm('Sei sicuro di voler eliminare questa immagine?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');

      // Delete from Cloudinary
      await fetch(`${API_URL}/upload/image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url: imageUrl }),
      });

      // Remove from state
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Errore durante l\'eliminazione dell\'immagine');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div>
      <label className="form-label fw-semibold">Galleria Immagini</label>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded p-4 text-center mb-3 ${
          dragActive ? 'border-primary bg-light' : 'border-secondary'
        } ${uploading ? 'opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="d-none"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploading}
        />

        {uploading ? (
          <div>
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <p className="mb-0 text-muted">{uploadProgress}</p>
          </div>
        ) : (
          <div>
            <svg className="mb-2" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
            </svg>
            <p className="mb-1">
              <strong>Trascina le immagini qui</strong> o clicca per selezionare
            </p>
            <p className="small text-muted mb-0">
              Massimo {maxImages} immagini • JPEG, PNG, WebP • Max 5MB ciascuna
            </p>
          </div>
        )}
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div>
          <div className="small text-muted mb-2">
            {images.length} immagine/i caricata/e (massimo {maxImages})
          </div>
          <div className="row g-2">
            {images.map((imageUrl, index) => (
              <div key={index} className="col-6 col-md-4 col-lg-3">
                <div className="position-relative">
                  <img
                    src={imageUrl}
                    alt={`Immagine ${index + 1}`}
                    className="img-fluid rounded border"
                    style={{ aspectRatio: '4/3', objectFit: 'cover', width: '100%' }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                    onClick={() => handleDelete(imageUrl, index)}
                    style={{ padding: '0.25rem 0.5rem' }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                  </button>
                  {index === 0 && (
                    <span className="badge bg-primary position-absolute bottom-0 start-0 m-1">
                      Principale
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="alert alert-info mt-3 mb-0">
        <small>
          💡 <strong>Suggerimento:</strong> La prima immagine sarà utilizzata come copertina.
          Puoi riordinare le immagini eliminando e ricaricandole nell'ordine desiderato.
        </small>
      </div>
    </div>
  );
}
