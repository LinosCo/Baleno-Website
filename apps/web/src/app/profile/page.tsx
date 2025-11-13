'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserNavbar from '../../components/UserNavbar';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  avatar?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('http://localhost:4000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
        });
        setLoading(false);
      })
      .catch(_err => {
        localStorage.removeItem('accessToken');
        router.push('/login');
      });
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:4000/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento del profilo');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setSuccess('Profilo aggiornato con successo!');
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Errore nell\'aggiornamento del profilo');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:4000/api/users/${user?.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Password corrente non corretta');
      }

      setSuccess('Password cambiata con successo!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Errore nel cambio password');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <p className="text-muted">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <UserNavbar />

      <div className="container py-4">
        <h1 className="h3 fw-bold text-baleno-primary mb-4">Impostazioni Profilo</h1>
        <div style={{ maxWidth: '900px', margin: '0 auto' }} className="d-flex flex-column gap-4">
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center" role="alert">
              <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
              {success}
            </div>
          )}

          {/* Profile Info Card */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h5 fw-bold mb-0">Informazioni Personali</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn btn-link fw-medium text-decoration-none"
                    style={{ color: 'var(--baleno-primary)' }}
                  >
                    Modifica
                  </button>
                )}
              </div>

              {!editMode ? (
                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold fs-3"
                      style={{ width: '80px', height: '80px' }}
                    >
                      {user?.firstName[0]}{user?.lastName[0]}
                    </div>
                    <div>
                      <p className="h5 fw-semibold mb-1">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-muted mb-0">{user?.email}</p>
                    </div>
                  </div>

                  <div className="row g-3 pt-3">
                    <div className="col-md-6">
                      <p className="small text-muted mb-1">Nome</p>
                      <p className="fw-medium mb-0">{user?.firstName}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="small text-muted mb-1">Cognome</p>
                      <p className="fw-medium mb-0">{user?.lastName}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="small text-muted mb-1">Email</p>
                      <p className="fw-medium mb-0">{user?.email}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="small text-muted mb-1">Telefono</p>
                      <p className="fw-medium mb-0">{user?.phone || 'Non impostato'}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="small text-muted mb-1">Ruolo</p>
                      <span className="badge bg-primary">{user?.role}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Nome</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Cognome</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Telefono</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-3">
                    <button type="submit" className="btn btn-primary fw-semibold">
                      Salva Modifiche
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="btn btn-secondary fw-semibold"
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-4">Cambia Password</h2>

              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Password Corrente</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Nuova Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={8}
                    className="form-control"
                  />
                  <div className="form-text">Minimo 8 caratteri</div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Conferma Nuova Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    className="form-control"
                  />
                </div>

                <button type="submit" className="btn btn-primary fw-semibold">
                  Cambia Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
