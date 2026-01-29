'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  booking: {
    title: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    } | null;
    // Manual booking fields
    isManualBooking?: boolean;
    manualGuestName?: string;
    manualGuestEmail?: string;
  };
  createdAt: string;
  refundedAmount?: number;
  refundedAt?: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    refunded: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/history`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setPayments(data);

        // Calculate stats
        const total = data.reduce((sum: number, p: Payment) => sum + (parseFloat(p.amount.toString()) / 100), 0);
        const completed = data.filter((p: Payment) => p.status === 'SUCCEEDED').length;
        const pending = data.filter((p: Payment) => p.status === 'PENDING' || p.status === 'PROCESSING').length;
        const refunded = data.filter((p: Payment) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED').length;

        setStats({ total, completed, pending, refunded });
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
            <p className="text-muted">Caricamento pagamenti...</p>
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
          <h1 className="h3 fw-bold text-baleno-primary">Gestione Pagamenti</h1>
          <p className="text-muted">Storico transazioni e pagamenti degli utenti</p>
        </div>

        {/* Stats */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted small mb-2">Entrate Totali</p>
                <p className="display-6 fw-bold text-success mb-0">€{stats.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted small mb-2">Completati</p>
                <p className="display-6 fw-bold text-primary mb-0">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted small mb-2">In Attesa</p>
                <p className="display-6 fw-bold text-warning mb-0">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted small mb-2">Rimborsati</p>
                <p className="display-6 fw-bold text-danger mb-0">{stats.refunded}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {payments.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p className="mb-0">Nessun pagamento registrato</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold text-uppercase small">ID</th>
                      <th className="fw-semibold text-uppercase small">Utente</th>
                      <th className="fw-semibold text-uppercase small">Prenotazione</th>
                      <th className="fw-semibold text-uppercase small">Importo</th>
                      <th className="fw-semibold text-uppercase small">Stato</th>
                      <th className="fw-semibold text-uppercase small">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="font-monospace text-muted small">
                          {payment.id.slice(0, 8)}...
                        </td>
                        <td>
                          <div className="fw-semibold">
                            {payment.booking.user ? `${payment.booking.user.firstName} ${payment.booking.user.lastName}` : (payment.booking.manualGuestName || 'Ospite')}
                          </div>
                          <div className="text-muted small">{payment.booking.user?.email || payment.booking.manualGuestEmail || 'N/A'}</div>
                        </td>
                        <td className="fw-medium">
                          {payment.booking.title}
                        </td>
                        <td>
                          <div className="fw-bold">
                            €{(parseFloat(payment.amount.toString()) / 100).toFixed(2)}
                          </div>
                          {payment.refundedAmount && (
                            <div className="text-danger small">
                              Rimborsato: €{(parseFloat(payment.refundedAmount.toString()) / 100).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              payment.status === 'SUCCEEDED'
                                ? 'bg-success'
                                : payment.status === 'PENDING' || payment.status === 'PROCESSING'
                                ? 'bg-warning text-dark'
                                : payment.status === 'FAILED'
                                ? 'bg-danger'
                                : 'bg-info'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="text-muted small">
                          {new Date(payment.createdAt).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
