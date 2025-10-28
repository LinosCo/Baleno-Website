'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Booking {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  resource: {
    name: string;
    type: string;
  };
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchBookings = () => {
    const token = localStorage.getItem('accessToken');
    const url = filter === 'ALL'
      ? 'http://localhost:4000/api/bookings'
      : `http://localhost:4000/api/bookings?status=${filter}`;

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const handleApprove = async (bookingId: string) => {
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`http://localhost:4000/api/bookings/${bookingId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchBookings();
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!rejectionReason.trim()) {
      alert('Inserisci un motivo per il rifiuto');
      return;
    }

    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`http://localhost:4000/api/bookings/${bookingId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason }),
      });

      if (response.ok) {
        fetchBookings();
        setShowModal(false);
        setRejectionReason('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Caricamento prenotazioni...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestione Prenotazioni</h1>
            <p className="text-gray-600 mt-1">Modera e gestisci tutte le prenotazioni</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'Tutte' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Nessuna prenotazione trovata
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titolo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risorsa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{booking.title}</div>
                      {booking.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {booking.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.user.firstName} {booking.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{booking.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{booking.resource.name}</div>
                      <div className="text-sm text-gray-500">{booking.resource.type}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(booking.startTime).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => openModal(booking)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Dettagli
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Dettagli Prenotazione</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Titolo</label>
                  <p className="text-lg font-semibold">{selectedBooking.title}</p>
                </div>

                {selectedBooking.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Descrizione</label>
                    <p className="text-gray-700">{selectedBooking.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Utente</label>
                    <p className="text-gray-900">
                      {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedBooking.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Risorsa</label>
                    <p className="text-gray-900">{selectedBooking.resource.name}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.resource.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data Inizio</label>
                    <p className="text-gray-900">
                      {new Date(selectedBooking.startTime).toLocaleString('it-IT')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data Fine</label>
                    <p className="text-gray-900">
                      {new Date(selectedBooking.endTime).toLocaleString('it-IT')}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Stato</label>
                  <p>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        selectedBooking.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : selectedBooking.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedBooking.status}
                    </span>
                  </p>
                </div>

                {selectedBooking.status === 'PENDING' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">
                        Motivo Rifiuto (opzionale)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Inserisci il motivo del rifiuto..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedBooking.id)}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        ✓ Approva
                      </button>
                      <button
                        onClick={() => handleReject(selectedBooking.id)}
                        className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
                      >
                        ✕ Rifiuta
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
