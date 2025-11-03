'use client';

import { useEffect, useState } from 'react';
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
  images: string[];
  amenities: string[];
  location?: string;
}

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('http://localhost:4000/api/resources', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Errore nel caricamento delle risorse');
        setLoading(false);
      });
  }, [router]);

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
          <h1 className="h4 mb-0 text-baleno-primary fw-bold">Risorse Disponibili</h1>
          <Link href="/dashboard" className="text-decoration-none fw-medium" style={{ color: 'var(--baleno-primary)' }}>
            ← Torna alla dashboard
          </Link>
        </div>
      </nav>

      <div className="container py-4">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              {error}
            </div>
          )}

          {resources.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <div className="fs-1 mb-3">🏢</div>
                <p className="fs-5 text-muted">Nessuna risorsa disponibile al momento</p>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {resources.map(resource => (
                <div key={resource.id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100 overflow-hidden">
                    <div
                      className="d-flex align-items-center justify-content-center text-white"
                      style={{
                        height: '200px',
                        background: 'linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)'
                      }}
                    >
                      <div style={{ fontSize: '4rem' }}>
                        {resource.type === 'ROOM' && '🏠'}
                        {resource.type === 'EQUIPMENT' && '⚙️'}
                        {resource.type === 'SPACE' && '📍'}
                        {resource.type === 'VEHICLE' && '🚗'}
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h3 className="h5 fw-bold mb-0 text-baleno-primary">{resource.name}</h3>
                        <span
                          className={`badge ${
                            resource.isActive
                              ? 'bg-success'
                              : 'bg-danger'
                          }`}
                        >
                          {resource.isActive ? 'DISPONIBILE' : 'NON DISPONIBILE'}
                        </span>
                      </div>

                      <p className="small text-muted mb-3">{resource.description}</p>

                      <div className="d-flex flex-column gap-2 mb-3">
                        <div className="d-flex align-items-center small">
                          <span className="text-muted">Tipo:</span>
                          <span className="ms-2 fw-medium">{resource.type}</span>
                        </div>
                        <div className="d-flex align-items-center small">
                          <span className="text-muted">Capacità:</span>
                          <span className="ms-2 fw-medium">{resource.capacity} persone</span>
                        </div>
                        {resource.location && (
                          <div className="d-flex align-items-center small">
                            <span className="text-muted">Posizione:</span>
                            <span className="ms-2 fw-medium">{resource.location}</span>
                          </div>
                        )}
                      </div>

                      {resource.amenities && resource.amenities.length > 0 && (
                        <div className="mb-3">
                          <p className="small text-muted mb-2">Caratteristiche:</p>
                          <div className="d-flex flex-wrap gap-2">
                            {resource.amenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="badge bg-info bg-opacity-10 text-info-emphasis"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-top pt-3 mt-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="display-6 fw-bold text-primary mb-1">
                              €{resource.pricePerHour}
                            </p>
                            <p className="small text-muted mb-0">per ora</p>
                          </div>
                          {resource.isActive && (
                            <Link
                              href={`/bookings/new?resourceId=${resource.id}`}
                              className="btn btn-primary btn-sm fw-semibold"
                            >
                              Prenota
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
