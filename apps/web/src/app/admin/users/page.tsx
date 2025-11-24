'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { usersAPI } from '../../../lib/api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'USER' as 'USER' | 'COMMUNITY_MANAGER' | 'ADMIN',
  });

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await usersAPI.updateRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string, userEmail: string) => {
    // Prevent deletion of main admin account
    if (userEmail === 'admin@balenosanzeno.it') {
      alert('❌ Impossibile eliminare l\'account amministratore principale.\n\nQuesto account è protetto e non può essere eliminato.');
      return;
    }

    if (!confirm(`⚠️ ATTENZIONE!\n\nStai per eliminare l'utente ${userName}.\n\nSaranno eliminati anche:\n- Tutte le prenotazioni\n- Tutti i pagamenti\n- Tutti i dati associati\n\nQuesta azione NON può essere annullata.\n\nSei sicuro di voler procedere?`)) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      alert(`✓ Utente ${userName} eliminato con successo!`);
      fetchUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Errore nell\'eliminazione dell\'utente';
      alert(`❌ Errore: ${errorMessage}`);
      console.error('Delete user error:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');

    try {
      await usersAPI.create(createForm);
      setShowCreateModal(false);
      setCreateForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'USER',
      });
      fetchUsers();
      alert('✓ Utente creato con successo!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Errore nella creazione dell\'utente';
      setCreateError(errorMessage);
      console.error('Create user error:', err);
    } finally {
      setCreating(false);
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
            <p className="text-muted">Caricamento utenti...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 fw-bold text-baleno-primary">Gestione Utenti</h1>
            <p className="text-muted">Gestisci ruoli e permessi degli utenti</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Nuovo Utente
          </button>
        </div>

        {/* Stats */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted small mb-2">Totale Utenti</p>
                <p className="display-6 fw-bold mb-0">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted small mb-2">Amministratori</p>
                <p className="display-6 fw-bold text-primary mb-0">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <p className="text-muted small mb-2">Utenti Attivi</p>
                <p className="display-6 fw-bold text-success mb-0">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="fw-semibold text-uppercase small">Utente</th>
                    <th className="fw-semibold text-uppercase small">Email</th>
                    <th className="fw-semibold text-uppercase small">Ruolo</th>
                    <th className="fw-semibold text-uppercase small">Registrazione</th>
                    <th className="fw-semibold text-uppercase small">Ultimo Accesso</th>
                    <th className="fw-semibold text-uppercase small text-end">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{ width: '40px', height: '40px' }}
                          >
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div className="ms-3">
                            <div className="fw-semibold">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted small align-middle">{user.email}</td>
                      <td className="align-middle">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="form-select form-select-sm"
                          style={{ width: 'auto', minWidth: '180px' }}
                          disabled={user.email === 'admin@balenosanzeno.it'}
                        >
                          <option value="USER">USER</option>
                          <option value="COMMUNITY_MANAGER">COMMUNITY_MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="text-muted small align-middle">
                        {new Date(user.createdAt).toLocaleDateString('it-IT')}
                      </td>
                      <td className="text-muted small align-middle">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('it-IT')
                          : 'Mai'}
                      </td>
                      <td className="align-middle text-end">
                        {user.email !== 'admin@balenosanzeno.it' && (
                          <button
                            onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`, user.email)}
                            className="btn btn-sm btn-outline-danger"
                            title="Elimina utente"
                          >
                            <i className="bi bi-trash"></i> Elimina
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCreateModal(false)}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ borderRadius: '16px' }}>
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold">Crea Nuovo Utente</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                </div>
                <form onSubmit={handleCreateUser}>
                  <div className="modal-body">
                    {createError && (
                      <div className="alert alert-danger mb-3">{createError}</div>
                    )}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Nome *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={createForm.firstName}
                          onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                          required
                          minLength={2}
                          maxLength={50}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Cognome *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={createForm.lastName}
                          onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                          required
                          minLength={2}
                          maxLength={50}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={createForm.email}
                          onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Password *</label>
                        <input
                          type="password"
                          className="form-control"
                          value={createForm.password}
                          onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                          required
                          minLength={8}
                          placeholder="Minimo 8 caratteri"
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Telefono</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={createForm.phone}
                          onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Ruolo *</label>
                        <select
                          className="form-select"
                          value={createForm.role}
                          onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'USER' | 'COMMUNITY_MANAGER' | 'ADMIN' })}
                          required
                        >
                          <option value="USER">USER</option>
                          <option value="COMMUNITY_MANAGER">COMMUNITY_MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                      disabled={creating}
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={creating}
                    >
                      {creating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creazione...
                        </>
                      ) : (
                        'Crea Utente'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
