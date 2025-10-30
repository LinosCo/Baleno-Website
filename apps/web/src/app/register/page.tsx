'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authAPI } from '@/lib/api-client';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
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

      // Salva il token e reindirizza in base al ruolo
      localStorage.setItem('accessToken', data.accessToken);
      if (data.user.role === 'ADMIN' || data.user.role === 'COMMUNITY_MANAGER') {
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
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-4">
      <div className="card shadow-lg border-0" style={{ maxWidth: '550px', width: '100%' }}>
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
              Registrati
            </h1>
            <p className="text-muted">
              Crea il tuo account per iniziare
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="firstName" className="form-label fw-semibold">
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
                <label htmlFor="lastName" className="form-label fw-semibold">
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

            <div className="mb-3 mt-3">
              <label htmlFor="email" className="form-label fw-semibold">
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
              <label htmlFor="phone" className="form-label fw-semibold">
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

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
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
              <div className="form-text">
                La password deve contenere almeno 8 caratteri
              </div>
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
                  Registrazione in corso...
                </>
              ) : (
                'Registrati'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted mb-0">
              Hai già un account?{' '}
              <Link
                href="/login"
                className="fw-semibold text-decoration-none"
                style={{ color: 'var(--baleno-primary)' }}
              >
                Accedi
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
