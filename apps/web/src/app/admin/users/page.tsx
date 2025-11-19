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
        <div className="mb-4">
          <h1 className="h3 fw-bold text-baleno-primary">Gestione Utenti</h1>
          <p className="text-muted">Gestisci ruoli e permessi degli utenti</p>
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
      </div>
    </AdminLayout>
  );
}
