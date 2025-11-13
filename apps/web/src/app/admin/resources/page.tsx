'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import ImageUpload from '../../../components/admin/ImageUpload';
import { API_ENDPOINTS } from '../../../config/api';

interface Resource {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  minBookingHours: number;
  isActive: boolean;
  maintenanceMode: boolean;
  maintenanceStart?: string;
  maintenanceEnd?: string;
  maintenanceReason?: string;
  location: string;
  images: string[];
  amenities: string[];
  features: string[];
  tags: string[];
  restrictions?: string;
  wheelchairAccessible: boolean;
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ROOM',
    category: 'MEETING_ROOM',
    description: '',
    capacity: 1,
    pricePerHour: 0,
    minBookingHours: 1,
    isActive: true,
    maintenanceMode: false,
    maintenanceStart: '',
    maintenanceEnd: '',
    maintenanceReason: '',
    location: '',
    images: [] as string[],
    amenities: '',
    features: '',
    tags: '',
    restrictions: '',
    wheelchairAccessible: false,
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
      name: formData.name,
      type: formData.type,
      category: formData.category,
      description: formData.description,
      capacity: parseInt(formData.capacity.toString()),
      pricePerHour: parseFloat(formData.pricePerHour.toString()),
      minBookingHours: parseInt(formData.minBookingHours.toString()),
      isActive: formData.isActive,
      maintenanceMode: formData.maintenanceMode,
      maintenanceStart: formData.maintenanceStart || undefined,
      maintenanceEnd: formData.maintenanceEnd || undefined,
      maintenanceReason: formData.maintenanceReason || undefined,
      location: formData.location,
      images: formData.images,
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
      features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      restrictions: formData.restrictions || undefined,
      wheelchairAccessible: formData.wheelchairAccessible,
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
      alert('Errore nel salvare la risorsa');
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      category: resource.category || 'OTHER',
      description: resource.description || '',
      capacity: resource.capacity,
      pricePerHour: resource.pricePerHour,
      minBookingHours: resource.minBookingHours || 1,
      isActive: resource.isActive,
      maintenanceMode: resource.maintenanceMode || false,
      maintenanceStart: resource.maintenanceStart ? (resource.maintenanceStart.split('T')[0] ?? '') : '',
      maintenanceEnd: resource.maintenanceEnd ? (resource.maintenanceEnd.split('T')[0] ?? '') : '',
      maintenanceReason: resource.maintenanceReason || '',
      location: resource.location || '',
      images: resource.images || [],
      amenities: resource.amenities?.join(', ') || '',
      features: resource.features?.join(', ') || '',
      tags: resource.tags?.join(', ') || '',
      restrictions: resource.restrictions || '',
      wheelchairAccessible: resource.wheelchairAccessible || false,
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

  const handleToggleActive = async (resource: Resource) => {
    const token = localStorage.getItem('accessToken');
    const newStatus = !resource.isActive;
    const action = newStatus ? 'attivare' : 'disattivare';

    if (!confirm(`Sei sicuro di voler ${action} la risorsa "${resource.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.resources}/${resource.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || response.statusText);
      }

      alert(`✓ Risorsa "${resource.name}" ${newStatus ? 'attivata' : 'disattivata'} con successo!`);
      fetchResources();
    } catch (err: any) {
      const errorMessage = err.message || 'Errore nell\'aggiornamento dello stato';
      alert(`❌ ${errorMessage}`);
      console.error('Toggle active error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'ROOM',
      category: 'MEETING_ROOM',
      description: '',
      capacity: 1,
      pricePerHour: 0,
      minBookingHours: 1,
      isActive: true,
      maintenanceMode: false,
      maintenanceStart: '',
      maintenanceEnd: '',
      maintenanceReason: '',
      location: '',
      images: [],
      amenities: '',
      features: '',
      tags: '',
      restrictions: '',
      wheelchairAccessible: false,
    });
  };

  const categoryLabels: Record<string, string> = {
    'MEETING_ROOM': 'Sale Riunioni',
    'COWORKING': 'Coworking',
    'EVENT_SPACE': 'Spazi Eventi',
    'EQUIPMENT': 'Attrezzature',
    'SERVICE': 'Servizi',
    'OTHER': 'Altro'
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
                    <div className="d-flex gap-1">
                      {resource.wheelchairAccessible && (
                        <span className="badge bg-info" title="Accessibile">♿</span>
                      )}
                      <span
                        className={`badge ${
                          resource.maintenanceMode
                            ? 'bg-warning text-dark'
                            : resource.isActive
                            ? 'bg-success'
                            : 'bg-secondary'
                        }`}
                      >
                        {resource.maintenanceMode ? 'MANUTENZIONE' : resource.isActive ? 'ATTIVA' : 'NON ATTIVA'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="badge bg-info text-white me-1">
                      {categoryLabels[resource.category] || resource.category}
                    </span>
                    <span className="badge bg-secondary text-white">
                      {resource.type}
                    </span>
                  </div>

                  <p className="text-muted small mb-3">{resource.description}</p>

                  <div className="d-flex flex-column gap-2 mb-3">
                    <div className="d-flex justify-content-between small">
                      <span className="text-muted">Capacità:</span>
                      <span className="fw-semibold">{resource.capacity} persone</span>
                    </div>
                    <div className="d-flex justify-content-between small">
                      <span className="text-muted">Prezzo:</span>
                      <span className="fw-semibold text-primary">€{resource.pricePerHour}/h</span>
                    </div>
                    {resource.minBookingHours > 1 && (
                      <div className="d-flex justify-content-between small">
                        <span className="text-muted">Min ore:</span>
                        <span className="fw-semibold">{resource.minBookingHours}h</span>
                      </div>
                    )}
                  </div>

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="mb-2">
                      <div className="d-flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                            #{tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                            +{resource.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="d-flex flex-column gap-2 mt-auto">
                    <button
                      onClick={() => handleToggleActive(resource)}
                      className={`btn btn-sm fw-semibold ${
                        resource.isActive
                          ? 'btn-outline-danger'
                          : 'btn-outline-success'
                      }`}
                      title={resource.isActive ? 'Disattiva risorsa' : 'Attiva risorsa'}
                    >
                      {resource.isActive ? '⏸ Disattiva' : '✓ Attiva'}
                    </button>
                    <div className="d-flex gap-2">
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
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form Completo */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl"
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
                  {/* Informazioni Base */}
                  <h6 className="fw-bold text-primary mb-3">Informazioni Base</h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
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

                    <div className="col-md-3">
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

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Categoria *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="form-select"
                      >
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Descrizione</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="form-control"
                      placeholder="Descrizione dettagliata della risorsa..."
                    />
                  </div>

                  {/* Capacità e Prezzi */}
                  <h6 className="fw-bold text-primary mb-3">Capacità e Prezzi</h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Capacità *</label>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                        required
                        min="1"
                        className="form-control"
                        placeholder="es. 20"
                      />
                      <div className="form-text">Numero di persone</div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Prezzo/ora (€) *</label>
                      <input
                        type="number"
                        value={formData.pricePerHour}
                        onChange={(e) => setFormData({ ...formData, pricePerHour: parseFloat(e.target.value) || 0 })}
                        required
                        min="0"
                        step="0.01"
                        className="form-control"
                        placeholder="es. 25.00"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Min. ore prenotazione</label>
                      <input
                        type="number"
                        value={formData.minBookingHours}
                        onChange={(e) => setFormData({ ...formData, minBookingHours: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="form-control"
                        placeholder="es. 2"
                      />
                      <div className="form-text">Ore minime consecutive</div>
                    </div>
                  </div>

                  {/* Posizione */}
                  <h6 className="fw-bold text-primary mb-3">Posizione</h6>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Posizione</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="form-control"
                      placeholder="es. Piano Terra, Ala Nord"
                    />
                  </div>

                  {/* Caratteristiche */}
                  <h6 className="fw-bold text-primary mb-3">Caratteristiche e Servizi</h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Servizi (separati da virgola)
                      </label>
                      <input
                        type="text"
                        value={formData.amenities}
                        onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                        placeholder="WiFi, Proiettore, Lavagna"
                        className="form-control"
                      />
                      <div className="form-text">es: WiFi, Proiettore, Climatizzatore</div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Dotazioni (separate da virgola)
                      </label>
                      <input
                        type="text"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                        placeholder="Lavagna bianca, Schermo 4K, Tavolo conferenza"
                        className="form-control"
                      />
                      <div className="form-text">es: Lavagna bianca, Scrivania ergonomica</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Tag (separati da virgola)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="meeting, presentation, workshop"
                      className="form-control"
                    />
                    <div className="form-text">Tag per facilitare la ricerca</div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Restrizioni d'uso</label>
                    <textarea
                      value={formData.restrictions}
                      onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                      rows={2}
                      className="form-control"
                      placeholder="es. Vietato fumare, Non adatto a bambini piccoli..."
                    />
                  </div>

                  {/* Manutenzione */}
                  <h6 className="fw-bold text-primary mb-3">Stato e Manutenzione</h6>

                  <div className="row g-3 mb-4">
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          id="maintenanceMode"
                          checked={formData.maintenanceMode}
                          onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                          className="form-check-input"
                          role="switch"
                        />
                        <label htmlFor="maintenanceMode" className="form-check-label fw-semibold">
                          Modalità Manutenzione
                        </label>
                      </div>
                    </div>

                    {formData.maintenanceMode && (
                      <>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Data inizio</label>
                          <input
                            type="date"
                            value={formData.maintenanceStart}
                            onChange={(e) => setFormData({ ...formData, maintenanceStart: e.target.value })}
                            className="form-control"
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Data fine</label>
                          <input
                            type="date"
                            value={formData.maintenanceEnd}
                            onChange={(e) => setFormData({ ...formData, maintenanceEnd: e.target.value })}
                            className="form-control"
                          />
                        </div>

                        <div className="col-md-12">
                          <label className="form-label fw-semibold">Motivo manutenzione</label>
                          <input
                            type="text"
                            value={formData.maintenanceReason}
                            onChange={(e) => setFormData({ ...formData, maintenanceReason: e.target.value })}
                            className="form-control"
                            placeholder="es. Lavori di ristrutturazione"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Galleria Immagini */}
                  <h6 className="fw-bold text-primary mb-3">Galleria Immagini</h6>

                  <div className="mb-4">
                    <ImageUpload
                      images={formData.images}
                      onImagesChange={(newImages) => setFormData({ ...formData, images: newImages })}
                      maxImages={10}
                    />
                  </div>

                  {/* Opzioni */}
                  <h6 className="fw-bold text-primary mb-3">Opzioni</h6>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="form-check-input"
                          role="switch"
                        />
                        <label htmlFor="isActive" className="form-check-label">
                          Risorsa attiva e prenotabile
                        </label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          id="wheelchairAccessible"
                          checked={formData.wheelchairAccessible}
                          onChange={(e) => setFormData({ ...formData, wheelchairAccessible: e.target.checked })}
                          className="form-check-input"
                          role="switch"
                        />
                        <label htmlFor="wheelchairAccessible" className="form-check-label">
                          Accessibile in sedia a rotelle ♿
                        </label>
                      </div>
                    </div>
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
