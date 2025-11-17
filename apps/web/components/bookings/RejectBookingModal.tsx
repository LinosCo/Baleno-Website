'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface RejectBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingTitle: string;
  onRejected: () => void;
}

enum RejectionReason {
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
  MAINTENANCE_SCHEDULED = 'MAINTENANCE_SCHEDULED',
  EVENT_ALREADY_BOOKED = 'EVENT_ALREADY_BOOKED',
  INSUFFICIENT_DOCUMENTATION = 'INSUFFICIENT_DOCUMENTATION',
  CAPACITY_EXCEEDED = 'CAPACITY_EXCEEDED',
  PAYMENT_ISSUES = 'PAYMENT_ISSUES',
  OTHER = 'OTHER',
}

const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  [RejectionReason.RESOURCE_UNAVAILABLE]: 'Risorsa non disponibile',
  [RejectionReason.MAINTENANCE_SCHEDULED]: 'Manutenzione programmata',
  [RejectionReason.EVENT_ALREADY_BOOKED]: 'Altro evento già prenotato',
  [RejectionReason.INSUFFICIENT_DOCUMENTATION]: 'Documentazione insufficiente',
  [RejectionReason.CAPACITY_EXCEEDED]: 'Capacità massima superata',
  [RejectionReason.PAYMENT_ISSUES]: 'Problemi con precedenti pagamenti',
  [RejectionReason.OTHER]: 'Altro motivo',
};

export default function RejectBookingModal({
  isOpen,
  onClose,
  bookingId,
  bookingTitle,
  onRejected,
}: RejectBookingModalProps) {
  const [reason, setReason] = useState<RejectionReason>(RejectionReason.RESOURCE_UNAVAILABLE);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/reject`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason,
            additionalNotes: additionalNotes || undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject booking');
      }

      toast.success('Prenotazione rifiutata. Email inviata al cliente.');
      onRejected();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Errore nel rifiuto della prenotazione');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Rifiuta Prenotazione</h2>

          <div className="mb-4">
            <p className="text-gray-600">Stai per rifiutare la prenotazione:</p>
            <p className="font-semibold mt-2">{bookingTitle}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Motivo del rifiuto <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as RejectionReason)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {Object.entries(REJECTION_REASON_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Note aggiuntive (opzionale)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Aggiungi ulteriori dettagli per il cliente..."
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {additionalNotes.length}/500 caratteri
            </p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700">
              <strong>Attenzione:</strong> Il cliente riceverà un'email con il motivo del rifiuto. Se è stato effettuato un pagamento, verrà automaticamente rimborsato.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Rifiuto...' : 'Rifiuta e Invia Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
