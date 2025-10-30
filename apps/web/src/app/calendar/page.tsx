'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Booking {
  id: string;
  resourceId: string;
  resource: {
    name: string;
    type: string;
  };
  startTime: string;
  endTime: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/bookings/public/calendar')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Errore nel caricamento del calendario');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <p className="text-muted">Caricamento calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <nav className="navbar bg-white shadow-sm">
        <div className="container-fluid">
          <h1 className="h4 mb-0 text-baleno-primary fw-bold">Calendario Prenotazioni</h1>
          <Link href="/" className="text-decoration-none fw-medium" style={{ color: 'var(--baleno-primary)' }}>
            ← Torna alla home
          </Link>
        </div>
      </nav>

      {/* Calendar Content */}
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

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h4 fw-bold mb-4">Prenotazioni Approvate</h2>

              {bookings.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <div className="fs-1 mb-3">📅</div>
                  <p className="fs-5">Nessuna prenotazione al momento</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {bookings.map(booking => (
                    <div key={booking.id} className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h3 className="h6 fw-bold text-baleno-primary mb-2">
                            {booking.resource.name}
                          </h3>
                          <p className="small text-muted mb-1">
                            Tipo: {booking.resource.type}
                          </p>
                          <p className="small text-muted mb-0">
                            Prenotato da: {booking.user.firstName} {booking.user.lastName}
                          </p>
                        </div>
                        <div className="text-end">
                          <p className="small fw-medium mb-1">
                            {new Date(booking.startTime).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="small text-muted mb-2">
                            {new Date(booking.startTime).toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} -{' '}
                            {new Date(booking.endTime).toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <span className="badge bg-success">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <Link href="/register" className="btn btn-primary btn-lg fw-semibold">
              Registrati per prenotare
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
