'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authAPI } from '../../lib/api-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const data = response.data;

      // Salva il token e reindirizza in base al ruolo
      localStorage.setItem('accessToken', data.accessToken);
      if (data.user.role === 'ADMIN' || data.user.role === 'COMMUNITY_MANAGER') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-4">
      <div className="card shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          {/* Logo */}
          <div className="text-center mb-4">
            <Image
              src="/BALENO-LOGO-BIANCO.png"
              alt="Baleno Sanzeno"
              width={160}
              height={50}
              className="mb-3"
              style={{
                filter: 'brightness(0) saturate(100%) invert(24%) sepia(51%) saturate(1347%) hue-rotate(189deg) brightness(92%) contrast(91%)',
                height: 'auto'
              }}
            />
          </div>

          <div className="text-center mb-4">
            <h1 className="h3 fw-bold text-baleno-primary mb-2">
              Accedi
            </h1>
            <p className="text-muted">
              Benvenuto su Baleno Booking System
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control form-control-lg"
                placeholder="tu@email.com"
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label htmlFor="password" className="form-label fw-semibold mb-0">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="small text-decoration-none"
                  style={{ color: 'var(--baleno-primary)' }}
                >
                  Password dimenticata?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control form-control-lg"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                <div>{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-100 fw-semibold"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Accesso in corso...
                </>
              ) : (
                'Accedi'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted mb-0">
              Non hai un account?{' '}
              <Link
                href="/register"
                className="fw-semibold text-decoration-none"
                style={{ color: 'var(--baleno-primary)' }}
              >
                Registrati
              </Link>
            </p>
          </div>

          <hr className="my-4" />

          <div className="text-center">
            <Link
              href="/"
              className="btn btn-link text-muted text-decoration-none"
            >
              ← Torna alla home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
