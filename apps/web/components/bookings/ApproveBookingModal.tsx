'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ApproveBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingTitle: string;
  onApproved: () => void;
}

export default function ApproveBookingModal({
  isOpen,
  onClose,
  bookingId,
  bookingTitle,
  onApproved,
}: ApproveBookingModalProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/approve`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ notes: notes || undefined }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve booking');
      }

      toast.success('Prenotazione approvata! Email inviata al cliente con le opzioni di pagamento.');
      onApproved();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Errore nell\'approvazione della prenotazione');
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
          <h2 className="text-2xl font-bold mb-4">Approva Prenotazione</h2>

          <div className="mb-4">
            <p className="text-gray-600">Stai per approvare la prenotazione:</p>
            <p className="font-semibold mt-2">{bookingTitle}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Note aggiuntive (opzionale)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aggiungi eventuali note per il cliente..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Attenzione:</strong> Una volta approvata, il cliente riceverà un'email con le istruzioni per completare il pagamento (carta di credito o bonifico bancario).
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
              onClick={handleApprove}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Approvazione...' : 'Approva e Invia Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
