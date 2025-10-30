'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authAPI } from '@/lib/api-client';

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
      <nav className="navbar navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <Link href="/dashboard" className="navbar-brand">
            <Image
              src="/BALENO-LOGO-BIANCO.png"
              alt="Baleno Sanzeno"
              width={140}
              height={45}
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white d-none d-md-inline">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-secondary"
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
                      <span className="fs-3 me-2">👤</span>
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
                      <span className="fs-3 me-2">📅</span>
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
                      <span className="fs-3 me-2">💳</span>
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
                        <div className="fs-1 mb-2">➕</div>
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
                        <div className="fs-1 mb-2">🏢</div>
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
                        <div className="fs-1 mb-2">📋</div>
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
                        <div className="fs-1 mb-2">⚙️</div>
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
                    <span className="fs-3 me-2">🔧</span>
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
