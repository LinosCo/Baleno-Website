'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const params = useParams();
  const bookingId = params.id as string;

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-4">
      <div className="card shadow-lg border-0" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-body text-center p-5">
          {/* Success Icon */}
          <div className="mb-4">
            <svg width="80" height="80" fill="currentColor" className="text-success" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
          </div>

          {/* Titolo */}
          <h1 className="h3 fw-bold text-success mb-3">Pagamento Registrato!</h1>

          {/* Messaggio */}
          <p className="text-muted mb-4">
            Il tuo pagamento è stato registrato correttamente.
            La tua prenotazione è ora <strong>in attesa di approvazione</strong> da parte del nostro staff.
          </p>

          <div className="alert alert-info text-start">
            <h6 className="fw-bold mb-2">📧 Prossimi Passi:</h6>
            <ul className="mb-0 ps-3">
              <li>Verifica la tua email per i dettagli della prenotazione</li>
              <li>Il nostro staff verificherà il bonifico entro 24-48 ore</li>
              <li>Riceverai una notifica quando la prenotazione verrà approvata</li>
            </ul>
          </div>

          {/* ID Prenotazione */}
          <div className="bg-light p-3 rounded mb-4">
            <small className="text-muted d-block mb-1">ID Prenotazione</small>
            <code className="fw-bold">{bookingId}</code>
          </div>

          {/* Azioni */}
          <div className="d-flex flex-column gap-2">
            <Link href={`/bookings/${bookingId}`} className="btn btn-primary">
              Visualizza Prenotazione
            </Link>
            <Link href="/bookings" className="btn btn-outline-secondary">
              Tutte le Prenotazioni
            </Link>
            <Link href="/" className="btn btn-link text-muted">
              Torna alla Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
