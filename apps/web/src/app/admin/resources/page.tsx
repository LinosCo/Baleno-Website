'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { API_ENDPOINTS } from '../../../config/api';

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  isActive: boolean;
  location: string;
  amenities: string[];
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ROOM',
    description: '',
    capacity: 0,
    pricePerHour: 0,
    isActive: true,
    location: '',
    amenities: '',
  });

  const fetchResources = () => {
    const token = localStorage.getItem('accessToken');

    fetch(API_ENDPOINTS.resources, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');

    const payload = {
      ...formData,
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
      capacity: parseInt(formData.capacity.toString()),
      pricePerHour: parseFloat(formData.pricePerHour.toString()),
    };

    try {
      const url = editingResource
        ? `${API_ENDPOINTS.resources}/${editingResource.id}`
        : API_ENDPOINTS.resources;

      const method = editingResource ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      fetchResources();
      setShowModal(false);
      setEditingResource(null);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      description: resource.description || '',
      capacity: resource.capacity,
      pricePerHour: resource.pricePerHour,
      isActive: resource.isActive,
      location: resource.location || '',
      amenities: resource.amenities.join(', '),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa risorsa?')) return;

    const token = localStorage.getItem('accessToken');

    try {
      await fetch(`${API_ENDPOINTS.resources}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'ROOM',
      description: '',
      capacity: 0,
      pricePerHour: 0,
      isActive: true,
      location: '',
      amenities: '',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <p className="text-muted">Caricamento risorse...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h1 className="h3 fw-bold text-baleno-primary mb-1">Gestione Risorse</h1>
            <p className="text-muted mb-0">Aggiungi, modifica o rimuovi risorse prenotabili</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingResource(null);
              setShowModal(true);
            }}
            className="btn btn-primary fw-semibold"
          >
            + Aggiungi Risorsa
          </button>
        </div>

        {/* Resources Grid */}
        <div className="row g-3">
          {resources.map((resource) => (
            <div key={resource.id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h3 className="h5 fw-bold mb-0">{resource.name}</h3>
                    <span
                      className={`badge ${
                        resource.isActive
                          ? 'bg-success'
                          : 'bg-secondary'
                      }`}
                    >
                      {resource.isActive ? 'ATTIVA' : 'NON ATTIVA'}
                    </span>
                  </div>

                  <p className="text-muted small mb-3">{resource.description}</p>

                  <div className="d-flex flex-column gap-2 mb-3">
                    <div className="d-flex justify-content-between small">
                      <span className="text-muted">Tipo:</span>
                      <span className="fw-semibold">{resource.type}</span>
                    </div>
                    <div className="d-flex justify-content-between small">
                      <span className="text-muted">Capacità:</span>
                      <span className="fw-semibold">{resource.capacity} persone</span>
                    </div>
                    <div className="d-flex justify-content-between small">
                      <span className="text-muted">Prezzo:</span>
                      <span className="fw-semibold text-primary">€{resource.pricePerHour}/h</span>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-auto">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="btn btn-sm btn-outline-primary flex-fill fw-semibold"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="btn btn-sm btn-outline-danger flex-fill fw-semibold"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Bootstrap Italia */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-baleno-primary">
                  {editingResource ? 'Modifica Risorsa' : 'Nuova Risorsa'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="form-control"
                      placeholder="es. Sala Riunioni A"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tipo *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="form-select"
                    >
                      <option value="ROOM">Sala</option>
                      <option value="SPACE">Spazio</option>
                      <option value="EQUIPMENT">Attrezzatura</option>
                      <option value="SERVICE">Servizio</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Descrizione</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="form-control"
                      placeholder="Descrizione della risorsa..."
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Capacità *</label>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                        required
                        min="1"
                        className="form-control"
                        placeholder="es. 20"
                      />
                      <div className="form-text">Numero di persone</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Prezzo/ora (€) *</label>
                      <input
                        type="number"
                        value={formData.pricePerHour}
                        onChange={(e) => setFormData({ ...formData, pricePerHour: parseFloat(e.target.value) })}
                        required
                        min="0"
                        step="0.01"
                        className="form-control"
                        placeholder="es. 25.00"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Posizione</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="form-control"
                      placeholder="es. Piano Terra, Ala Nord"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Caratteristiche (separate da virgola)
                    </label>
                    <input
                      type="text"
                      value={formData.amenities}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      placeholder="WiFi, Proiettore, Lavagna"
                      className="form-control"
                    />
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="form-check-input"
                    />
                    <label htmlFor="isActive" className="form-check-label">
                      Risorsa attiva e prenotabile
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fw-semibold"
                  >
                    {editingResource ? 'Salva Modifiche' : 'Crea Risorsa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
