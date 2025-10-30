'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { bookingsAPIExtended } from '@/lib/api-client';

interface Booking {
  id: string;
  resourceId: string;
  resource: {
    name: string;
    type: string;
    pricePerHour: number;
  };
  startTime: string;
  endTime: string;
  status: string;
  title: string;
  description?: string;
  totalPrice?: number;
  payment?: {
    status: string;
    amount: number;
  };
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await bookingsAPIExtended.getAll();
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Errore nel caricamento delle prenotazioni');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [router]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) {
      return;
    }

    try {
      await bookingsAPIExtended.delete(bookingId);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Errore nella cancellazione della prenotazione');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <p className="text-muted">Caricamento prenotazioni...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-primary shadow">
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-3">
            <Link href="/dashboard" className="d-flex align-items-center">
              <Image
                src="/BALENO-LOGO-BIANCO.png"
                alt="Baleno Sanzeno"
                width={140}
                height={45}
                style={{ height: '40px', width: 'auto' }}
              />
            </Link>
            <span className="text-white fs-5">|</span>
            <h1 className="h5 mb-0 text-white fw-bold">Le Mie Prenotazioni</h1>
          </div>
          <Link href="/dashboard" className="text-white text-decoration-none fw-medium">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="container py-4">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              {error}
            </div>
          )}

          <div className="mb-4">
            <Link href="/bookings/new" className="btn btn-primary fw-semibold">
              + Nuova Prenotazione
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <div className="fs-1 mb-3">📅</div>
                <p className="fs-5 text-muted mb-4">Non hai ancora prenotazioni</p>
                <Link href="/bookings/new" className="btn btn-primary fw-semibold">
                  Crea la tua prima prenotazione
                </Link>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {bookings.map(booking => (
                <div key={booking.id} className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <h3 className="h5 fw-bold mb-0 text-baleno-primary">
                            {booking.resource.name}
                          </h3>
                          <span
                            className={`badge ${
                              booking.status === 'APPROVED'
                                ? 'bg-success'
                                : booking.status === 'PENDING'
                                ? 'bg-warning text-dark'
                                : booking.status === 'REJECTED'
                                ? 'bg-danger'
                                : 'bg-secondary'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <p className="small text-muted mb-2">
                          Tipo: {booking.resource.type}
                        </p>

                        <p className="small mb-3">
                          <span className="fw-semibold">Titolo:</span> {booking.title}
                        </p>
                        {booking.description && (
                          <p className="small text-muted mb-3">
                            {booking.description}
                          </p>
                        )}

                        <div className="row g-3 small">
                          <div className="col-md-6">
                            <p className="text-muted mb-1">Inizio:</p>
                            <p className="fw-medium mb-0">
                              {new Date(booking.startTime).toLocaleString('it-IT', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <p className="text-muted mb-1">Fine:</p>
                            <p className="fw-medium mb-0">
                              {new Date(booking.endTime).toLocaleString('it-IT', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        {booking.payment && (
                          <div className="mt-3 pt-3 border-top">
                            <div className="d-flex align-items-center gap-2">
                              <span className="small text-muted">Pagamento:</span>
                              <span
                                className={`badge ${
                                  booking.payment.status === 'COMPLETED'
                                    ? 'bg-success'
                                    : 'bg-warning text-dark'
                                }`}
                              >
                                {booking.payment.status}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-end ms-4">
                        {booking.totalPrice && (
                          <p className="display-6 fw-bold text-primary mb-3">
                            €{booking.totalPrice.toFixed(2)}
                          </p>
                        )}

                        {booking.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="btn btn-danger btn-sm fw-semibold"
                          >
                            Cancella
                          </button>
                        )}

                        {booking.status === 'APPROVED' && !booking.payment && (
                          <button
                            className="btn btn-warning btn-sm fw-semibold"
                          >
                            Paga Ora
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
