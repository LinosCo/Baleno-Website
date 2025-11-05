'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authAPI } from '../../lib/api-client';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    authAPI.getMe()
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
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
            <span className="text-white d-none d-md-inline fw-semibold" style={{ fontSize: '0.95rem' }}>
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-light text-primary fw-semibold px-4"
            >
              Logout
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
                    <p className="display-6 fw-bold text-baleno-primary mb-2">0</p>
                    <p className="text-muted small mb-0">Nessuna prenotazione attiva</p>
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
                          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
                        </svg>
                        <div className="fw-semibold text-baleno-primary">Impostazioni</div>
                      </div>
                    </Link>
                  </div>
                </div>
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
