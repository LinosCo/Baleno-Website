'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

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
    };
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

    fetch('http://localhost:4000/api/payments/history', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setPayments(data);

        // Calculate stats
        const total = data.reduce((sum: number, p: Payment) => sum + parseFloat(p.amount.toString()), 0);
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
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Caricamento pagamenti...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Pagamenti</h1>
          <p className="text-gray-600 mt-1">Storico transazioni e pagamenti degli utenti</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Entrate Totali</p>
            <p className="text-3xl font-bold text-green-600">€{stats.total.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Completati</p>
            <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">In Attesa</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Rimborsati</p>
            <p className="text-3xl font-bold text-red-600">{stats.refunded}</p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Nessun pagamento registrato
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prenotazione</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Importo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                      {payment.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.booking.user.firstName} {payment.booking.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{payment.booking.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.booking.title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        €{parseFloat(payment.amount.toString()).toFixed(2)}
                      </div>
                      {payment.refundedAmount && (
                        <div className="text-xs text-red-600">
                          Rimborsato: €{parseFloat(payment.refundedAmount.toString()).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'SUCCEEDED'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'PENDING' || payment.status === 'PROCESSING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : payment.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
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
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
