'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

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

    // Fetch dashboard stats
    Promise.all([
      fetch('http://localhost:4000/api/reports/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(res => res.json()),
      fetch('http://localhost:4000/api/bookings?limit=5', {
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
        <div className="mb-4">
          <h1 className="h3 fw-bold text-baleno-primary">Dashboard Amministratore</h1>
          <p className="text-muted">Panoramica del sistema di prenotazione</p>
        </div>

        {/* Stats Grid - Top 4 Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <StatCard
              title="Prenotazioni Totali"
              value={stats?.totalBookings || 0}
              icon="📅"
              color="primary"
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard
              title="In Attesa"
              value={stats?.pendingBookings || 0}
              icon="⏳"
              color="warning"
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard
              title="Approvate"
              value={stats?.approvedBookings || 0}
              icon="✅"
              color="success"
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard
              title="Entrate Totali"
              value={`€${stats?.totalRevenue || 0}`}
              icon="💰"
              color="info"
            />
          </div>
        </div>

        {/* Stats Grid - Bottom 2 Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <StatCard
              title="Utenti Registrati"
              value={stats?.totalUsers || 0}
              icon="👥"
              color="secondary"
            />
          </div>
          <div className="col-md-6">
            <StatCard
              title="Risorse Disponibili"
              value={stats?.totalResources || 0}
              icon="🏢"
              color="danger"
            />
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h5 fw-bold mb-4">Prenotazioni Recenti</h2>
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {stats.recentBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="d-flex align-items-center justify-content-between p-3 border rounded"
                    style={{ transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="flex-grow-1">
                      <p className="fw-semibold mb-1">{booking.title}</p>
                      <p className="text-muted small mb-1">
                        {booking.user.firstName} {booking.user.lastName} - {booking.resource.name}
                      </p>
                      <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(booking.startTime).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`badge ${
                          booking.status === 'APPROVED'
                            ? 'bg-success'
                            : booking.status === 'PENDING'
                            ? 'bg-warning text-dark'
                            : 'bg-danger'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-5 mb-0">Nessuna prenotazione recente</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row g-4">
          <div className="col-md-4">
            <QuickActionCard
              title="Modera Prenotazioni"
              description="Approva o rifiuta le prenotazioni in attesa"
              href="/admin/bookings"
              icon="✅"
            />
          </div>
          <div className="col-md-4">
            <QuickActionCard
              title="Gestisci Risorse"
              description="Aggiungi, modifica o rimuovi risorse"
              href="/admin/resources"
              icon="🏢"
            />
          </div>
          <div className="col-md-4">
            <QuickActionCard
              title="Visualizza Report"
              description="Analizza statistiche e report dettagliati"
              href="/admin/reports"
              icon="📈"
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number | string; icon: string; color: string }) {
  const colorClasses = {
    primary: 'text-primary',
    warning: 'text-warning',
    success: 'text-success',
    info: 'text-info',
    secondary: 'text-secondary',
    danger: 'text-danger',
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="text-muted small mb-2">{title}</p>
            <p className="display-6 fw-bold mb-0">{value}</p>
          </div>
          <div className={`fs-1 ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <a
      href={href}
      className="card border-0 shadow-sm text-decoration-none h-100"
      style={{ transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0,0,0,0.15)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)'}
    >
      <div className="card-body">
        <div className="fs-1 mb-3">{icon}</div>
        <h3 className="h6 fw-bold text-baleno-primary mb-2">
          {title}
        </h3>
        <p className="text-muted small mb-0">{description}</p>
      </div>
    </a>
  );
}
