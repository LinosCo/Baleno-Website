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
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <p className="text-muted">Caricamento prenotazioni...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statusLabels: Record<string, string> = {
    'ALL': 'Tutte',
    'PENDING': 'In Attesa',
    'APPROVED': 'Approvate',
    'REJECTED': 'Rifiutate',
    'CANCELLED': 'Cancellate'
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-4">
          <h1 className="h3 fw-bold text-baleno-primary">Gestione Prenotazioni</h1>
          <p className="text-muted">Modera e gestisci tutte le prenotazioni</p>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`btn ${
                    filter === status
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {bookings.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p className="mb-0">Nessuna prenotazione trovata</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold text-uppercase small">Titolo</th>
                      <th className="fw-semibold text-uppercase small">Utente</th>
                      <th className="fw-semibold text-uppercase small">Risorsa</th>
                      <th className="fw-semibold text-uppercase small">Data</th>
                      <th className="fw-semibold text-uppercase small">Stato</th>
                      <th className="fw-semibold text-uppercase small">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div className="fw-semibold">{booking.title}</div>
                          {booking.description && (
                            <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                              {booking.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="fw-medium">
                            {booking.user.firstName} {booking.user.lastName}
                          </div>
                          <div className="text-muted small">{booking.user.email}</div>
                        </td>
                        <td>
                          <div className="fw-medium">{booking.resource.name}</div>
                          <div className="text-muted small">{booking.resource.type}</div>
                        </td>
                        <td className="text-muted small">
                          {new Date(booking.startTime).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td>
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
                        </td>
                        <td>
                          <button
                            onClick={() => openModal(booking)}
                            className="btn btn-sm btn-link text-decoration-none fw-semibold"
                          >
                            Dettagli →
                          </button>
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

      {/* Modal Bootstrap Italia */}
      {showModal && selectedBooking && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-baleno-primary">
                    Dettagli Prenotazione
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-semibold">Titolo</label>
                    <p className="h5 mb-0">{selectedBooking.title}</p>
                  </div>

                  {selectedBooking.description && (
                    <div className="mb-4">
                      <label className="form-label text-muted small fw-semibold">Descrizione</label>
                      <p className="mb-0">{selectedBooking.description}</p>
                    </div>
                  )}

                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Utente</label>
                      <p className="fw-semibold mb-1">
                        {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                      </p>
                      <p className="text-muted small mb-0">{selectedBooking.user.email}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Risorsa</label>
                      <p className="fw-semibold mb-1">{selectedBooking.resource.name}</p>
                      <p className="text-muted small mb-0">{selectedBooking.resource.type}</p>
                    </div>
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Data Inizio</label>
                      <p className="mb-0">
                        {new Date(selectedBooking.startTime).toLocaleString('it-IT')}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Data Fine</label>
                      <p className="mb-0">
                        {new Date(selectedBooking.endTime).toLocaleString('it-IT')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted small fw-semibold">Stato</label>
                    <div>
                      <span
                        className={`badge ${
                          selectedBooking.status === 'APPROVED'
                            ? 'bg-success'
                            : selectedBooking.status === 'PENDING'
                            ? 'bg-warning text-dark'
                            : 'bg-danger'
                        }`}
                      >
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>

                  {selectedBooking.status === 'PENDING' && (
                    <>
                      <div className="mb-4">
                        <label className="form-label fw-semibold">
                          Motivo Rifiuto (opzionale)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="form-control"
                          rows={3}
                          placeholder="Inserisci il motivo del rifiuto..."
                        />
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleApprove(selectedBooking.id)}
                          className="btn btn-success flex-fill fw-semibold"
                        >
                          ✓ Approva
                        </button>
                        <button
                          onClick={() => handleReject(selectedBooking.id)}
                          className="btn btn-danger flex-fill fw-semibold"
                        >
                          ✕ Rifiuta
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
