'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { API_URL } from '../../../config/api';

interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  // Filtri
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
    });

    if (filterAction) params.append('action', filterAction);
    if (filterEntity) params.append('entity', filterEntity);
    if (filterUser) params.append('userId', filterUser);

    try {
      const response = await fetch(`${API_URL}/audit-logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filterAction, filterEntity, filterUser]);

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-success';
      case 'UPDATE': return 'bg-info';
      case 'DELETE': return 'bg-danger';
      case 'APPROVE': return 'bg-primary';
      case 'REJECT': return 'bg-warning text-dark';
      case 'CANCEL': return 'bg-secondary';
      case 'LOGIN': return 'bg-success bg-opacity-50';
      case 'LOGOUT': return 'bg-secondary bg-opacity-50';
      default: return 'bg-secondary';
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'booking': return '📅';
      case 'resource': return '🏢';
      case 'user': return '👤';
      case 'payment': return '💳';
      default: return '📄';
    }
  };

  const actionLabels: Record<string, string> = {
    'CREATE': 'Creazione',
    'UPDATE': 'Modifica',
    'DELETE': 'Eliminazione',
    'APPROVE': 'Approvazione',
    'REJECT': 'Rifiuto',
    'CANCEL': 'Cancellazione',
    'LOGIN': 'Login',
    'LOGOUT': 'Logout',
    'ROLE_CHANGE': 'Cambio Ruolo'
  };

  if (loading && logs.length === 0) {
    return (
      <AdminLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <p className="text-muted">Caricamento audit logs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-3">
          <h1 className="h3 fw-bold text-baleno-primary mb-1">Audit Logs</h1>
          <p className="text-muted mb-0">Registro completo di tutte le azioni nel sistema</p>
        </div>

        {/* Filtri */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2">
            <div className="row g-2 align-items-center">
              <div className="col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={filterAction}
                  onChange={(e) => {
                    setFilterAction(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tutte le azioni</option>
                  <option value="CREATE">Creazione</option>
                  <option value="UPDATE">Modifica</option>
                  <option value="DELETE">Eliminazione</option>
                  <option value="APPROVE">Approvazione</option>
                  <option value="REJECT">Rifiuto</option>
                  <option value="CANCEL">Cancellazione</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                </select>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={filterEntity}
                  onChange={(e) => {
                    setFilterEntity(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tutte le entità</option>
                  <option value="booking">Prenotazioni</option>
                  <option value="resource">Risorse</option>
                  <option value="user">Utenti</option>
                  <option value="payment">Pagamenti</option>
                </select>
              </div>

              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Filtra per email utente..."
                  value={filterUser}
                  onChange={(e) => {
                    setFilterUser(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="col-md-2 text-end">
                <span className="badge bg-light text-dark">
                  {total} logs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {logs.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p className="mb-0">Nessun log trovato</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold text-uppercase small" style={{ width: '140px' }}>Data/Ora</th>
                      <th className="fw-semibold text-uppercase small" style={{ width: '100px' }}>Azione</th>
                      <th className="fw-semibold text-uppercase small" style={{ width: '80px' }}>Entità</th>
                      <th className="fw-semibold text-uppercase small">Descrizione</th>
                      <th className="fw-semibold text-uppercase small" style={{ width: '200px' }}>Utente</th>
                      <th className="fw-semibold text-uppercase small" style={{ width: '80px' }}>Dettagli</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="small text-muted">
                          {new Date(log.createdAt).toLocaleString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>
                          <span className={`badge ${getActionBadgeClass(log.action)}`}>
                            {actionLabels[log.action] || log.action}
                          </span>
                        </td>
                        <td className="text-center">
                          <span style={{ fontSize: '1.2rem' }}>
                            {getEntityIcon(log.entity)}
                          </span>
                        </td>
                        <td>
                          <div className="fw-medium">{log.description}</div>
                          {log.entityId && (
                            <div className="text-muted small">ID: {log.entityId.substring(0, 8)}...</div>
                          )}
                        </td>
                        <td>
                          {log.userEmail ? (
                            <>
                              <div className="fw-medium small">{log.userEmail}</div>
                              {log.userRole && (
                                <span className="badge bg-secondary bg-opacity-10 text-secondary-emphasis" style={{ fontSize: '0.7rem' }}>
                                  {log.userRole}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted small">Sistema</span>
                          )}
                        </td>
                        <td>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <button
                              className="btn btn-link btn-sm p-0 text-decoration-none"
                              onClick={() => {
                                alert(JSON.stringify(log.metadata, null, 2));
                              }}
                              title="Visualizza metadata"
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="card-footer bg-light border-top">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">
                  Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} di {total}
                </div>
                <div className="btn-group btn-group-sm">
                  <button
                    className="btn btn-outline-secondary"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    ← Precedente
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    disabled={page * limit >= total}
                    onClick={() => setPage(page + 1)}
                  >
                    Successiva →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="alert alert-info mt-3 mb-0" role="alert">
          <small>
            <strong>📝 Nota:</strong> Gli audit logs registrano tutte le azioni importanti eseguite nel sistema.
            I log vengono mantenuti per 90 giorni e poi eliminati automaticamente.
          </small>
        </div>
      </div>
    </AdminLayout>
  );
}
