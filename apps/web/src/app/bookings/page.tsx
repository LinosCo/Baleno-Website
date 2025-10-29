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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary shadow">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/BALENO-LOGO-BIANCO.png"
                  alt="Baleno Sanzeno"
                  width={140}
                  height={45}
                  className="h-10 w-auto"
                />
              </Link>
              <span className="text-white text-lg">|</span>
              <h1 className="text-xl font-bold text-white">Le Mie Prenotazioni</h1>
            </div>
            <Link href="/dashboard" className="text-white hover:text-accent transition font-medium">
              ← Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <Link
              href="/bookings/new"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-medium"
            >
              + Nuova Prenotazione
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-4xl mb-4">📅</div>
              <p className="text-lg text-gray-600 mb-4">Non hai ancora prenotazioni</p>
              <Link
                href="/bookings/new"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Crea la tua prima prenotazione
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.resource.name}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        Tipo: {booking.resource.type}
                      </p>

                      <p className="text-sm text-gray-700 mb-3">
                        <span className="font-medium">Titolo:</span> {booking.title}
                      </p>
                      {booking.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {booking.description}
                        </p>
                      )}

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Inizio:</p>
                          <p className="font-medium">
                            {new Date(booking.startTime).toLocaleString('it-IT', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Fine:</p>
                          <p className="font-medium">
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
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Pagamento:</span>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                booking.payment.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {booking.payment.status}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-6">
                      {booking.totalPrice && (
                        <p className="text-2xl font-bold text-primary mb-2">
                          €{booking.totalPrice.toFixed(2)}
                        </p>
                      )}

                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
                        >
                          Cancella
                        </button>
                      )}

                      {booking.status === 'APPROVED' && !booking.payment && (
                        <button
                          className="bg-accent text-primary px-4 py-2 rounded-lg hover:bg-accent/90 transition text-sm font-medium"
                        >
                          Paga Ora
                        </button>
                      )}
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
