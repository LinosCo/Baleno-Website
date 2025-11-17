'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

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
    };
  };
}

export default function BankTransfersPage() {
  const router = useRouter();
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bonifici in Attesa</h1>
          <p className="text-gray-600 mt-2">
            {transfers.length} {transfers.length === 1 ? 'bonifico in attesa' : 'bonifici in attesa'}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="text-gray-600 hover:text-gray-900"
        >
          Torna indietro
        </button>
      </div>

      {transfers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">Nessun bonifico in attesa di verifica</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <div
              key={transfer.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                isExpired(transfer.expiresAt) ? 'border-red-500' : 'border-yellow-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{transfer.booking.resource.name}</h3>
                    {isExpired(transfer.expiresAt) && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                        SCADUTO
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Codice Bonifico:</p>
                      <p className="font-mono font-semibold text-lg">{transfer.bankTransferCode}</p>
                    </div>

                    <div>
                      <p className="text-gray-600">Importo:</p>
                      <p className="font-semibold text-lg">
                        €{transfer.amount.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Cliente:</p>
                      <p className="font-medium">
                        {transfer.booking.user.firstName} {transfer.booking.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{transfer.booking.user.email}</p>
                    </div>

                    <div>
                      <p className="text-gray-600">Prenotazione:</p>
                      <p className="font-medium">{transfer.booking.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(transfer.booking.startTime), 'dd MMM yyyy HH:mm', { locale: it })}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Richiesto il:</p>
                      <p className="text-sm">
                        {format(new Date(transfer.createdAt), 'dd MMM yyyy HH:mm', { locale: it })}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Scade il:</p>
                      <p className={`text-sm ${isExpired(transfer.expiresAt) ? 'text-red-600 font-semibold' : ''}`}>
                        {format(new Date(transfer.expiresAt), 'dd MMM yyyy HH:mm', { locale: it })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ml-6">
                  <button
                    onClick={() => handleVerify(transfer.id)}
                    disabled={verifying === transfer.id}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                  >
                    {verifying === transfer.id ? 'Verifica...' : 'Verifica Ricevuto'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
