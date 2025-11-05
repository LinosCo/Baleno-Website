'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { API_ENDPOINTS } from '../../../config/api';

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
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [exporting, setExporting] = useState(false);

  // Filtri di ricerca
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchBookings = () => {
    const token = localStorage.getItem('accessToken');
    const url = filter === 'ALL'
      ? API_ENDPOINTS.bookings
      : `${API_ENDPOINTS.bookings}?status=${filter}`;

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Ensure data is an array
        const bookingsArray = Array.isArray(data) ? data : [];
        setBookings(bookingsArray);
        setFilteredBookings(bookingsArray);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setBookings([]);
        setFilteredBookings([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  // Applica filtri di ricerca
  useEffect(() => {
    let filtered = [...bookings];

    // Filtro per ricerca testo (titolo, utente, risorsa)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(b => {
        if (!b) return false;

        const title = b.title?.toLowerCase() || '';
        const firstName = b.user?.firstName?.toLowerCase() || '';
        const lastName = b.user?.lastName?.toLowerCase() || '';
        const email = b.user?.email?.toLowerCase() || '';
        const resourceName = b.resource?.name?.toLowerCase() || '';

        return (
          title.includes(search) ||
          firstName.includes(search) ||
          lastName.includes(search) ||
          email.includes(search) ||
          resourceName.includes(search)
        );
      });
    }

    // Filtro per data inizio
    if (startDate) {
      filtered = filtered.filter(b => {
        if (!b?.startTime) return false;
        try {
          return new Date(b.startTime) >= new Date(startDate);
        } catch {
          return false;
        }
      });
    }

    // Filtro per data fine
    if (endDate) {
      filtered = filtered.filter(b => {
        if (!b?.startTime) return false;
        try {
          return new Date(b.startTime) <= new Date(endDate);
        } catch {
          return false;
        }
      });
    }

    setFilteredBookings(filtered);
  }, [searchTerm, startDate, endDate, bookings]);

  const handleApprove = async (bookingId: string) => {
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_ENDPOINTS.bookings}/${bookingId}/approve`, {
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
      const response = await fetch(`${API_ENDPOINTS.bookings}/${bookingId}/reject`, {
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

  const handleExportCsv = async () => {
    setExporting(true);
    const token = localStorage.getItem('accessToken');
    const url = filter === 'ALL'
      ? `${API_ENDPOINTS.bookings}/export/csv`
      : `${API_ENDPOINTS.bookings}/export/csv?status=${filter}`;

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const csvData = await response.text();

        // Create blob and download
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `prenotazioni_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Errore export CSV:', err);
      alert('Errore durante l\'esportazione');
    } finally {
      setExporting(false);
    }
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

        {/* Barra di ricerca */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2">
            <div className="row g-2 align-items-center">
              <div className="col-md-5">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-end-0">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm border-start-0"
                    placeholder="Cerca per titolo, utente, risorsa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  placeholder="Data inizio"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  placeholder="Data fine"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="col-md-1">
                {(searchTerm || startDate || endDate) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="btn btn-link btn-sm text-muted p-0"
                    title="Resetta ricerca"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-2">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="d-flex flex-wrap gap-2">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`btn btn-sm ${
                      filter === status
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-light text-dark">
                  {filteredBookings.length} prenotazioni
                </span>
                <button
                  onClick={handleExportCsv}
                  disabled={exporting || bookings.length === 0}
                  className="btn btn-success btn-sm"
                >
                  {exporting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Esportazione...
                    </>
                  ) : (
                    <>
                      <svg className="icon icon-sm me-1" fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {filteredBookings.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p className="mb-0">Nessuna prenotazione trovata</p>
                {(searchTerm || startDate || endDate) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="btn btn-sm btn-outline-primary mt-2"
                  >
                    Resetta Filtri
                  </button>
                )}
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
                    {filteredBookings.map((booking) => (
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
