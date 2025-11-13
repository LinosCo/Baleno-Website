'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  location: string;
  wheelchairAccessible: boolean;
  amenities: string[];
  features: string[];
  tags: string[];
}

export default function NewBookingWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search and filters for Step 1
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // Booking data
  const [bookingData, setBookingData] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    title: '',
    description: '',
    attendees: '',
  });

  // Additional resources (Step 5)
  const [additionalResources, setAdditionalResources] = useState<Resource[]>([]);
  const [selectedAdditionalResources, setSelectedAdditionalResources] = useState<Array<{resourceId: string, quantity: number}>>([]);

  useEffect(() => {
    // Carica dati salvati se torniamo dal login
    const savedData = sessionStorage.getItem('pendingBooking');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBookingData(parsed);
        setCurrentStep(5); // Vai direttamente alla conferma
        sessionStorage.removeItem('pendingBooking');

        // Auto-submit dopo il caricamento dei dati se l'utente è loggato
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Aspetta che React aggiorni lo stato, poi esegui il submit
          setTimeout(() => {
            handleSubmitWithData(parsed, token);
          }, 100);
        }
      } catch (err) {
        console.error('Error parsing saved booking data:', err);
      }
    }

    // Endpoint pubblico - nessuna autenticazione richiesta per visualizzare risorse
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(`${apiUrl}/resources?isActive=true`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const dataArray = Array.isArray(data) ? data : [];
        const activeResources = dataArray.filter((r: Resource) =>
          r.isActive === true && !r.maintenanceMode
        );

        // Separa risorse principali (ROOM, SPACE) da attrezzature (EQUIPMENT)
        const mainResources = activeResources.filter(r => r.type !== 'EQUIPMENT');
        const equipmentResources = activeResources.filter(r => r.type === 'EQUIPMENT');

        setResources(mainResources);
        setAdditionalResources(equipmentResources);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching resources:', err);
        setError('Errore nel caricamento delle risorse');
        setResources([]);
        setAdditionalResources([]);
        setLoading(false);
      });
  }, []);

  const selectedResource = resources.find(r => r.id === bookingData.resourceId);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchTerm ||
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || resource.category === filterCategory;
    const matchesType = filterType === 'ALL' || resource.type === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const calculatePrice = () => {
    if (!selectedResource || !bookingData.startTime || !bookingData.endTime) {
      return 0;
    }
    const start = new Date(bookingData.startTime);
    const end = new Date(bookingData.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Prezzo base della risorsa principale
    let totalPrice = hours * parseFloat(selectedResource.pricePerHour.toString());

    // Aggiungi prezzi risorse aggiuntive
    selectedAdditionalResources.forEach(selected => {
      const resource = additionalResources.find(r => r.id === selected.resourceId);
      if (resource) {
        totalPrice += hours * parseFloat(resource.pricePerHour.toString()) * selected.quantity;
      }
    });

    return totalPrice;
  };

  // Funzione separata per il submit con dati specifici (usata anche per auto-submit)
  const handleSubmitWithData = async (data: typeof bookingData, token: string) => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        attendees: data.attendees ? parseInt(data.attendees) : undefined,
        additionalResources: selectedAdditionalResources.length > 0 ? selectedAdditionalResources : undefined,
      };

      console.log('Creating booking with payload:', payload);

      const response = await fetch(API_ENDPOINTS.bookings, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Errore nella creazione della prenotazione');
      }

      setSuccess('Prenotazione creata con successo! Reindirizzamento al pagamento...');
      setTimeout(() => {
        router.push(`/bookings/${responseData.id}/payment`);
      }, 1500);
    } catch (err: any) {
      console.error('Booking creation error:', err);
      setError(err.message || 'Errore nella creazione della prenotazione');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Controlla se l'utente è autenticato
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Salva i dati della prenotazione in sessionStorage
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      // Redirect alla registrazione con parametro di ritorno
      router.push('/register?redirect=/bookings/new');
      return;
    }

    // Usa la funzione separata per il submit
    await handleSubmitWithData(bookingData, token);
  };

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2:
        return !!bookingData.resourceId;
      case 3:
        return !!bookingData.resourceId && !!bookingData.startTime && !!bookingData.endTime;
      case 4:
        return !!bookingData.resourceId && !!bookingData.startTime && !!bookingData.endTime && !!bookingData.title;
      case 5:
        // Step 4 (risorse aggiuntive) è opzionale, basta aver completato step 3
        return !!bookingData.resourceId && !!bookingData.startTime && !!bookingData.endTime && !!bookingData.title;
      default:
        return true;
    }
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
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar bg-white shadow-sm py-3">
        <div className="container">
          <h1 className="h4 mb-0 text-baleno-primary fw-bold">Nuova Prenotazione</h1>
          <div className="d-flex gap-3 align-items-center">
            <Link href="/resources" className="btn btn-outline-primary">
              Risorse
            </Link>
            <Link href="/calendar" className="btn btn-outline-primary">
              Calendario
            </Link>
            <Link href="/" className="text-decoration-none fw-medium d-flex align-items-center gap-1" style={{ color: 'var(--baleno-primary)' }}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
              </svg>
              Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Progress Indicator */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="d-flex align-items-center flex-fill">
                    <div className="d-flex flex-column align-items-center" style={{ minWidth: '80px' }}>
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                          currentStep === step
                            ? 'bg-primary text-white'
                            : currentStep > step
                            ? 'bg-success text-white'
                            : 'bg-light text-muted'
                        }`}
                        style={{ width: '40px', height: '40px' }}
                      >
                        {currentStep > step ? '✓' : step}
                      </div>
                      <div className={`small mt-2 text-center ${currentStep === step ? 'fw-bold text-primary' : 'text-muted'}`}>
                        {step === 1 && 'Risorsa'}
                        {step === 2 && 'Data/Ora'}
                        {step === 3 && 'Dettagli'}
                        {step === 4 && 'Ti serve altro?'}
                        {step === 5 && 'Conferma'}
                      </div>
                    </div>
                    {step < 5 && (
                      <div
                        className={`flex-fill mx-2 ${
                          currentStep > step ? 'bg-success' : 'bg-light'
                        }`}
                        style={{ height: '3px' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="alert alert-danger mb-4 border-0" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
              <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
              {success}
            </div>
          )}

          {/* Step Content */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              {/* STEP 1: Select Resource */}
              {currentStep === 1 && (
                <div>
                  <h2 className="h4 fw-bold text-baleno-primary mb-4">Seleziona Risorsa</h2>

                  {/* Search and Filters */}
                  <div className="mb-4">
                    <input
                      type="text"
                      className="form-control form-control-lg mb-3"
                      placeholder="Cerca risorsa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="row g-2">
                      <div className="col-md-6">
                        <select
                          className="form-select"
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                        >
                          <option value="ALL">Tutte le categorie</option>
                          <option value="MEETING_ROOM">Sale Riunioni</option>
                          <option value="COWORKING">Coworking</option>
                          <option value="EVENT_SPACE">Spazi Eventi</option>
                          <option value="EQUIPMENT">Attrezzature</option>
                          <option value="SERVICE">Servizi</option>
                          <option value="OTHER">Altro</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <select
                          className="form-select"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="ALL">Tutti i tipi</option>
                          <option value="ROOM">Stanza</option>
                          <option value="DESK">Scrivania</option>
                          <option value="EQUIPMENT">Attrezzatura</option>
                          <option value="PARKING">Parcheggio</option>
                          <option value="OTHER">Altro</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Resources Grid */}
                  <div className="row g-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {filteredResources.length === 0 ? (
                      <div className="col-12 text-center text-muted py-5">
                        Nessuna risorsa trovata
                      </div>
                    ) : (
                      filteredResources.map(resource => (
                        <div key={resource.id} className="col-12">
                          <div
                            className={`card h-100 cursor-pointer ${
                              bookingData.resourceId === resource.id
                                ? 'border-primary border-2'
                                : 'border'
                            }`}
                            onClick={() => setBookingData({ ...bookingData, resourceId: resource.id })}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <h5 className="card-title fw-bold mb-2">
                                    {resource.name}
                                    {bookingData.resourceId === resource.id && (
                                      <span className="ms-2 badge bg-primary">Selezionata</span>
                                    )}
                                  </h5>
                                  <div className="mb-2">
                                    <span className="badge bg-secondary me-2">{resource.category}</span>
                                    <span className="badge bg-light text-dark me-2">{resource.type}</span>
                                    {resource.wheelchairAccessible && (
                                      <span className="badge bg-info">♿ Accessibile</span>
                                    )}
                                  </div>
                                  <p className="card-text text-muted small mb-2">{resource.description}</p>
                                  <div className="small">
                                    <span className="text-muted">📍 {resource.location || 'Non specificata'}</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-muted">👥 {resource.capacity} persone</span>
                                    {resource.minBookingHours > 1 && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <span className="text-muted">⏱️ Min. {resource.minBookingHours}h</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="text-end ms-3">
                                  <div className="h4 fw-bold text-primary mb-0">
                                    €{parseFloat(resource.pricePerHour.toString()).toFixed(2)}
                                  </div>
                                  <div className="small text-muted">per ora</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Select Date/Time */}
              {currentStep === 2 && (
                <div>
                  <h2 className="h4 fw-bold text-baleno-primary mb-4">Seleziona Data e Ora</h2>

                  {selectedResource && (
                    <div className="card border-0 shadow-sm mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <h5 className="fw-bold text-baleno-primary mb-2">{selectedResource.name}</h5>
                            <p className="text-muted mb-2 small" style={{ lineHeight: '1.6' }}>
                              {selectedResource.description?.substring(0, 150)}
                              {selectedResource.description && selectedResource.description.length > 150 ? '...' : ''}
                            </p>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {selectedResource.capacity && (
                                <span className="badge bg-secondary">
                                  <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                    <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                                  </svg>
                                  {selectedResource.capacity} persone
                                </span>
                              )}
                              {selectedResource.location && (
                                <span className="badge bg-light text-dark border">
                                  <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                  </svg>
                                  {selectedResource.location}
                                </span>
                              )}
                              {selectedResource.wheelchairAccessible && (
                                <span className="badge bg-info">♿ Accessibile</span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-4 text-md-end">
                            <div className="h3 fw-bold text-primary mb-1">
                              €{parseFloat(selectedResource.pricePerHour.toString()).toFixed(2)}
                            </div>
                            <p className="small text-muted mb-0">per ora</p>
                            {selectedResource.minBookingHours > 1 && (
                              <p className="small text-muted mb-0">
                                Min. {selectedResource.minBookingHours} ore
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inizio Prenotazione */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-bottom">
                      <h6 className="mb-0 fw-semibold text-baleno-primary">
                        <svg width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                          <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                        Inizio Prenotazione
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-7">
                          <label htmlFor="startDate" className="form-label fw-semibold">
                            Data *
                          </label>
                          <input
                            id="startDate"
                            type="date"
                            value={bookingData.startTime?.split('T')[0] || ''}
                            onChange={(e) => {
                              const date = e.target.value;
                              const today = new Date().toISOString().split('T')[0];

                              // Se seleziono oggi, imposta l'ora corrente
                              const time = date === today
                                ? new Date().toTimeString().slice(0, 5)
                                : bookingData.startTime?.split('T')[1] || '09:00';

                              setBookingData({ ...bookingData, startTime: `${date}T${time}` });
                            }}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="form-control form-control-lg"
                          />
                        </div>
                        <div className="col-md-5">
                          <label htmlFor="startTimeInput" className="form-label fw-semibold">
                            Ora *
                          </label>
                          <input
                            id="startTimeInput"
                            type="time"
                            value={bookingData.startTime?.split('T')[1]?.slice(0, 5) || ''}
                            onChange={(e) => {
                              const date = bookingData.startTime?.split('T')[0] || new Date().toISOString().split('T')[0];
                              const time = e.target.value;
                              setBookingData({ ...bookingData, startTime: `${date}T${time}` });
                            }}
                            required
                            min={
                              bookingData.startTime?.split('T')[0] === new Date().toISOString().split('T')[0]
                                ? new Date().toTimeString().slice(0, 5)
                                : undefined
                            }
                            className="form-control form-control-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fine Prenotazione */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-bottom">
                      <h6 className="mb-0 fw-semibold text-baleno-primary">
                        <svg width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                          <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                        Fine Prenotazione
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-7">
                          <label htmlFor="endDate" className="form-label fw-semibold">
                            Data *
                          </label>
                          <input
                            id="endDate"
                            type="date"
                            value={bookingData.endTime?.split('T')[0] || ''}
                            onChange={(e) => {
                              const date = e.target.value;
                              const time = bookingData.endTime?.split('T')[1] || '18:00';
                              setBookingData({ ...bookingData, endTime: `${date}T${time}` });
                            }}
                            required
                            min={bookingData.startTime?.split('T')[0] || new Date().toISOString().split('T')[0]}
                            className="form-control form-control-lg"
                          />
                        </div>
                        <div className="col-md-5">
                          <label htmlFor="endTimeInput" className="form-label fw-semibold">
                            Ora *
                          </label>
                          <input
                            id="endTimeInput"
                            type="time"
                            value={bookingData.endTime?.split('T')[1]?.slice(0, 5) || ''}
                            onChange={(e) => {
                              const date = bookingData.endTime?.split('T')[0] || bookingData.startTime?.split('T')[0] || new Date().toISOString().split('T')[0];
                              const time = e.target.value;
                              setBookingData({ ...bookingData, endTime: `${date}T${time}` });
                            }}
                            required
                            min={(() => {
                              const endDate = bookingData.endTime?.split('T')[0];
                              const startDate = bookingData.startTime?.split('T')[0];
                              const startTime = bookingData.startTime?.split('T')[1];
                              const today = new Date().toISOString().split('T')[0];
                              const currentTime = new Date().toTimeString().slice(0, 5);

                              // Se data fine = data inizio, ora deve essere > ora inizio
                              if (endDate === startDate && startTime) {
                                return startTime.slice(0, 5);
                              }
                              // Se data fine = oggi, ora deve essere >= ora corrente
                              if (endDate === today) {
                                return currentTime;
                              }
                              return undefined;
                            })()}
                            className="form-control form-control-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {bookingData.startTime && bookingData.endTime && (
                    <div className="card border-0 shadow-sm" style={{ backgroundColor: '#d1f2eb' }}>
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-6">
                            <div className="d-flex align-items-center mb-2">
                              <svg width="20" height="20" fill="currentColor" className="text-success me-2" viewBox="0 0 16 16">
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                              </svg>
                              <div>
                                <div className="fw-semibold text-success">Durata</div>
                                <div className="h5 mb-0 fw-bold">
                                  {((new Date(bookingData.endTime).getTime() - new Date(bookingData.startTime).getTime()) / (1000 * 60 * 60)).toFixed(1)} ore
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 text-md-end">
                            <div className="text-muted small mb-1">Prezzo totale</div>
                            <div className="display-6 fw-bold text-success">
                              €{calculatePrice().toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Enter Details */}
              {currentStep === 3 && (
                <div>
                  <h2 className="h4 fw-bold text-baleno-primary mb-4">Dettagli Prenotazione</h2>

                  <div className="mb-4">
                    <label htmlFor="title" className="form-label fw-semibold">
                      Titolo Prenotazione *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={bookingData.title}
                      onChange={(e) => setBookingData({ ...bookingData, title: e.target.value })}
                      required
                      placeholder="Es: Riunione team di progetto"
                      className="form-control form-control-lg"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="attendees" className="form-label fw-semibold">
                      Numero Partecipanti (opzionale)
                    </label>
                    <input
                      id="attendees"
                      type="number"
                      value={bookingData.attendees}
                      onChange={(e) => setBookingData({ ...bookingData, attendees: e.target.value })}
                      min="1"
                      max={selectedResource?.capacity || 100}
                      placeholder={`Max ${selectedResource?.capacity || 0} persone`}
                      className="form-control form-control-lg"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="description" className="form-label fw-semibold">
                      Descrizione (opzionale)
                    </label>
                    <textarea
                      id="description"
                      value={bookingData.description}
                      onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                      rows={5}
                      placeholder="Aggiungi dettagli sulla prenotazione..."
                      className="form-control"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Ti serve altro? (Risorse aggiuntive) */}
              {currentStep === 4 && (
                <div>
                  <h2 className="h4 fw-bold text-baleno-primary mb-3">Ti serve altro?</h2>
                  <p className="text-muted mb-4">
                    Aggiungi attrezzature o servizi aggiuntivi alla tua prenotazione (opzionale)
                  </p>

                  {additionalResources.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Nessuna risorsa aggiuntiva disponibile al momento.
                    </div>
                  ) : (
                    <div className="row g-3">
                      {additionalResources.map(resource => {
                        const isSelected = selectedAdditionalResources.some(r => r.resourceId === resource.id);
                        const selectedItem = selectedAdditionalResources.find(r => r.resourceId === resource.id);

                        return (
                          <div key={resource.id} className="col-12 col-md-6">
                            <div
                              className={`card h-100 ${isSelected ? 'border-primary border-2' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedAdditionalResources(
                                    selectedAdditionalResources.filter(r => r.resourceId !== resource.id)
                                  );
                                } else {
                                  setSelectedAdditionalResources([
                                    ...selectedAdditionalResources,
                                    { resourceId: resource.id, quantity: 1 }
                                  ]);
                                }
                              }}
                            >
                              <div className="card-body">
                                <div className="d-flex align-items-start mb-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    readOnly
                                    className="form-check-input mt-1 me-2"
                                    style={{
                                      cursor: 'pointer',
                                      width: '1.25rem',
                                      height: '1.25rem',
                                      borderRadius: '0.25rem',
                                      flexShrink: 0
                                    }}
                                  />
                                  <div className="flex-grow-1">
                                    <h5 className="card-title mb-1">{resource.name}</h5>
                                    {resource.description && (
                                      <p className="card-text text-muted small mb-2">{resource.description}</p>
                                    )}
                                    <div className="text-primary fw-semibold">
                                      €{parseFloat(resource.pricePerHour.toString()).toFixed(2)} per ora
                                    </div>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="mt-3 pt-3 border-top" onClick={(e) => e.stopPropagation()}>
                                    <label className="form-label small fw-semibold mb-2">Quantità</label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={selectedItem?.quantity || 1}
                                      onChange={(e) => {
                                        const newQuantity = parseInt(e.target.value) || 1;
                                        setSelectedAdditionalResources(
                                          selectedAdditionalResources.map(r =>
                                            r.resourceId === resource.id
                                              ? { ...r, quantity: newQuantity }
                                              : r
                                          )
                                        );
                                      }}
                                      className="form-control form-control-sm"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedAdditionalResources.length > 0 && (
                    <div className="card border-success mt-4">
                      <div className="card-body">
                        <h6 className="fw-bold text-success mb-2">Riepilogo risorse aggiuntive:</h6>
                        <ul className="mb-0">
                          {selectedAdditionalResources.map(selected => {
                            const resource = additionalResources.find(r => r.id === selected.resourceId);
                            if (!resource) return null;
                            return (
                              <li key={selected.resourceId}>
                                {resource.name} × {selected.quantity}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Review & Confirm */}
              {currentStep === 5 && (
                <div>
                  <h2 className="h4 fw-bold text-baleno-primary mb-4">Riepilogo e Conferma</h2>

                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Risorsa</h5>
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">{selectedResource?.name}</h6>
                        <p className="small text-muted mb-2">{selectedResource?.description}</p>
                        <div className="small">
                          <span className="badge bg-secondary me-2">{selectedResource?.category}</span>
                          <span className="badge bg-light text-dark">{selectedResource?.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Data e Ora</h5>
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6 mb-2">
                            <div className="small text-muted">Inizio</div>
                            <div className="fw-semibold">
                              {new Date(bookingData.startTime).toLocaleString('it-IT', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <div className="col-md-6 mb-2">
                            <div className="small text-muted">Fine</div>
                            <div className="fw-semibold">
                              {new Date(bookingData.endTime).toLocaleString('it-IT', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Dettagli</h5>
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <div className="mb-2">
                          <span className="small text-muted">Titolo:</span>{' '}
                          <span className="fw-semibold">{bookingData.title}</span>
                        </div>
                        {bookingData.attendees && (
                          <div className="mb-2">
                            <span className="small text-muted">Partecipanti:</span>{' '}
                            <span className="fw-semibold">{bookingData.attendees} persone</span>
                          </div>
                        )}
                        {bookingData.description && (
                          <div>
                            <div className="small text-muted">Descrizione:</div>
                            <div className="small">{bookingData.description}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card border-primary border-2 bg-light">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="small text-muted">Prezzo Totale</div>
                          <div className="text-muted small">
                            {((new Date(bookingData.endTime).getTime() - new Date(bookingData.startTime).getTime()) / (1000 * 60 * 60)).toFixed(1)} ore × €{parseFloat(selectedResource?.pricePerHour.toString() || '0').toFixed(2)}/ora
                          </div>
                        </div>
                        <div className="display-5 fw-bold text-primary">
                          €{calculatePrice().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="d-flex gap-3 mt-5">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="btn btn-outline-secondary btn-lg"
                    disabled={submitting}
                  >
                    ← Indietro
                  </button>
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceedToStep(currentStep + 1)}
                    className="btn btn-primary btn-lg flex-fill fw-semibold"
                  >
                    Avanti →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !canProceedToStep(5)}
                    className="btn btn-success btn-lg flex-fill fw-semibold"
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creazione in corso...
                      </>
                    ) : (
                      '✓ Conferma Prenotazione'
                    )}
                  </button>
                )}

                <Link
                  href="/"
                  className="btn btn-light btn-lg"
                >
                  Annulla
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
