'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authAPI } from '../../lib/api-client';

interface Booking {
  id: string;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
  resource: {
    name: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Fetch user data
    authAPI.getMe()
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      });

    // Fetch user bookings
    fetch('/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoadingBookings(false);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setBookings([]);
        setLoadingBookings(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-warning text-dark';
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      case 'CANCELLED': return 'bg-secondary';
      case 'COMPLETED': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'In Attesa';
      case 'APPROVED': return 'Approvata';
      case 'REJECTED': return 'Rifiutata';
      case 'CANCELLED': return 'Cancellata';
      case 'COMPLETED': return 'Completata';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-primary shadow-lg sticky-top" style={{ padding: '1rem 0' }}>
        <div className="container-fluid px-4">
          <Link href="/dashboard" className="navbar-brand d-flex align-items-center">
            <Image
              src="/BALENO-LOGO-BIANCO.png"
              alt="Baleno San Zeno"
              width={200}
              height={65}
              style={{ height: '55px', width: 'auto' }}
              priority
            />
          </Link>
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={handleLogout}
              className="btn btn-link text-white p-0 text-decoration-none d-flex flex-column align-items-center"
              style={{ minWidth: '80px' }}
            >
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16" className="mb-1">
                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
              </svg>
              <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                {user?.firstName} {user?.lastName}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <h1 className="h2 fw-bold text-baleno-primary mb-4">Dashboard</h1>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <svg width="24" height="24" fill="currentColor" className="text-primary me-2" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                      </svg>
                      <h3 className="h6 mb-0 fw-semibold">Profilo</h3>
                    </div>
                    <p className="text-muted small mb-2">
                      Email: {user?.email}
                    </p>
                    <p className="text-muted small mb-0">
                      Ruolo: <span className="fw-semibold badge bg-primary">{user?.role}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <svg width="24" height="24" fill="currentColor" className="text-primary me-2" viewBox="0 0 16 16">
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                      </svg>
                      <h3 className="h6 mb-0 fw-semibold">Prenotazioni</h3>
                    </div>
                    {loadingBookings ? (
                      <div className="spinner-border spinner-border-sm text-primary"></div>
                    ) : (
                      <>
                        <p className="display-6 fw-bold text-baleno-primary mb-2">{bookings.length}</p>
                        <p className="text-muted small mb-0">
                          {bookings.length === 0 ? 'Nessuna prenotazione' : bookings.length === 1 ? '1 prenotazione' : `${bookings.length} prenotazioni`}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <svg width="24" height="24" fill="currentColor" className="text-primary me-2" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>
                        <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"/>
                      </svg>
                      <h3 className="h6 mb-0 fw-semibold">Pagamenti</h3>
                    </div>
                    <p className="display-6 fw-bold text-success mb-2">€0</p>
                    <p className="text-muted small mb-0">Totale speso</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h2 className="h5 fw-bold mb-4">Azioni Rapide</h2>
                <div className="row g-3">
                  <div className="col-md-6 col-lg-3">
                    <Link
                      href="/bookings/new"
                      className="card border-2 border-dashed text-center text-decoration-none h-100"
                      style={{ borderColor: 'var(--baleno-primary)', transition: 'all 0.2s' }}
                    >
                      <div className="card-body">
                        <svg width="48" height="48" fill="currentColor" className="text-primary mb-2" viewBox="0 0 16 16">
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>
                        <div className="fw-semibold text-baleno-primary">Nuova Prenotazione</div>
                      </div>
                    </Link>
                  </div>

                  <div className="col-md-6 col-lg-3">
                    <Link
                      href="/resources"
                      className="card border-2 border-dashed text-center text-decoration-none h-100"
                      style={{ borderColor: 'var(--baleno-primary)', transition: 'all 0.2s' }}
                    >
                      <div className="card-body">
                        <svg width="48" height="48" fill="currentColor" className="text-primary mb-2" viewBox="0 0 16 16">
                          <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V1Zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3V1Z"/>
                          <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z"/>
                        </svg>
                        <div className="fw-semibold text-baleno-primary">Visualizza Risorse</div>
                      </div>
                    </Link>
                  </div>

                  <div className="col-md-6 col-lg-3">
                    <Link
                      href="/bookings"
                      className="card border-2 border-dashed text-center text-decoration-none h-100"
                      style={{ borderColor: 'var(--baleno-primary)', transition: 'all 0.2s' }}
                    >
                      <div className="card-body">
                        <svg width="48" height="48" fill="currentColor" className="text-primary mb-2" viewBox="0 0 16 16">
                          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                        </svg>
                        <div className="fw-semibold text-baleno-primary">Le Mie Prenotazioni</div>
                      </div>
                    </Link>
                  </div>

                  <div className="col-md-6 col-lg-3">
                    <Link
                      href="/profile"
                      className="card border-2 border-dashed text-center text-decoration-none h-100"
                      style={{ borderColor: 'var(--baleno-primary)', transition: 'all 0.2s' }}
                    >
                      <div className="card-body">
                        <svg width="48" height="48" fill="currentColor" className="text-primary mb-2" viewBox="0 0 16 16">
                          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                          <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1v-1c0-1-1-4-6-4s-6 3-6 4v1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12z"/>
                        </svg>
                        <div className="fw-semibold text-baleno-primary">Impostazioni</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h5 fw-bold mb-0">Le Tue Prenotazioni</h2>
                  <Link href="/bookings" className="btn btn-sm btn-outline-primary">
                    Vedi Tutte
                  </Link>
                </div>

                {loadingBookings ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Caricamento...</span>
                    </div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-5">
                    <svg width="64" height="64" fill="currentColor" className="text-muted mb-3" viewBox="0 0 16 16">
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    <p className="text-muted mb-3">Nessuna prenotazione trovata</p>
                    <Link href="/bookings/new" className="btn btn-primary">
                      Crea Nuova Prenotazione
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Titolo</th>
                          <th>Risorsa</th>
                          <th>Data Inizio</th>
                          <th>Stato</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((booking) => (
                          <tr key={booking.id}>
                            <td className="fw-semibold">{booking.title}</td>
                            <td className="text-muted small">{booking.resource.name}</td>
                            <td className="text-muted small">
                              {new Date(booking.startTime).toLocaleDateString('it-IT', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                                {getStatusLabel(booking.status)}
                              </span>
                            </td>
                            <td>
                              <Link
                                href={`/bookings`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                Dettagli
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Panel */}
            {(user?.role === 'ADMIN' || user?.role === 'COMMUNITY_MANAGER') && (
              <div className="card border-0 shadow-sm" style={{ backgroundColor: '#fff9e6' }}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-4">
                    <svg width="28" height="28" fill="currentColor" className="text-primary me-2" viewBox="0 0 16 16">
                      <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.27 3.27a.997.997 0 0 0 1.414 0l1.586-1.586a.997.997 0 0 0 0-1.414l-3.27-3.27a1 1 0 0 0-1.023-.242L10.5 9.5l-.96-.96 2.68-2.643A3.005 3.005 0 0 0 16 3c0-.269-.035-.53-.102-.777l-2.14 2.141L12 4l-.364-1.757L13.777.102a3 3 0 0 0-3.675 3.68L7.462 6.46 4.793 3.793a1 1 0 0 1-.293-.707v-.071a1 1 0 0 0-.419-.814L1 0zm9.646 10.646a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708zM3 11l.471.242.529.026.287.445.445.287.026.529L5 13l-.242.471-.026.529-.445.287-.287.445-.529.026L3 15l-.471-.242L2 14.732l-.287-.445L1.268 14l-.026-.529L1 13l.242-.471.026-.529.445-.287.287-.445.529-.026L3 11z"/>
                    </svg>
                    <h2 className="h5 fw-bold mb-0 text-baleno-primary">Pannello Amministratore</h2>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <Link
                        href="/admin"
                        className="card border-0 shadow-sm text-decoration-none"
                      >
                        <div className="card-body">
                          <div className="fw-semibold text-baleno-primary">Dashboard Admin</div>
                        </div>
                      </Link>
                    </div>
                    <div className="col-md-4">
                      <Link
                        href="/admin/resources"
                        className="card border-0 shadow-sm text-decoration-none"
                      >
                        <div className="card-body">
                          <div className="fw-semibold text-baleno-primary">Gestione Risorse</div>
                        </div>
                      </Link>
                    </div>
                    <div className="col-md-4">
                      <Link
                        href="/admin/bookings"
                        className="card border-0 shadow-sm text-decoration-none"
                      >
                        <div className="card-body">
                          <div className="fw-semibold text-baleno-primary">Gestione Prenotazioni</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
