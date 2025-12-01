'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '../../config/api';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }

    if (!token) {
      setError('Token mancante. Richiedi un nuovo link per reimpostare la password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore durante il reset della password');
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Errore durante il reset della password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden auth-page">
        <div className="auth-pattern"></div>
        <div className={`auth-card ${mounted ? 'fade-in-up' : 'opacity-0'}`}>
          <div className="auth-card-body text-center">
            <div className="mx-auto d-flex align-items-center justify-content-center mb-4" style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#f8d7da'
            }}>
              <svg width="32" height="32" fill="#dc3545" viewBox="0 0 16 16">
                <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
                <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
              </svg>
            </div>
            <h1 className="h4 fw-bold mb-3" style={{ color: '#2B548E' }}>
              Link non valido
            </h1>
            <p className="text-muted mb-4">
              Il link per reimpostare la password non è valido o è scaduto.
            </p>
            <Link
              href="/forgot-password"
              className="btn btn-lg w-100 fw-semibold auth-btn-primary"
            >
              Richiedi nuovo link
            </Link>
            <div className="mt-4">
              <Link href="/login" className="text-muted text-decoration-none small hover-link">
                ← Torna al login
              </Link>
            </div>
          </div>
        </div>
        <style jsx>{`
          .auth-page {
            background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%);
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
            border-radius: 24px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            max-width: 480px;
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
          .auth-btn-primary {
            background: linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%);
            border: none;
            color: white;
            padding: 0.875rem 1.5rem;
            border-radius: 12px;
            transition: all 0.3s ease;
          }
          .auth-btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, #1e3a5f 0%, #2B548E 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(43, 84, 142, 0.3);
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
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden auth-page">
        <div className="auth-pattern"></div>
        <div className={`auth-card ${mounted ? 'fade-in-up' : 'opacity-0'}`}>
          <div className="auth-card-body text-center">
            <div className="mx-auto d-flex align-items-center justify-content-center mb-4" style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#d4edda'
            }}>
              <svg width="32" height="32" fill="#28a745" viewBox="0 0 16 16">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
              </svg>
            </div>
            <h1 className="h4 fw-bold mb-3" style={{ color: '#2B548E' }}>
              Password reimpostata!
            </h1>
            <p className="text-muted mb-4">
              La tua password è stata reimpostata con successo. Verrai reindirizzato alla pagina di login...
            </p>
            <Link
              href="/login"
              className="btn btn-lg w-100 fw-semibold auth-btn-primary"
            >
              Vai al login
            </Link>
          </div>
        </div>
        <style jsx>{`
          .auth-page {
            background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%);
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
            border-radius: 24px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            max-width: 480px;
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
          .auth-btn-primary {
            background: linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%);
            border: none;
            color: white;
            padding: 0.875rem 1.5rem;
            border-radius: 12px;
            transition: all 0.3s ease;
          }
          .auth-btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, #1e3a5f 0%, #2B548E 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(43, 84, 142, 0.3);
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
      </div>
    );
  }

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
              <div className="mx-auto d-flex align-items-center justify-content-center mb-3" style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(43, 84, 142, 0.1)'
              }}>
                <svg width="28" height="28" fill="#2B548E" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647z"/>
                </svg>
              </div>
              <h1 className="h3 fw-bold mb-2" style={{ color: '#2B548E' }}>
                Nuova password
              </h1>
              <p className="text-muted">
                Inserisci la tua nuova password per completare il reset
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="password" className="form-label fw-semibold" style={{ color: '#495057' }}>
                  Nuova password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="form-control form-control-lg"
                  placeholder="Minimo 8 caratteri"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label fw-semibold" style={{ color: '#495057' }}>
                  Conferma password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="form-control form-control-lg"
                  placeholder="Ripeti la password"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 d-flex align-items-start" role="alert" style={{
                  borderRadius: '12px',
                  backgroundColor: '#f8d7da',
                  border: '1px solid #dc3545',
                  color: '#721c24'
                }}>
                  <svg className="me-2 flex-shrink-0" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginTop: '2px' }}>
                    <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
                    <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
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
                    Reimpostazione in corso...
                  </>
                ) : (
                  'Reimposta password'
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <Link
                href="/login"
                className="text-muted text-decoration-none small hover-link"
              >
                ← Torna al login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%);
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
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          max-width: 480px;
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
          border-radius: 12px;
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
          border-radius: 12px;
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%)' }}>
        <div className="spinner-border" style={{ color: '#2B548E' }} role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
