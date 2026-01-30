'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Resource {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  minPrice?: number; // Prezzo minimo totale
  isActive: boolean;
  maintenanceMode: boolean;
  images: string[];
  amenities: string[];
  features: string[];
  tags: string[];
  location?: string;
  wheelchairAccessible: boolean;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Endpoint pubblico - nessuna autenticazione richiesta
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(`${apiUrl}/resources?isActive=true`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setResources(data);
        setFilteredResources(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching resources:', err);
        setError('Errore nel caricamento delle risorse');
        setLoading(false);
      });
  }, []);

  // Applica filtri
  useEffect(() => {
    let filtered = [...resources];

    // Ricerca per nome/descrizione
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(search) ||
        r.description?.toLowerCase().includes(search)
      );
    }

    // Filtro categoria
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Filtro tipo
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(r => r.type === selectedType);
    }

    // Filtro capacità
    if (minCapacity) {
      filtered = filtered.filter(r => r.capacity >= parseInt(minCapacity));
    }
    if (maxCapacity) {
      filtered = filtered.filter(r => r.capacity <= parseInt(maxCapacity));
    }

    // Filtro contributo
    if (minPrice) {
      filtered = filtered.filter(r => r.pricePerHour >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(r => r.pricePerHour <= parseFloat(maxPrice));
    }

    // Filtro accessibilità
    if (wheelchairOnly) {
      filtered = filtered.filter(r => r.wheelchairAccessible);
    }

    // Escludi risorse in manutenzione
    filtered = filtered.filter(r => !r.maintenanceMode);

    setFilteredResources(filtered);
  }, [searchTerm, selectedCategory, selectedType, minCapacity, maxCapacity, minPrice, maxPrice, wheelchairOnly, resources]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedType('ALL');
    setMinCapacity('');
    setMaxCapacity('');
    setMinPrice('');
    setMaxPrice('');
    setWheelchairOnly(false);
  };

  const categoryLabels: Record<string, string> = {
    'ALL': 'Tutte',
    'MEETING_ROOM': 'Sale Riunioni',
    'COWORKING': 'Coworking',
    'EVENT_SPACE': 'Spazi Eventi',
    'EQUIPMENT': 'Attrezzature',
    'SERVICE': 'Servizi',
    'OTHER': 'Altro'
  };

  const typeLabels: Record<string, string> = {
    'ALL': 'Tutti',
    'ROOM': 'Sala',
    'SPACE': 'Spazio',
    'EQUIPMENT': 'Attrezzatura',
    'SERVICE': 'Servizio'
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <p className="text-muted">Caricamento risorse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%)' }}>
      {/* Header pulito stile homepage */}
      <div className="container pt-4 pb-2">
        <div className="d-flex justify-content-end">
          <Link
            href="/"
            className="text-decoration-none fw-medium d-flex align-items-center gap-2"
            style={{
              color: '#2B548E',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EDBB00'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2B548E'}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
            </svg>
            Torna alla Home
          </Link>
        </div>
      </div>

      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="h2 fw-bold mb-2" style={{ color: '#2B548E' }}>I Nostri Spazi</h1>
          <p className="text-muted">Ambienti versatili per ogni tipo di attività</p>
        </div>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {error && (
            <div className="mb-4 p-3 d-flex align-items-start" role="alert" style={{
              borderRadius: '12px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              color: '#856404'
            }}>
              <svg className="me-2 flex-shrink-0" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginTop: '2px' }}>
                <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
                <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
              </svg>
              <div>
                <strong>Attenzione:</strong> {error}
                <br />
                <small style={{ color: '#6c757d' }}>Verifica che il backend sia avviato o riprova tra qualche istante.</small>
              </div>
            </div>
          )}

          {/* Barra di ricerca e filtri */}
          <div className="card shadow-lg mb-4" style={{
            border: '1px solid rgba(43, 84, 142, 0.1)',
            borderRadius: '24px'
          }}>
            <div className="card-body" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
              {/* Ricerca */}
              <div className="row g-3 align-items-end mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Cerca risorse</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Nome o descrizione..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6 d-flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-outline-secondary flex-grow-1"
                  >
                    <svg className="me-1" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                    {showFilters ? 'Nascondi' : 'Mostra'} Filtri
                  </button>
                  <button
                    onClick={resetFilters}
                    className="btn btn-link text-muted"
                  >
                    Resetta
                  </button>
                </div>
              </div>

              {/* Filtri avanzati */}
              {showFilters && (
                <div className="border-top pt-3">
                  <div className="row g-3">
                    {/* Categoria */}
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-muted">Categoria</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Tipo */}
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-muted">Tipo</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                      >
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Capacità min */}
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-muted">Capacità Min</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Es: 5"
                        value={minCapacity}
                        onChange={(e) => setMinCapacity(e.target.value)}
                        min="0"
                      />
                    </div>

                    {/* Capacità max */}
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-muted">Capacità Max</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Es: 50"
                        value={maxCapacity}
                        onChange={(e) => setMaxCapacity(e.target.value)}
                        min="0"
                      />
                    </div>

                    {/* Contributo min */}
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-muted">Contributo Min (€/h)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Es: 10"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Contributo max */}
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-muted">Contributo Max (€/h)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Es: 100"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Accessibilità */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted d-block mb-2">Accessibilità</label>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="wheelchairAccessible"
                          checked={wheelchairOnly}
                          onChange={(e) => setWheelchairOnly(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="wheelchairAccessible">
                          Solo risorse accessibili in sedia a rotelle
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contatore risultati */}
              <div className="border-top pt-3 mt-3">
                <p className="small text-muted mb-0">
                  Trovate <strong>{filteredResources.length}</strong> risorse su {resources.length} totali
                </p>
              </div>
            </div>
          </div>

          {/* Lista risorse */}
          {filteredResources.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <svg width="64" height="64" fill="currentColor" className="text-muted mb-3" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
                <p className="fs-5 text-muted">Nessuna risorsa trovata con i filtri selezionati</p>
                <button onClick={resetFilters} className="btn btn-outline-primary mt-3">
                  Resetta Filtri
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {filteredResources.map(resource => (
                <div key={resource.id} className="col-md-6 col-lg-4">
                  <div className="card h-100" style={{
                    border: 'none',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(43, 84, 142, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }}>
                    {/* Image Section - usa immagini se disponibili, altrimenti gradient */}
                    {resource.images && resource.images.length > 0 ? (
                      <div style={{ height: '220px', overflow: 'hidden' }}>
                        <img
                          src={resource.images[0]}
                          alt={resource.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          height: '220px',
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          color: '#2B548E'
                        }}
                      >
                      <svg width="80" height="80" fill="currentColor" viewBox="0 0 16 16">
                        {resource.type === 'ROOM' && (
                          <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                        )}
                        {resource.type === 'EQUIPMENT' && (
                          <>
                            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
                          </>
                        )}
                        {resource.type === 'SPACE' && (
                          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                        )}
                        {resource.type === 'SERVICE' && (
                          <>
                            <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V1Zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3V1Z"/>
                            <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z"/>
                          </>
                        )}
                      </svg>
                      {resource.wheelchairAccessible && (
                        <span
                          className="badge bg-white text-dark position-absolute top-0 end-0 m-2"
                          title="Accessibile in sedia a rotelle"
                        >
                          ♿
                        </span>
                      )}
                    </div>
                    )}

                    {/* Card Body - stile homepage */}
                    <div className="card-body d-flex flex-column" style={{ padding: '1.5rem' }}>
                      <h3 className="h5 fw-bold mb-3" style={{ color: '#2B548E' }}>
                        {resource.name}
                      </h3>

                      <p className="text-muted mb-3" style={{
                        minHeight: '60px',
                        fontSize: '0.95rem',
                        lineHeight: '1.6'
                      }}>
                        {resource.description?.substring(0, 120)}
                        {resource.description && resource.description.length > 120 ? '...' : ''}
                      </p>

                      {/* Info minime */}
                      <div className="mb-4">
                        {resource.capacity && (
                          <p className="small text-muted mb-2">
                            <strong>Capacità:</strong> {resource.capacity} persone
                          </p>
                        )}
                        {resource.location && (
                          <p className="small text-muted mb-0">
                            <strong>Ubicazione:</strong> {resource.location}
                          </p>
                        )}
                      </div>

                      {/* Bottone Prenota - stile homepage */}
                      <div className="mt-auto">
                        <Link
                          href={`/bookings/new?resourceId=${resource.id}`}
                          className="btn w-100 fw-semibold"
                          style={{
                            background: 'transparent',
                            border: '2px solid #2B548E',
                            color: '#2B548E',
                            borderRadius: '12px',
                            padding: '0.625rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#2B548E';
                          }}
                        >
                          Prenota →
                        </Link>
                        <div className="text-center mt-2">
                          <span className="small text-muted">
                            Contributo €{resource.pricePerHour}/ora
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
