'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { authAPI } from '../../lib/api-client';

function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    vatNumber: '',
    companyName: '',
    fiscalCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      const data = response.data;

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (data.user.role === 'ADMIN' || data.user.role === 'COMMUNITY_MANAGER') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden auth-page">
        {/* Background Pattern */}
        <div className="auth-pattern"></div>

        <div className={`auth-card ${mounted ? 'fade-in-up' : 'opacity-0'}`}>
          <div className="auth-card-body">
            {/* Logo */}
            <div className="text-center mb-4">
              <Link href="/">
                <Image
                  src="/BALENO-LOGO-BIANCO.png"
                  alt="Baleno San Zeno"
                  width={140}
                  height={44}
                  className="mb-3"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(24%) sepia(51%) saturate(1347%) hue-rotate(189deg) brightness(92%) contrast(91%)',
                    height: 'auto',
                    cursor: 'pointer'
                  }}
                />
              </Link>
            </div>

            <div className="text-center mb-4">
              <h1 className="h2 fw-bold mb-2" style={{ color: '#2B548E' }}>
                Crea il tuo account
              </h1>
              <p className="text-muted">
                Unisciti alla community di Baleno
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label htmlFor="firstName" className="form-label fw-semibold" style={{ color: '#495057' }}>
                    Nome
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="form-control"
                    placeholder="Mario"
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="lastName" className="form-label fw-semibold" style={{ color: '#495057' }}>
                    Cognome
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="form-control"
                    placeholder="Rossi"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold" style={{ color: '#495057' }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="form-control"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label fw-semibold" style={{ color: '#495057' }}>
                  Telefono
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="form-control"
                  placeholder="+39 123 456 7890"
                />
              </div>

              {/* Sezione Fatturazione */}
              <div className="mb-3 pt-3 border-top">
                <h6 className="fw-bold mb-3" style={{ color: '#2B548E' }}>
                  Dati per Fatturazione <span className="text-muted fw-normal small">(opzionale)</span>
                </h6>

                <div className="mb-3">
                  <label htmlFor="companyName" className="form-label fw-semibold" style={{ color: '#495057' }}>
                    Nome Azienda
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="form-control"
                    placeholder="Es: Acme S.r.l."
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="vatNumber" className="form-label fw-semibold" style={{ color: '#495057' }}>
                      Partita IVA
                    </label>
                    <input
                      id="vatNumber"
                      type="text"
                      value={formData.vatNumber}
                      onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                      className="form-control"
                      placeholder="IT12345678901"
                      maxLength={16}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="fiscalCode" className="form-label fw-semibold" style={{ color: '#495057' }}>
                      Codice Fiscale
                    </label>
                    <input
                      id="fiscalCode"
                      type="text"
                      value={formData.fiscalCode}
                      onChange={(e) => setFormData({ ...formData, fiscalCode: e.target.value.toUpperCase() })}
                      className="form-control"
                      placeholder="RSSMRA80A01H501X"
                      maxLength={16}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4 pt-3 border-top">
                <label htmlFor="password" className="form-label fw-semibold" style={{ color: '#495057' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="form-control"
                  placeholder="Almeno 8 caratteri"
                />
                <div className="form-text small">
                  La password deve contenere almeno 8 caratteri
                </div>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-start mb-4" role="alert">
                  <svg className="me-2 mt-1 flex-shrink-0" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                  </svg>
                  <div className="small">{error}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-lg w-100 fw-semibold auth-btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registrazione in corso...
                  </>
                ) : (
                  'Crea Account'
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-muted mb-0">
                Hai già un account?{' '}
                <Link
                  href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                  className="fw-semibold text-decoration-none hover-link"
                  style={{ color: '#2B548E' }}
                >
                  Accedi
                </Link>
              </p>
            </div>

            <div className="text-center mt-4 pt-3 border-top">
              <Link
                href="/"
                className="text-muted text-decoration-none small hover-link"
              >
                ← Torna alla home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%);
          padding: 3rem 0;
        }

        .auth-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            radial-gradient(circle at 15% 20%, rgba(43, 84, 142, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 85% 80%, rgba(237, 187, 0, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .auth-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          width: 100%;
          position: relative;
          z-index: 1;
          border: 1px solid rgba(43, 84, 142, 0.1);
        }

        .auth-card-body {
          padding: 3rem 2.5rem;
        }

        @media (max-width: 576px) {
          .auth-card-body {
            padding: 2rem 1.5rem;
          }
        }

        .form-control {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: #2B548E;
          box-shadow: 0 0 0 0.2rem rgba(43, 84, 142, 0.15);
        }

        .auth-btn-primary {
          background: linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%);
          border: none;
          color: white;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .auth-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #1e3a5f 0%, #2B548E 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(43, 84, 142, 0.3);
        }

        .auth-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .hover-link {
          transition: color 0.2s ease;
        }

        .hover-link:hover {
          color: #EDBB00 !important;
        }

        .fade-in-up {
          animation: fadeInUp 0.6s ease forwards;
        }

        .opacity-0 {
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%)' }}>
        <div className="spinner-border" style={{ color: '#2B548E' }} role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
