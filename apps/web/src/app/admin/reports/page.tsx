'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    fetch('http://localhost:4000/api/reports/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
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
            <p className="text-muted">Caricamento report...</p>
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
          <h1 className="h3 fw-bold text-baleno-primary">Report & Analytics</h1>
          <p className="text-muted">Statistiche dettagliate del sistema</p>
        </div>

        {/* Overview Stats */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
              <div className="card-body">
                <p className="small mb-2" style={{ opacity: 0.9 }}>Prenotazioni Totali</p>
                <p className="display-5 fw-bold mb-0">{stats?.totalBookings || 0}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #198754 0%, #146c43 100%)' }}>
              <div className="card-body">
                <p className="small mb-2" style={{ opacity: 0.9 }}>Entrate Totali</p>
                <p className="display-5 fw-bold mb-0">€{stats?.totalRevenue || 0}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #59359a 100%)' }}>
              <div className="card-body">
                <p className="small mb-2" style={{ opacity: 0.9 }}>Utenti Registrati</p>
                <p className="display-5 fw-bold mb-0">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #d63384 0%, #ab296a 100%)' }}>
              <div className="card-body">
                <p className="small mb-2" style={{ opacity: 0.9 }}>Risorse Attive</p>
                <p className="display-5 fw-bold mb-0">{stats?.totalResources || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Status Breakdown */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h5 fw-bold mb-4">Stato Prenotazioni</h2>
            <div className="row g-4">
              <div className="col-md-6 col-lg-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">In Attesa</span>
                  <span className="fs-5 fw-bold text-warning">{stats?.pendingBookings || 0}</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{
                      width: `${((stats?.pendingBookings || 0) / (stats?.totalBookings || 1)) * 100}%`,
                    }}
                    aria-valuenow={stats?.pendingBookings || 0}
                    aria-valuemin={0}
                    aria-valuemax={stats?.totalBookings || 1}
                  ></div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">Approvate</span>
                  <span className="fs-5 fw-bold text-success">{stats?.approvedBookings || 0}</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{
                      width: `${((stats?.approvedBookings || 0) / (stats?.totalBookings || 1)) * 100}%`,
                    }}
                    aria-valuenow={stats?.approvedBookings || 0}
                    aria-valuemin={0}
                    aria-valuemax={stats?.totalBookings || 1}
                  ></div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">Rifiutate</span>
                  <span className="fs-5 fw-bold text-danger">{stats?.rejectedBookings || 0}</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-danger"
                    role="progressbar"
                    style={{
                      width: `${((stats?.rejectedBookings || 0) / (stats?.totalBookings || 1)) * 100}%`,
                    }}
                    aria-valuenow={stats?.rejectedBookings || 0}
                    aria-valuemin={0}
                    aria-valuemax={stats?.totalBookings || 1}
                  ></div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">Completate</span>
                  <span className="fs-5 fw-bold text-primary">{stats?.completedBookings || 0}</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{
                      width: `${((stats?.completedBookings || 0) / (stats?.totalBookings || 1)) * 100}%`,
                    }}
                    aria-valuenow={stats?.completedBookings || 0}
                    aria-valuemin={0}
                    aria-valuemax={stats?.totalBookings || 1}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted small mb-2">Tasso di Approvazione</p>
                <p className="display-6 fw-bold text-success mb-0">
                  {stats?.totalBookings
                    ? Math.round(((stats?.approvedBookings || 0) / stats.totalBookings) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted small mb-2">Entrate Medie/Prenotazione</p>
                <p className="display-6 fw-bold text-primary mb-0">
                  €
                  {stats?.totalBookings && stats?.totalRevenue
                    ? (stats.totalRevenue / stats.totalBookings).toFixed(2)
                    : 0}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted small mb-2">Utilizzo Risorse</p>
                <p className="display-6 fw-bold mb-0" style={{ color: '#6f42c1' }}>
                  {stats?.totalResources && stats?.totalBookings
                    ? (stats.totalBookings / stats.totalResources).toFixed(1)
                    : 0}
                  <span className="fs-5 text-muted ms-1">/risorsa</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="alert alert-info border-0 d-flex align-items-start">
          <div className="fs-4 me-3">📊</div>
          <div>
            <h3 className="h6 fw-bold mb-2">Analytics Avanzate</h3>
            <p className="small mb-0">
              Questa sezione fornisce una panoramica delle metriche chiave del sistema. Per report più dettagliati,
              esporta i dati tramite le API o integra strumenti di analytics esterni.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
