'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PaymentSettings {
  id: string;
  stripeEnabled: boolean;
  stripePublishableKey: string | null;
  stripeSecretKey: string | null;
  stripeWebhookSecret: string | null;
  bankTransferEnabled: boolean;
  bankName: string | null;
  bankAccountHolder: string | null;
  bankIBAN: string | null;
  bankBIC: string | null;
  bankAddress: string | null;
  bankTransferNote: string | null;
  paymentDeadlineDays: number;
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  invoiceStartNumber: number;
  currentInvoiceNumber: number;
  paymentReminderHours: number;
  sendReminders: boolean;
}

export default function PaymentSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payment-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast.error('Errore nel caricamento delle impostazioni');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payment-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      toast.success('Impostazioni salvate con successo');
    } catch (error) {
      toast.error('Errore nel salvataggio delle impostazioni');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return <div>Errore nel caricamento</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Impostazioni Pagamento</h1>
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="text-gray-600 hover:text-gray-900"
        >
          Torna indietro
        </button>
      </div>

      <div className="space-y-8">
        {/* Stripe Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Stripe (Carta di Credito)</h2>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.stripeEnabled}
                onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                className="w-5 h-5 text-primary"
              />
              <span className="ml-2">Abilitato</span>
            </label>
          </div>

          {settings.stripeEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Stripe Publishable Key</label>
                <input
                  type="text"
                  value={settings.stripePublishableKey || ''}
                  onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                  placeholder="pk_test_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stripe Secret Key</label>
                <input
                  type="password"
                  value={settings.stripeSecretKey === '••••••••' ? '' : settings.stripeSecretKey || ''}
                  onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                  placeholder="sk_test_... (lascia vuoto per non modificare)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">Verrà cifrato nel database</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stripe Webhook Secret</label>
                <input
                  type="password"
                  value={settings.stripeWebhookSecret === '••••••••' ? '' : settings.stripeWebhookSecret || ''}
                  onChange={(e) => setSettings({ ...settings, stripeWebhookSecret: e.target.value })}
                  placeholder="whsec_... (lascia vuoto per non modificare)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bank Transfer Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Bonifico Bancario</h2>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.bankTransferEnabled}
                onChange={(e) => setSettings({ ...settings, bankTransferEnabled: e.target.checked })}
                className="w-5 h-5 text-primary"
              />
              <span className="ml-2">Abilitato</span>
            </label>
          </div>

          {settings.bankTransferEnabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome Banca</label>
                  <input
                    type="text"
                    value={settings.bankName || ''}
                    onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                    placeholder="Intesa Sanpaolo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Intestatario</label>
                  <input
                    type="text"
                    value={settings.bankAccountHolder || ''}
                    onChange={(e) => setSettings({ ...settings, bankAccountHolder: e.target.value })}
                    placeholder="Baleno San Zeno ASD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">IBAN</label>
                  <input
                    type="text"
                    value={settings.bankIBAN || ''}
                    onChange={(e) => setSettings({ ...settings, bankIBAN: e.target.value })}
                    placeholder="IT60X0542811101000000123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">BIC/SWIFT</label>
                  <input
                    type="text"
                    value={settings.bankBIC || ''}
                    onChange={(e) => setSettings({ ...settings, bankBIC: e.target.value })}
                    placeholder="BCITITMMXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Causale Template
                </label>
                <input
                  type="text"
                  value={settings.bankTransferNote || ''}
                  onChange={(e) => setSettings({ ...settings, bankTransferNote: e.target.value })}
                  placeholder="Prenotazione {CODICE} - {RISORSA} - {DATA}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variabili disponibili: {'{CODICE}'}, {'{RISORSA}'}, {'{DATA}'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Giorni limite per pagamento
                </label>
                <input
                  type="number"
                  value={settings.paymentDeadlineDays}
                  onChange={(e) => setSettings({ ...settings, paymentDeadlineDays: parseInt(e.target.value) })}
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Reminders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Promemoria Pagamento</h2>
          <div className="space-y-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sendReminders}
                onChange={(e) => setSettings({ ...settings, sendReminders: e.target.checked })}
                className="w-5 h-5 text-primary"
              />
              <span className="ml-2">Invia promemoria automatici</span>
            </label>

            {settings.sendReminders && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ore dopo approvazione prima di inviare promemoria
                </label>
                <input
                  type="number"
                  value={settings.paymentReminderHours}
                  onChange={(e) => setSettings({ ...settings, paymentReminderHours: parseInt(e.target.value) })}
                  min="1"
                  max="168"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Impostazioni Generali</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valuta</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">IVA (%)</label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
          </button>
        </div>
      </div>
    </div>
  );
}
