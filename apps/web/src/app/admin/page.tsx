'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { API_ENDPOINTS } from '../../config/api';
import Link from 'next/link';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  totalRevenue: number;
  totalUsers: number;
  totalResources: number;
  recentBookings: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    Promise.all([
      fetch(`${API_ENDPOINTS.reports}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(res => res.json()),
      fetch(`${API_ENDPOINTS.bookings}?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(res => res.json()),
    ])
      .then(([dashboardData, recentBookings]) => {
        setStats({
          ...dashboardData,
          recentBookings,
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <p className="text-muted">Caricamento statistiche...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-2">
          <h1 className="h3 fw-bold text-baleno-primary mb-1">Dashboard</h1>
          <p className="text-muted mb-0 small">Panoramica del sistema di prenotazione</p>
        </div>

        {/* Stats Grid */}
        <div className="row g-2 mb-3">
          <div className="col-md-6 col-xl-3">
            <Link href="/admin/bookings" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-card" style={{ cursor: 'pointer' }}>
                <div className="card-body py-2 px-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-muted small">Prenotazioni</span>
                    <svg width="20" height="20" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                  </div>
                  <div className="d-flex align-items-end">
                    <h3 className="display-6 fw-bold mb-0 me-2 text-dark">{stats?.totalBookings || 0}</h3>
                    <span className="text-muted small mb-1">totali</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-xl-3">
            <Link href="/admin/bookings" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-card" style={{ cursor: 'pointer' }}>
                <div className="card-body py-2 px-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-muted small">In Attesa</span>
                    <svg width="20" height="20" fill="currentColor" className="text-warning" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M8 4.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8 7.5V4.5z"/>
                    </svg>
                  </div>
                  <div className="d-flex align-items-end">
                    <h3 className="display-6 fw-bold mb-0 me-2 text-warning">{stats?.pendingBookings || 0}</h3>
                    <span className="text-muted small mb-1">da approvare</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-xl-3">
            <Link href="/admin/bookings" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-card" style={{ cursor: 'pointer' }}>
                <div className="card-body py-2 px-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-muted small">Approvate</span>
                    <svg width="20" height="20" fill="currentColor" className="text-success" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                    </svg>
                  </div>
                  <div className="d-flex align-items-end">
                    <h3 className="display-6 fw-bold mb-0 me-2 text-success">{stats?.approvedBookings || 0}</h3>
                    <span className="text-muted small mb-1">confermate</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-xl-3">
            <Link href="/admin/payments" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-card" style={{ cursor: 'pointer' }}>
                <div className="card-body py-2 px-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-muted small">Entrate</span>
                    <svg width="20" height="20" fill="currentColor" className="text-success" viewBox="0 0 16 16">
                      <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                      <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"/>
                    </svg>
                  </div>
                  <div className="d-flex align-items-end">
                    <h3 className="display-6 fw-bold mb-0 text-dark">€{stats?.totalRevenue || 0}</h3>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <Link href="/admin/users" className="text-decoration-none">
              <div className="card border-0 shadow-sm hover-card" style={{ cursor: 'pointer' }}>
                <div className="card-body py-2 px-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <svg width="32" height="32" fill="currentColor" className="text-primary opacity-75" viewBox="0 0 16 16">
                        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
                      </svg>
                    </div>
                    <div className="flex-grow-1">
                      <div className="small text-muted">Utenti Registrati</div>
                      <div className="h4 fw-bold mb-0 text-dark">{stats?.totalUsers || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6">
            <Link href="/admin/resources" className="text-decoration-none">
              <div className="card border-0 shadow-sm hover-card" style={{ cursor: 'pointer' }}>
                <div className="card-body py-2 px-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <svg width="32" height="32" fill="currentColor" className="text-primary opacity-75" viewBox="0 0 16 16">
                        <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z"/>
                        <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V1Zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3V1Z"/>
                      </svg>
                    </div>
                    <div className="flex-grow-1">
                      <div className="small text-muted">Risorse Disponibili</div>
                      <div className="h4 fw-bold mb-0 text-dark">{stats?.totalResources || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white border-0 py-2">
            <h2 className="h6 fw-bold mb-0">Prenotazioni Recenti</h2>
          </div>
          <div className="card-body p-0">
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="list-group list-group-flush">
                {stats.recentBookings.map((booking: any) => (
                  <Link
                    href="/admin/bookings"
                    key={booking.id}
                    className="list-group-item list-group-item-action text-decoration-none"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex w-100 justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold text-dark">{booking.title}</h6>
                        <p className="mb-1 small text-muted">
                          {booking.user.firstName} {booking.user.lastName} · {booking.resource.name}
                        </p>
                        <small className="text-muted">
                          {new Date(booking.startTime).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                      <span
                        className={`badge ${
                          booking.status === 'APPROVED'
                            ? 'bg-success'
                            : booking.status === 'PENDING'
                            ? 'bg-warning text-dark'
                            : 'bg-secondary'
                        }`}
                      >
                        {booking.status === 'APPROVED' ? 'Approvata' :
                         booking.status === 'PENDING' ? 'In Attesa' : 'Annullata'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">Nessuna prenotazione recente</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row g-2">
          <div className="col-md-4">
            <Link href="/admin/bookings" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-card">
                <div className="card-body py-2 px-3">
                  <div className="d-flex align-items-center mb-1">
                    <svg width="24" height="24" fill="currentColor" className="text-primary me-2" viewBox="0 0 16 16">
                      <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                    </svg>
                    <h3 className="h6 fw-bold mb-0">Gestisci Prenotazioni</h3>
                  </div>
                  <p className="text-muted small mb-0">Approva o rifiuta le prenotazioni in attesa</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
            <Link href="/admin/resources" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-card">
                <div className="card-body py-2 px-3">
                  <div className="d-flex align-items-center mb-1">
                    <svg width="24" height="24" fill="currentColor" className="text-primary me-2" viewBox="0 0 16 16">
                      <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V1Zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3V1Z"/>
                      <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z"/>
                    </svg>
                    <h3 className="h6 fw-bold mb-0">Gestisci Risorse</h3>
                  </div>
                  <p className="text-muted small mb-0">Aggiungi, modifica o rimuovi risorse</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
            <Link href="/admin/reports" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-card">
                <div className="card-body py-2 px-3">
                  <div className="d-flex align-items-center mb-1">
                    <svg width="24" height="24" fill="currentColor" className="text-primary me-2" viewBox="0 0 16 16">
                      <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/>
                    </svg>
                    <h3 className="h6 fw-bold mb-0">Visualizza Report</h3>
                  </div>
                  <p className="text-muted small mb-0">Analizza statistiche e report dettagliati</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-card {
          transition: all 0.2s ease-in-out;
        }
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </AdminLayout>
  );
}
