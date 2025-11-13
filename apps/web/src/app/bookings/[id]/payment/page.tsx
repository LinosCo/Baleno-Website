'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CREDIT_CARD'>('BANK_TRANSFER');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

      const response = await fetch(`${apiUrl}/bookings/${bookingId}?includeResources=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Prenotazione non trovata');
      }

      const data = await response.json();
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Errore nel caricamento della prenotazione');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

      const response = await fetch(`${apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore nella creazione del pagamento');
      }

      // Successo - reindirizza alla pagina di conferma
      router.push(`/bookings/${bookingId}/payment/success`);
    } catch (err: any) {
      setError(err.message || 'Errore nella creazione del pagamento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <p className="text-muted">Caricamento prenotazione...</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
        <div className="card shadow border-0" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card-body text-center p-5">
            <svg width="64" height="64" fill="currentColor" className="text-danger mb-3" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <h3 className="h5 fw-bold mb-2">Errore</h3>
            <p className="text-muted mb-4">{error}</p>
            <Link href="/bookings" className="btn btn-primary">
              Torna alle prenotazioni
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calcola il totale
  const calculateTotal = () => {
    if (!booking) return 0;

    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    let total = booking.resource.pricePerHour * hours;

    // Aggiungi risorse aggiuntive se presenti
    if (booking.additionalResources) {
      for (const additionalResource of booking.additionalResources) {
        total += additionalResource.resource.pricePerHour * additionalResource.quantity * hours;
      }
    }

    return total;
  };

  const totalAmount = calculateTotal();

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="h3 fw-bold text-baleno-primary">Pagamento Prenotazione</h1>
          <p className="text-muted">Completa il pagamento per confermare la tua prenotazione</p>
        </div>

        {/* Riepilogo Prenotazione */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom">
            <h5 className="mb-0 fw-bold">Riepilogo Prenotazione</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <small className="text-muted d-block">Risorsa</small>
                <strong>{booking?.resource?.name}</strong>
              </div>
              <div className="col-md-6">
                <small className="text-muted d-block">Data e ora</small>
                <strong>
                  {new Date(booking?.startTime).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
                <br />
                <small>
                  {new Date(booking?.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - {new Date(booking?.endTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
              <div className="col-12">
                <small className="text-muted d-block">Titolo</small>
                <strong>{booking?.title}</strong>
              </div>
              {booking?.description && (
                <div className="col-12">
                  <small className="text-muted d-block">Descrizione</small>
                  <p className="mb-0">{booking.description}</p>
                </div>
              )}
            </div>

            <hr className="my-3" />

            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Totale da pagare:</h5>
              <h4 className="mb-0 text-primary fw-bold">€{totalAmount.toFixed(2)}</h4>
            </div>
          </div>
        </div>

        {/* Metodo di Pagamento */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom">
            <h5 className="mb-0 fw-bold">Seleziona Metodo di Pagamento</h5>
          </div>
          <div className="card-body">
            {/* Bonifico Bancario */}
            <div
              className={`card mb-3 cursor-pointer ${paymentMethod === 'BANK_TRANSFER' ? 'border-primary' : 'border'}`}
              onClick={() => setPaymentMethod('BANK_TRANSFER')}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body d-flex align-items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'BANK_TRANSFER'}
                  onChange={() => setPaymentMethod('BANK_TRANSFER')}
                  className="form-check-input me-3"
                  style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                />
                <div className="flex-grow-1">
                  <h6 className="mb-1 fw-bold">Bonifico Bancario</h6>
                  <p className="text-muted small mb-0">Effettua un bonifico bancario alle nostre coordinate</p>
                </div>
                <svg width="32" height="32" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                  <path d="M0 3a2 2 0 0 1 2-2h13.5a.5.5 0 0 1 0 1H15v2a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 0 12.5V3zm1 1.732V12.5A1.5 1.5 0 0 0 2.5 14h12a.5.5 0 0 0 .5-.5V5H2a1.99 1.99 0 0 1-1-.268zM1 3a1 1 0 0 0 1 1h12V2H2a1 1 0 0 0-1 1z"/>
                </svg>
              </div>
            </div>

            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="card border-primary bg-light">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Coordinate Bancarie</h6>
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold" style={{ width: '150px' }}>Intestatario:</td>
                      <td>Baleno San Zeno</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">IBAN:</td>
                      <td className="font-monospace">IT60 X054 2811 1010 0000 0123 456</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">BIC/SWIFT:</td>
                      <td className="font-monospace">BPMOIT22XXX</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Causale:</td>
                      <td className="font-monospace">Prenotazione #{bookingId.substring(0, 8)}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Importo:</td>
                      <td className="fw-bold">€{totalAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <hr />
                <p className="small mb-0 text-muted">
                  <strong>Nota:</strong> La tua prenotazione sarà confermata dopo la verifica del bonifico da parte del nostro staff.
                </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Errore */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-4">
            <svg width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Azioni */}
        <div className="d-flex gap-3">
          <Link href="/bookings" className="btn btn-outline-secondary flex-grow-1">
            Annulla
          </Link>
          <button
            onClick={handlePayment}
            disabled={submitting}
            className="btn btn-primary flex-grow-1 fw-semibold"
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Elaborazione...
              </>
            ) : (
              paymentMethod === 'BANK_TRANSFER' ? 'Conferma Bonifico' : 'Procedi al Pagamento'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
