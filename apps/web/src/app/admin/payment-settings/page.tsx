'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../../../components/admin/AdminLayout';

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update settings');
      }

      toast.success('Impostazioni salvate con successo');
      await fetchSettings(); // Reload settings
    } catch (error: any) {
      toast.error(error.message || 'Errore nel salvataggio delle impostazioni');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <p className="text-muted">Caricamento impostazioni...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Errore di caricamento</h4>
          <p>Impossibile caricare le impostazioni di pagamento.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid px-0">
        {/* Header */}
        <div className="mb-4">
          <h1 className="h3 fw-bold mb-1" style={{ color: '#2B548E' }}>Impostazioni Pagamento</h1>
          <p className="text-muted mb-0">Configura i metodi di pagamento accettati e le relative impostazioni</p>
        </div>

        <div className="row g-4">
          {/* STRIPE SECTION */}
          <div className="col-12">
            <div className="card shadow-sm" style={{
              borderRadius: '16px',
              border: '1px solid rgba(43, 84, 142, 0.1)',
              borderLeft: '4px solid #2B548E'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="mb-1 d-flex align-items-center fw-bold" style={{ color: '#2B548E' }}>
                      <i className="bi bi-credit-card me-2"></i>
                      Stripe (Carta di Credito)
                    </h5>
                    <small className="text-muted">Pagamenti online con carte di credito/debito</small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="stripeEnabled"
                      checked={settings.stripeEnabled}
                      onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                      style={{ transform: 'scale(1.3)' }}
                    />
                    <label className="form-check-label ms-2" htmlFor="stripeEnabled">
                      {settings.stripeEnabled ? (
                        <span className="badge" style={{ backgroundColor: 'var(--baleno-primary)' }}>Attivo</span>
                      ) : (
                        <span className="badge bg-secondary">Disattivo</span>
                      )}
                    </label>
                  </div>
                </div>

              {settings.stripeEnabled && (
                <>
                  <div className="alert alert-light border mb-4">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-info-circle me-2 mt-1" style={{ color: 'var(--baleno-primary)' }}></i>
                      <div>
                        <strong className="d-block mb-1">Configurazione Stripe</strong>
                        <small className="text-muted">
                          Trova le tue chiavi API nel{' '}
                          <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--baleno-primary)' }}>
                            Dashboard Stripe <i className="bi bi-box-arrow-up-right"></i>
                          </a>
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Publishable Key <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={settings.stripePublishableKey || ''}
                        onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                        placeholder="pk_test_..."
                      />
                      <small className="form-text text-muted">Chiave pubblica visibile nel frontend</small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Secret Key <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control font-monospace"
                        value={settings.stripeSecretKey === '••••••••' ? '' : settings.stripeSecretKey || ''}
                        onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                        placeholder="sk_test_... (lascia vuoto per non modificare)"
                      />
                      <small className="form-text text-muted">
                        <i className="bi bi-lock-fill text-success"></i> Salvata criptata nel database
                      </small>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Webhook Secret <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control font-monospace"
                        value={settings.stripeWebhookSecret === '••••••••' ? '' : settings.stripeWebhookSecret || ''}
                        onChange={(e) => setSettings({ ...settings, stripeWebhookSecret: e.target.value })}
                        placeholder="whsec_... (lascia vuoto per non modificare)"
                      />
                      <small className="form-text text-muted">
                        Endpoint webhook: <code className="bg-light px-2 py-1 rounded">https://baleno-website-production.up.railway.app/api/webhooks/stripe</code>
                      </small>
                    </div>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>

          {/* BONIFICO SECTION */}
          <div className="col-12">
            <div className="card shadow-sm" style={{
              borderRadius: '16px',
              border: '1px solid rgba(8, 145, 178, 0.1)',
              borderLeft: '4px solid #0891B2'
            }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="mb-1 d-flex align-items-center fw-bold" style={{ color: '#0891B2' }}>
                      <i className="bi bi-bank me-2"></i>
                      Bonifico Bancario
                    </h5>
                    <small className="text-muted">Pagamenti tramite bonifico SEPA</small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="bankTransferEnabled"
                      checked={settings.bankTransferEnabled}
                      onChange={(e) => setSettings({ ...settings, bankTransferEnabled: e.target.checked })}
                      style={{ transform: 'scale(1.3)' }}
                    />
                    <label className="form-check-label ms-2" htmlFor="bankTransferEnabled">
                      {settings.bankTransferEnabled ? (
                        <span className="badge" style={{ backgroundColor: '#0891B2' }}>Attivo</span>
                      ) : (
                        <span className="badge bg-secondary">Disattivo</span>
                      )}
                    </label>
                  </div>
                </div>

              {settings.bankTransferEnabled && (
                <>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Nome Banca</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.bankName || ''}
                        onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                        placeholder="es. Intesa Sanpaolo"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Intestatario Conto</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.bankAccountHolder || ''}
                        onChange={(e) => setSettings({ ...settings, bankAccountHolder: e.target.value })}
                        placeholder="es. Baleno San Zeno ASD"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">IBAN</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={settings.bankIBAN || ''}
                        onChange={(e) => setSettings({ ...settings, bankIBAN: e.target.value.toUpperCase() })}
                        placeholder="IT60X0542811101000000123456"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">BIC/SWIFT</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={settings.bankBIC || ''}
                        onChange={(e) => setSettings({ ...settings, bankBIC: e.target.value.toUpperCase() })}
                        placeholder="BCITITMMXXX"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Template Causale Bonifico</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.bankTransferNote || ''}
                        onChange={(e) => setSettings({ ...settings, bankTransferNote: e.target.value })}
                        placeholder="Pagamento prenotazione {CODICE}"
                      />
                      <small className="form-text text-muted">
                        Variabili disponibili: <code className="bg-light px-1 rounded">{'{CODICE}'}</code>, <code className="bg-light px-1 rounded">{'{RISORSA}'}</code>, <code className="bg-light px-1 rounded">{'{DATA}'}</code>
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Giorni Limite per Pagamento</label>
                      <input
                        type="number"
                        className="form-control"
                        value={settings.paymentDeadlineDays}
                        onChange={(e) => setSettings({ ...settings, paymentDeadlineDays: parseInt(e.target.value) || 1 })}
                        min="1"
                        max="90"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e9ecef'
                        }}
                      />
                      <small className="form-text text-muted">
                        Tempo massimo: {settings.paymentDeadlineDays} {settings.paymentDeadlineDays === 1 ? 'giorno' : 'giorni'} dopo l'approvazione
                      </small>
                    </div>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>

          {/* PROMEMORIA SECTION */}
          <div className="col-12">
            <div className="card shadow-sm" style={{
              borderRadius: '16px',
              border: '1px solid rgba(245, 158, 11, 0.1)',
              borderLeft: '4px solid #F59E0B'
            }}>
              <div className="card-body">
                <div className="mb-3">
                  <h5 className="mb-1 d-flex align-items-center fw-bold" style={{ color: '#F59E0B' }}>
                    <i className="bi bi-bell me-2"></i>
                    Promemoria Automatici
                  </h5>
                  <small className="text-muted">Notifiche email per pagamenti in sospeso</small>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sendReminders"
                    checked={settings.sendReminders}
                    onChange={(e) => setSettings({ ...settings, sendReminders: e.target.checked })}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="sendReminders">
                    Abilita invio promemoria automatici
                  </label>
                  <div className="form-text">Invia email di reminder agli utenti con pagamenti in attesa</div>
                </div>

                {settings.sendReminders && (
                  <div className="row g-3 ms-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Intervallo Promemoria</label>
                      <input
                        type="number"
                        className="form-control"
                        value={settings.paymentReminderHours}
                        onChange={(e) => setSettings({ ...settings, paymentReminderHours: parseInt(e.target.value) || 1 })}
                        min="1"
                        max="168"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e9ecef'
                        }}
                      />
                      <small className="form-text text-muted">
                        Invia promemoria ogni {settings.paymentReminderHours} {settings.paymentReminderHours === 1 ? 'ora' : 'ore'} dopo l'approvazione<br />
                        Consigliato: 24 ore (1 giorno) o 48 ore (2 giorni)
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* IMPOSTAZIONI GENERALI */}
          <div className="col-12">
            <div className="card shadow-sm" style={{
              borderRadius: '16px',
              border: '1px solid rgba(107, 114, 128, 0.1)',
              borderLeft: '4px solid #6B7280'
            }}>
              <div className="card-body">
                <div className="mb-3">
                  <h5 className="mb-1 d-flex align-items-center fw-bold" style={{ color: '#6B7280' }}>
                    <i className="bi bi-gear me-2"></i>
                    Impostazioni Generali
                  </h5>
                  <small className="text-muted">Valuta, tasse e altre configurazioni</small>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Valuta</label>
                    <select
                      className="form-select"
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Aliquota IVA (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <small className="form-text text-muted">IVA standard in Italia: 22%</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="col-12">
            <div className="card shadow-sm" style={{
              borderRadius: '16px',
              border: '2px solid #2B548E'
            }}>
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 fw-bold" style={{ color: '#2B548E' }}>Salva Modifiche</h6>
                  <small className="text-muted">Applica le modifiche alle impostazioni di pagamento</small>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-lg fw-semibold"
                  style={{
                    background: saving ? '#6c757d' : 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(43, 84, 142, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>
                      Salva Impostazioni
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
