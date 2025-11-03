'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  isActive: boolean;
}

export default function NewBookingPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch available resources
    fetch('http://localhost:4000/api/resources', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setResources(data.filter((r: Resource) => r.isActive === true));
        setLoading(false);
      })
      .catch(err => {
        setError('Errore nel caricamento delle risorse');
        setLoading(false);
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');

      // Convert to ISO strings
      const bookingData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore nella creazione della prenotazione');
      }

      setSuccess('Prenotazione creata con successo! Reindirizzamento...');
      setTimeout(() => {
        router.push('/bookings');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Errore nella creazione della prenotazione');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedResource = resources.find(r => r.id === formData.resourceId);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <p className="text-muted">Caricamento risorse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar bg-white shadow-sm">
        <div className="container-fluid">
          <h1 className="h4 mb-0 text-baleno-primary fw-bold">Nuova Prenotazione</h1>
          <Link href="/dashboard" className="text-decoration-none fw-medium" style={{ color: 'var(--baleno-primary)' }}>
            ← Torna alla dashboard
          </Link>
        </div>
      </nav>

      <div className="container py-4">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                    <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </svg>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                    <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                    {success}
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="resourceId" className="form-label fw-semibold">
                    Risorsa *
                  </label>
                  <select
                    id="resourceId"
                    value={formData.resourceId}
                    onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                    required
                    className="form-select form-select-lg"
                  >
                    <option value="">Seleziona una risorsa</option>
                    {resources.map(resource => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name} - {resource.type} (€{resource.pricePerHour}/ora)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedResource && (
                  <div className="alert alert-info border-0 mb-4">
                    <h3 className="h6 fw-bold mb-2 text-info-emphasis">{selectedResource.name}</h3>
                    <p className="small mb-3">{selectedResource.description}</p>
                    <div className="row g-3 small">
                      <div className="col-6">
                        <span className="text-muted">Capacità:</span>{' '}
                        <span className="fw-semibold">{selectedResource.capacity} persone</span>
                      </div>
                      <div className="col-6">
                        <span className="text-muted">Prezzo:</span>{' '}
                        <span className="fw-semibold">€{selectedResource.pricePerHour}/ora</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="startTime" className="form-label fw-semibold">
                    Data e Ora Inizio *
                  </label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    className="form-control form-control-lg"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="endTime" className="form-label fw-semibold">
                    Data e Ora Fine *
                  </label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    min={formData.startTime || new Date().toISOString().slice(0, 16)}
                    className="form-control form-control-lg"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="title" className="form-label fw-semibold">
                    Titolo Prenotazione *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Es: Riunione team di progetto"
                    className="form-control form-control-lg"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="form-label fw-semibold">
                    Descrizione (opzionale)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Aggiungi dettagli sulla prenotazione..."
                    className="form-control"
                  />
                </div>

                <div className="d-flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting || !formData.resourceId || !formData.startTime || !formData.endTime || !formData.title}
                    className="btn btn-primary btn-lg flex-fill fw-semibold"
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creazione in corso...
                      </>
                    ) : (
                      'Crea Prenotazione'
                    )}
                  </button>
                  <Link
                    href="/dashboard"
                    className="btn btn-secondary btn-lg flex-fill fw-semibold text-center"
                  >
                    Annulla
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
