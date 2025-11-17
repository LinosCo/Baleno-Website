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

      // Filter out fields that shouldn't be sent (id, createdAt, updatedAt)
      const { id, createdAt, updatedAt, ...settingsToSave } = settings as any;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payment-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settingsToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      toast.success('Impostazioni salvate con successo');
      await fetchSettings(); // Reload settings
    } catch (error) {
      toast.error('Errore nel salvataggio delle impostazioni');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento impostazioni...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Errore di caricamento</h2>
          <p className="text-gray-600 mb-4">Impossibile caricare le impostazioni di pagamento</p>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Torna indietro
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Configurazione Pagamenti</h1>
          <p className="mt-2 text-gray-600">Gestisci i metodi di pagamento accettati e le relative impostazioni</p>
        </div>

        <div className="space-y-6">
          {/* STRIPE SECTION */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Stripe</h2>
                    <p className="text-sm text-gray-600">Pagamenti con Carta di Credito</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.stripeEnabled}
                    onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {settings.stripeEnabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Attivo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Disattivo
                      </span>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {settings.stripeEnabled && (
              <div className="p-6 space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-900">Configurazione Stripe</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        Trova le tue chiavi API nel <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline font-medium">Dashboard Stripe</a>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publishable Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.stripePublishableKey || ''}
                    onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                    placeholder="pk_test_..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Chiave pubblica visibile nel frontend</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={settings.stripeSecretKey === '••••••••' ? '' : settings.stripeSecretKey || ''}
                    onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                    placeholder="sk_test_... (lascia vuoto per non modificare)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono text-sm"
                  />
                  <div className="mt-1 flex items-center text-xs">
                    <svg className="w-3 h-3 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-500">Salvata criptata nel database</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Secret <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={settings.stripeWebhookSecret === '••••••••' ? '' : settings.stripeWebhookSecret || ''}
                    onChange={(e) => setSettings({ ...settings, stripeWebhookSecret: e.target.value })}
                    placeholder="whsec_... (lascia vuoto per non modificare)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Endpoint webhook: <code className="bg-gray-100 px-2 py-0.5 rounded">https://baleno-website-production.up.railway.app/api/webhooks/stripe</code>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* BONIFICO SECTION */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Bonifico Bancario</h2>
                    <p className="text-sm text-gray-600">Pagamenti tramite bonifico SEPA</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.bankTransferEnabled}
                    onChange={(e) => setSettings({ ...settings, bankTransferEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {settings.bankTransferEnabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Attivo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Disattivo
                      </span>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {settings.bankTransferEnabled && (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Banca</label>
                    <input
                      type="text"
                      value={settings.bankName || ''}
                      onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                      placeholder="es. Intesa Sanpaolo"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Intestatario Conto</label>
                    <input
                      type="text"
                      value={settings.bankAccountHolder || ''}
                      onChange={(e) => setSettings({ ...settings, bankAccountHolder: e.target.value })}
                      placeholder="es. Baleno San Zeno ASD"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                    <input
                      type="text"
                      value={settings.bankIBAN || ''}
                      onChange={(e) => setSettings({ ...settings, bankIBAN: e.target.value.toUpperCase() })}
                      placeholder="IT60X0542811101000000123456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">BIC/SWIFT</label>
                    <input
                      type="text"
                      value={settings.bankBIC || ''}
                      onChange={(e) => setSettings({ ...settings, bankBIC: e.target.value.toUpperCase() })}
                      placeholder="BCITITMMXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Causale Bonifico
                  </label>
                  <input
                    type="text"
                    value={settings.bankTransferNote || ''}
                    onChange={(e) => setSettings({ ...settings, bankTransferNote: e.target.value })}
                    placeholder="Pagamento prenotazione {CODICE}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Variabili disponibili: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{'{CODICE}'}</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded">{'{RISORSA}'}</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded">{'{DATA}'}</code>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giorni Limite per Pagamento
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={settings.paymentDeadlineDays}
                      onChange={(e) => setSettings({ ...settings, paymentDeadlineDays: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="90"
                      className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-center"
                    />
                    <span className="text-gray-600">giorni dopo l'approvazione</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PROMEMORIA SECTION */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Promemoria Automatici</h2>
                  <p className="text-sm text-gray-600">Notifiche email per pagamenti in sospeso</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <label className="flex items-start cursor-pointer">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={settings.sendReminders}
                    onChange={(e) => setSettings({ ...settings, sendReminders: e.target.checked })}
                    className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                  />
                </div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Abilita invio promemoria automatici</span>
                  <p className="text-xs text-gray-500 mt-1">Invia email di reminder agli utenti con pagamenti in attesa</p>
                </div>
              </label>

              {settings.sendReminders && (
                <div className="ml-8 pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intervallo Promemoria
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={settings.paymentReminderHours}
                      onChange={(e) => setSettings({ ...settings, paymentReminderHours: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="168"
                      className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-center"
                    />
                    <span className="text-gray-600">ore dopo l'approvazione</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Consigliato: 24 ore (1 giorno) o 48 ore (2 giorni)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* IMPOSTAZIONI GENERALI */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Impostazioni Generali</h2>
                  <p className="text-sm text-gray-600">Valuta, tasse e altre configurazioni</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valuta</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aliquota IVA (%)</label>
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500">IVA standard in Italia: 22%</p>
                </div>
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="sticky bottom-4 bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p className="font-medium">Modifiche in sospeso</p>
                <p className="text-xs">Clicca "Salva Impostazioni" per applicare le modifiche</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvataggio...
                  </span>
                ) : (
                  'Salva Impostazioni'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
