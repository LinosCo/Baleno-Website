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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  fiscalCode: string | null;
  vatNumber: string | null;
  companyName: string | null;
}

export default function NewBookingWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<User | null>(null);

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
    isPrivate: false,
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
        setCurrentStep(5); // Vai allo step di conferma per rivedere i dati
        // Rimuovi i dati dal sessionStorage dopo averli caricati
        sessionStorage.removeItem('pendingBooking');
        console.log('[Booking] Dati prenotazione caricati da sessionStorage, pronto per conferma');
      } catch (err) {
        console.error('Error parsing saved booking data:', err);
      }
    }

    // Carica dati utente se autenticato
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(err => console.error('Error fetching user data:', err));
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

      // Crea AbortController per timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondi timeout

      const response = await fetch(API_ENDPOINTS.bookings, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Errore nella creazione della prenotazione');
      }

      // Pulisci sessionStorage
      sessionStorage.removeItem('pendingBooking');

      // Vai allo step di successo (6)
      setCurrentStep(6);
      setSuccess('Prenotazione inviata con successo!');
    } catch (err: any) {
      console.error('Booking creation error:', err);
      if (err.name === 'AbortError') {
        setError('La richiesta ha impiegato troppo tempo. Verifica la connessione e riprova.');
      } else {
        setError(err.message || 'Errore nella creazione della prenotazione');
      }
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
      console.log('[Booking] No token found, redirecting to register with redirect parameter');
      console.log('[Booking] Pending booking data saved to sessionStorage');
      // Vai direttamente alla registrazione (dalla pagina di registrazione c'è il link al login)
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
    <div className="min-vh-100" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%)'
    }}>
      {/* Clean Header */}
      <div className="container pt-4 pb-2">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="h3 fw-bold mb-0" style={{ color: '#2B548E' }}>Nuova Prenotazione</h1>
          <Link
            href="/dashboard"
            className="text-decoration-none fw-medium d-flex align-items-center gap-2"
            style={{ color: '#2B548E', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EDBB00'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2B548E'}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
            </svg>
            Torna alla Dashboard
          </Link>
        </div>
      </div>

      <div className="container py-4">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Progress Indicator */}
          {currentStep < 6 && (
            <div className="card border-0 shadow-sm mb-4" style={{
              borderRadius: '24px',
              border: '1px solid rgba(43, 84, 142, 0.1)'
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="d-flex align-items-center flex-fill">
                      <div className="d-flex flex-column align-items-center" style={{ minWidth: '80px' }}>
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center fw-bold`}
                          style={{
                            width: '48px',
                            height: '48px',
                            background: currentStep === step
                              ? 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)'
                              : currentStep > step
                              ? 'linear-gradient(135deg, #28a745 0%, #20883b 100%)'
                              : '#f8f9fa',
                            color: currentStep >= step ? 'white' : '#6c757d',
                            transition: 'all 0.3s ease',
                            boxShadow: currentStep === step ? '0 4px 12px rgba(43, 84, 142, 0.3)' : 'none'
                          }}
                        >
                          {currentStep > step ? (
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                            </svg>
                          ) : step}
                        </div>
                        <div className={`small mt-2 text-center ${currentStep === step ? 'fw-bold' : ''}`} style={{
                          color: currentStep === step ? '#2B548E' : '#6c757d'
                        }}>
                          {step === 1 && 'Risorsa'}
                          {step === 2 && 'Data/Ora'}
                          {step === 3 && 'Dettagli'}
                          {step === 4 && 'Ti serve altro?'}
                          {step === 5 && 'Conferma'}
                        </div>
                      </div>
                      {step < 5 && (
                        <div
                          className="flex-fill mx-2"
                          style={{
                            height: '4px',
                            background: currentStep > step
                              ? 'linear-gradient(90deg, #28a745 0%, #20883b 100%)'
                              : '#e9ecef',
                            borderRadius: '2px',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-danger bg-opacity-10 text-danger d-flex align-items-start" role="alert" style={{
              borderRadius: '16px',
              border: '1px solid rgba(220, 53, 69, 0.2)'
            }}>
              <svg className="me-2 mt-1 flex-shrink-0" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center mb-4" role="alert" style={{
              borderRadius: '16px'
            }}>
              <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
              {success}
            </div>
          )}

          {/* Step Content */}
          <div className="card border-0 shadow-sm" style={{
            borderRadius: '24px',
            border: '1px solid rgba(43, 84, 142, 0.1)'
          }}>
            <div className="card-body p-4 p-md-5">
              {/* STEP 1: Select Resource */}
              {currentStep === 1 && (
                <div>
                  <h2 className="h4 fw-bold mb-4" style={{ color: '#2B548E' }}>Seleziona Risorsa</h2>

                  {/* Search and Filters */}
                  <div className="mb-4">
                    <input
                      type="text"
                      className="form-control form-control-lg mb-3"
                      placeholder="Cerca risorsa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#2B548E';
                        e.currentTarget.style.boxShadow = '0 0 0 0.2rem rgba(43, 84, 142, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e9ecef';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    <div className="row g-2">
                      <div className="col-md-6">
                        <select
                          className="form-select"
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e9ecef',
                            transition: 'all 0.3s ease'
                          }}
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
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e9ecef',
                            transition: 'all 0.3s ease'
                          }}
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
                            className="card h-100"
                            onClick={() => setBookingData({ ...bookingData, resourceId: resource.id })}
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              borderRadius: '16px',
                              border: bookingData.resourceId === resource.id
                                ? '2px solid #2B548E'
                                : '2px solid #e9ecef',
                              background: bookingData.resourceId === resource.id
                                ? 'linear-gradient(135deg, rgba(43, 84, 142, 0.05) 0%, rgba(43, 84, 142, 0.02) 100%)'
                                : 'white',
                              boxShadow: bookingData.resourceId === resource.id
                                ? '0 4px 12px rgba(43, 84, 142, 0.15)'
                                : '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                            onMouseEnter={(e) => {
                              if (bookingData.resourceId !== resource.id) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = bookingData.resourceId === resource.id
                                ? '0 4px 12px rgba(43, 84, 142, 0.15)'
                                : '0 2px 8px rgba(0,0,0,0.08)';
                            }}
                          >
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <h5 className="card-title fw-bold mb-2" style={{ color: '#2B548E' }}>
                                    {resource.name}
                                    {bookingData.resourceId === resource.id && (
                                      <span className="ms-2 badge" style={{
                                        background: 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)',
                                        color: 'white'
                                      }}>Selezionata</span>
                                    )}
                                  </h5>
                                  <div className="mb-2">
                                    <span className="badge me-2" style={{
                                      background: '#6c757d',
                                      borderRadius: '8px'
                                    }}>{resource.category}</span>
                                    <span className="badge bg-light text-dark me-2" style={{ borderRadius: '8px' }}>{resource.type}</span>
                                    {resource.wheelchairAccessible && (
                                      <span className="badge bg-info" style={{ borderRadius: '8px' }}>
                                        <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM6.5 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm-.5 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1H7v1h.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V10H6.5a.5.5 0 0 1-.5-.5v-2Z"/>
                                        </svg>
                                        Accessibile
                                      </span>
                                    )}
                                  </div>
                                  <p className="card-text text-muted small mb-2">{resource.description}</p>
                                  <div className="small d-flex flex-wrap gap-2">
                                    <span className="text-muted">
                                      <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                      </svg>
                                      {resource.location || 'Non specificata'}
                                    </span>
                                    <span className="text-muted">•</span>
                                    <span className="text-muted">
                                      <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                        <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                                      </svg>
                                      {resource.capacity} persone
                                    </span>
                                    {resource.minBookingHours > 1 && (
                                      <>
                                        <span className="text-muted">•</span>
                                        <span className="text-muted">
                                          <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                                          </svg>
                                          Min. {resource.minBookingHours}h
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="text-end ms-3">
                                  <div className="h4 fw-bold mb-0" style={{ color: '#2B548E' }}>
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
                  <h2 className="h4 fw-bold mb-4" style={{ color: '#2B548E' }}>Seleziona Data e Ora</h2>

                  {selectedResource && (
                    <div className="card border-0 shadow-sm mb-4" style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '16px',
                      border: '1px solid rgba(43, 84, 142, 0.1)'
                    }}>
                      <div className="card-body p-4">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <h5 className="fw-bold mb-2" style={{ color: '#2B548E' }}>{selectedResource.name}</h5>
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
                            <div className="h3 fw-bold mb-1" style={{ color: '#2B548E' }}>
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
                  <div className="card border-0 shadow-sm mb-4" style={{
                    borderRadius: '16px',
                    border: '1px solid rgba(43, 84, 142, 0.1)'
                  }}>
                    <div className="card-header bg-white border-bottom" style={{ borderRadius: '16px 16px 0 0' }}>
                      <h6 className="mb-0 fw-semibold" style={{ color: '#2B548E' }}>
                        <svg width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                          <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                        Inizio Prenotazione
                      </h6>
                    </div>
                    <div className="card-body p-4">
                      <div className="row g-3">
                        <div className="col-md-7">
                          <label htmlFor="startDate" className="form-label fw-semibold" style={{ color: '#495057' }}>
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
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e9ecef'
                            }}
                          />
                        </div>
                        <div className="col-md-5">
                          <label htmlFor="startTimeInput" className="form-label fw-semibold" style={{ color: '#495057' }}>
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
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e9ecef'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fine Prenotazione */}
                  <div className="card border-0 shadow-sm mb-4" style={{
                    borderRadius: '16px',
                    border: '1px solid rgba(43, 84, 142, 0.1)'
                  }}>
                    <div className="card-header bg-white border-bottom" style={{ borderRadius: '16px 16px 0 0' }}>
                      <h6 className="mb-0 fw-semibold" style={{ color: '#2B548E' }}>
                        <svg width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                          <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                        Fine Prenotazione
                      </h6>
                    </div>
                    <div className="card-body p-4">
                      <div className="row g-3">
                        <div className="col-md-7">
                          <label htmlFor="endDate" className="form-label fw-semibold" style={{ color: '#495057' }}>
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
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e9ecef'
                            }}
                          />
                        </div>
                        <div className="col-md-5">
                          <label htmlFor="endTimeInput" className="form-label fw-semibold" style={{ color: '#495057' }}>
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
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e9ecef'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {bookingData.startTime && bookingData.endTime && (
                    <div className="card border-0 shadow-sm" style={{
                      backgroundColor: '#d1f2eb',
                      borderRadius: '16px',
                      border: '1px solid rgba(40, 167, 69, 0.2)'
                    }}>
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
                  <h2 className="h4 fw-bold mb-4" style={{ color: '#2B548E' }}>Dettagli Prenotazione</h2>

                  <div className="mb-4">
                    <label htmlFor="title" className="form-label fw-semibold" style={{ color: '#495057' }}>
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
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e9ecef'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="attendees" className="form-label fw-semibold" style={{ color: '#495057' }}>
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
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e9ecef'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="description" className="form-label fw-semibold" style={{ color: '#495057' }}>
                      Descrizione (opzionale)
                    </label>
                    <textarea
                      id="description"
                      value={bookingData.description}
                      onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                      rows={5}
                      placeholder="Aggiungi dettagli sulla prenotazione..."
                      className="form-control"
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e9ecef'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={bookingData.isPrivate}
                        onChange={(e) => setBookingData({ ...bookingData, isPrivate: e.target.checked })}
                        className="form-check-input"
                        style={{ width: '1.25rem', height: '1.25rem' }}
                      />
                      <label htmlFor="isPrivate" className="form-check-label ms-2">
                        <span className="fw-semibold">Evento privato</span>
                        <div className="small text-muted">
                          I tuoi dati non saranno visibili nel calendario pubblico. Gli altri utenti vedranno solo "Evento privato" senza dettagli.
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Ti serve altro? (Risorse aggiuntive) */}
              {currentStep === 4 && (
                <div>
                  <h2 className="h4 fw-bold mb-3" style={{ color: '#2B548E' }}>Ti serve altro?</h2>
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

              {/* STEP 6: Success */}
              {currentStep === 6 && (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <div className="display-1 mb-3" style={{ color: '#28a745' }}>
                      <svg width="120" height="120" fill="currentColor" viewBox="0 0 16 16" style={{ margin: '0 auto', display: 'block' }}>
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                      </svg>
                    </div>
                    <h2 className="fw-bold mb-3" style={{ color: '#2B548E' }}>Prenotazione Inviata con Successo!</h2>
                    <p className="lead text-muted">
                      La tua richiesta di prenotazione è stata inviata correttamente.
                    </p>
                  </div>

                  <div className="card shadow-sm mx-auto" style={{
                    maxWidth: '600px',
                    borderRadius: '20px',
                    border: '2px solid #2B548E'
                  }}>
                    <div className="card-body p-4">
                      <div className="alert alert-info mb-4">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Cosa succederà ora:</strong>
                      </div>
                      <ol className="text-start mb-4">
                        <li className="mb-3">
                          <strong>Riceverai un'email di conferma</strong> con i dettagli della tua richiesta
                        </li>
                        <li className="mb-3">
                          <strong>L'amministratore valuterà</strong> la tua richiesta di prenotazione
                        </li>
                        <li className="mb-3">
                          <strong>Riceverai un'email con il link</strong> per completare il pagamento quando la prenotazione sarà approvata
                        </li>
                        <li className="mb-0">
                          <strong>La prenotazione sarà confermata</strong> dopo il pagamento
                        </li>
                      </ol>

                      <div className="alert alert-warning mb-0">
                        <i className="bi bi-clock me-2"></i>
                        <small><strong>Tempo per il pagamento:</strong> Avrai 48 ore dal momento dell'approvazione per completare il pagamento</small>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="btn btn-lg px-5 fw-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(43, 84, 142, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <svg width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                      </svg>
                      Vai alla Dashboard
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <h2 className="h4 fw-bold mb-4" style={{ color: '#2B548E' }}>Riepilogo e Conferma</h2>

                  <div className="mb-4">
                    <h5 className="fw-bold mb-3" style={{ color: '#2B548E' }}>Risorsa</h5>
                    <div className="card border-0 bg-light" style={{ borderRadius: '16px' }}>
                      <div className="card-body p-4">
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
                    <h5 className="fw-bold mb-3" style={{ color: '#2B548E' }}>Data e Ora</h5>
                    <div className="card border-0 bg-light" style={{ borderRadius: '16px' }}>
                      <div className="card-body p-4">
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
                    <h5 className="fw-bold mb-3" style={{ color: '#2B548E' }}>Dettagli</h5>
                    <div className="card border-0 bg-light" style={{ borderRadius: '16px' }}>
                      <div className="card-body p-4">
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

                  {user && (
                    <div className="mb-4">
                      <h5 className="fw-bold mb-3" style={{ color: '#2B548E' }}>Dati Fatturazione</h5>
                      <div className="card border-0 bg-light" style={{ borderRadius: '16px' }}>
                        <div className="card-body p-4">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <div className="small text-muted">Nome Completo</div>
                              <div className="fw-semibold">{user.firstName} {user.lastName}</div>
                            </div>
                            <div className="col-md-6">
                              <div className="small text-muted">Email</div>
                              <div className="fw-semibold">{user.email}</div>
                            </div>
                            {user.phone && (
                              <div className="col-md-6">
                                <div className="small text-muted">Telefono</div>
                                <div className="fw-semibold">{user.phone}</div>
                              </div>
                            )}
                            {user.companyName && (
                              <div className="col-md-6">
                                <div className="small text-muted">Azienda</div>
                                <div className="fw-semibold">{user.companyName}</div>
                              </div>
                            )}
                            {user.vatNumber && (
                              <div className="col-md-6">
                                <div className="small text-muted">Partita IVA</div>
                                <div className="fw-semibold">{user.vatNumber}</div>
                              </div>
                            )}
                            {user.fiscalCode && (
                              <div className="col-md-6">
                                <div className="small text-muted">Codice Fiscale</div>
                                <div className="fw-semibold">{user.fiscalCode}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="card bg-light" style={{
                    borderRadius: '16px',
                    border: '2px solid #2B548E'
                  }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="small text-muted">Prezzo Totale</div>
                          <div className="text-muted small">
                            {((new Date(bookingData.endTime).getTime() - new Date(bookingData.startTime).getTime()) / (1000 * 60 * 60)).toFixed(1)} ore × €{parseFloat(selectedResource?.pricePerHour.toString() || '0').toFixed(2)}/ora
                          </div>
                        </div>
                        <div className="display-5 fw-bold" style={{ color: '#2B548E' }}>
                          €{calculatePrice().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep !== 6 && (
                <div className="d-flex gap-3 mt-5">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="btn btn-lg"
                      disabled={submitting}
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #6c757d',
                        color: '#6c757d',
                        background: 'white',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#6c757d';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#6c757d';
                      }}
                    >
                      ← Indietro
                    </button>
                  )}

                  {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceedToStep(currentStep + 1)}
                    className="btn btn-lg flex-fill fw-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(43, 84, 142, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Avanti →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !canProceedToStep(5)}
                    className="btn btn-lg flex-fill fw-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #28a745 0%, #20883b 100%)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(40, 167, 69, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Invio richiesta in corso...
                      </>
                    ) : (
                      'Invia Richiesta di Prenotazione'
                    )}
                  </button>
                )}

                <Link
                  href="/"
                  className="btn btn-lg"
                  style={{
                    borderRadius: '12px',
                    border: '2px solid #e9ecef',
                    color: '#6c757d',
                    background: 'white',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e9ecef';
                  }}
                >
                  Annulla
                </Link>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
