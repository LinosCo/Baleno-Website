'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import AdminLayout from '../../../components/admin/AdminLayout';

interface PendingBankTransfer {
  id: string;
  amount: number;
  currency: string;
  bankTransferCode: string;
  expiresAt: string;
  createdAt: string;
  booking: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    resource: {
      name: string;
    };
    user: {
      email: string;
      firstName: string;
      lastName: string;
    } | null;
    // Manual booking fields
    isManualBooking?: boolean;
    manualGuestName?: string;
    manualGuestEmail?: string;
  };
}

export default function BankTransfersPage() {
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<PendingBankTransfer[]>([]);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingTransfers();
  }, []);

  const fetchPendingTransfers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bank-transfers/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transfers');
      }

      const data = await response.json();
      setTransfers(data);
    } catch (error) {
      toast.error('Errore nel caricamento dei bonifici');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string) => {
    if (!confirm('Confermare la ricezione di questo bonifico?')) {
      return;
    }

    setVerifying(paymentId);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/bank-transfers/${paymentId}/verify`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to verify transfer');
      }

      toast.success('Bonifico verificato con successo');
      // Remove from list
      setTransfers(transfers.filter(t => t.id !== paymentId));
    } catch (error) {
      toast.error('Errore nella verifica del bonifico');
      console.error(error);
    } finally {
      setVerifying(null);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <p className="text-muted">Caricamento bonifici...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid px-0">
        {/* Header */}
        <div className="mb-4">
          <h1 className="h3 fw-bold text-baleno-primary mb-1">Bonifici Bancari in Attesa</h1>
          <p className="text-muted mb-0">
            {transfers.length === 0 && 'Nessun bonifico in attesa di verifica'}
            {transfers.length === 1 && '1 bonifico in attesa di verifica'}
            {transfers.length > 1 && `${transfers.length} bonifici in attesa di verifica`}
          </p>
        </div>

        {transfers.length === 0 ? (
          <div className="bg-light border rounded p-4" role="alert">
            <h4 className="fw-semibold mb-2">Nessun bonifico in attesa</h4>
            <p className="mb-0 text-muted">Al momento non ci sono bonifici bancari in attesa di verifica. I pagamenti apparirranno qui quando gli utenti scelgono il bonifico come metodo di pagamento.</p>
          </div>
        ) : (
          <div className="row g-4">
            {transfers.map((transfer) => {
              const expired = isExpired(transfer.expiresAt);

              return (
                <div key={transfer.id} className="col-12">
                  <div className={`card shadow-sm ${expired ? 'border-danger border-2' : 'border-warning border-2 border-start'}`}>
                    <div className={`card-header ${expired ? 'bg-danger bg-opacity-10' : 'bg-warning bg-opacity-10'}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-bank me-2 fs-5"></i>
                          <h5 className="mb-0 fw-bold">{transfer.booking.resource.name}</h5>
                        </div>
                        {expired && (
                          <span className="badge bg-danger">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            SCADUTO
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="row g-4">
                        {/* Codice Bonifico - Highlight */}
                        <div className="col-12">
                          <div className="bg-light border rounded p-3 d-flex align-items-center justify-content-between">
                            <div>
                              <small className="text-muted d-block mb-1">Codice Bonifico da Verificare</small>
                              <h3 className="mb-0 font-monospace fw-bold" style={{ color: '#2B548E' }}>{transfer.bankTransferCode}</h3>
                            </div>
                            <div className="text-end">
                              <small className="text-muted d-block mb-1">Importo</small>
                              <h3 className="mb-0 text-success fw-bold">€{(Number(transfer.amount) / 100).toFixed(2)}</h3>
                            </div>
                          </div>
                        </div>

                        {/* Dettagli Cliente e Prenotazione */}
                        <div className="col-md-6">
                          <div className="border rounded p-3 h-100">
                            <h6 className="text-muted mb-3">
                              <i className="bi bi-person-circle me-2"></i>
                              Informazioni Cliente
                            </h6>
                            <p className="mb-1">
                              <strong>Nome:</strong> {transfer.booking.user ? `${transfer.booking.user.firstName} ${transfer.booking.user.lastName}` : (transfer.booking.manualGuestName || 'Ospite')}
                            </p>
                            <p className="mb-0">
                              <small className="text-muted">
                                <i className="bi bi-envelope me-1"></i>
                                {transfer.booking.user?.email || transfer.booking.manualGuestEmail || 'N/A'}
                              </small>
                            </p>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="border rounded p-3 h-100">
                            <h6 className="text-muted mb-3">
                              <i className="bi bi-calendar-check me-2"></i>
                              Dettagli Prenotazione
                            </h6>
                            <p className="mb-1">
                              <strong>Titolo:</strong> {transfer.booking.title}
                            </p>
                            <p className="mb-0">
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                {format(new Date(transfer.booking.startTime), 'dd MMM yyyy HH:mm', { locale: it })}
                              </small>
                            </p>
                          </div>
                        </div>

                        {/* Date Creazione e Scadenza */}
                        <div className="col-md-6">
                          <div>
                            <small className="text-muted d-block">
                              <i className="bi bi-calendar-plus me-1"></i>
                              Richiesto il
                            </small>
                            <strong>{format(new Date(transfer.createdAt), 'dd MMM yyyy HH:mm', { locale: it })}</strong>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div>
                            <small className="text-muted d-block">
                              <i className={`bi bi-calendar-x me-1 ${expired ? 'text-danger' : ''}`}></i>
                              Scade il
                            </small>
                            <strong className={expired ? 'text-danger' : ''}>
                              {format(new Date(transfer.expiresAt), 'dd MMM yyyy HH:mm', { locale: it })}
                            </strong>
                          </div>
                        </div>

                        {/* Pulsante Verifica */}
                        <div className="col-12">
                          <div className="d-grid">
                            <button
                              onClick={() => handleVerify(transfer.id)}
                              disabled={verifying === transfer.id}
                              className="btn btn-success btn-lg fw-semibold"
                            >
                              {verifying === transfer.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Verifica in corso...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check-circle me-2"></i>
                                  Verifica Bonifico Ricevuto
                                </>
                              )}
                            </button>
                          </div>
                          <small className="text-muted d-block mt-2 text-center">
                            Clicca solo dopo aver verificato la ricezione del bonifico sul conto bancario
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
