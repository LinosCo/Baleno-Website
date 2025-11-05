'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { API_ENDPOINTS } from '../../../config/api';

interface Booking {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
  };
  resource: {
    name: string;
    type: string;
  };
}

type ViewMode = 'day' | 'week' | 'month';

interface Resource {
  id: string;
  name: string;
}

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [filterResource, setFilterResource] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    fetch(API_ENDPOINTS.bookings, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const bookingsArray = Array.isArray(data) ? data : [];
        setBookings(bookingsArray);
        setFilteredBookings(bookingsArray);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setBookings([]);
        setFilteredBookings([]);
      });

    fetch(API_ENDPOINTS.resources, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const resourcesArray = Array.isArray(data) ? data : [];
        setResources(resourcesArray);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching resources:', err);
        setResources([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = [...bookings];
    if (filterResource) {
      filtered = filtered.filter(b => {
        if (!b?.resource) return false;
        const resource = b.resource as any;
        return resource && 'id' in resource && resource.id === filterResource;
      });
    }
    if (filterStatus) {
      filtered = filtered.filter(b => b?.status === filterStatus);
    }
    setFilteredBookings(filtered);
  }, [filterResource, filterStatus, bookings]);

  const getWeekDays = (date: Date) => {
    const dateCopy = new Date(date);
    const day = dateCopy.getDay();
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dateCopy);
    monday.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter(booking => {
      if (!booking?.startTime) return false;
      try {
        const bookingDate = new Date(booking.startTime);
        return (
          bookingDate.getDate() === date.getDate() &&
          bookingDate.getMonth() === date.getMonth() &&
          bookingDate.getFullYear() === date.getFullYear()
        );
      } catch {
        return false;
      }
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfWeek = firstDay.getDay();
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const changeDate = (delta: number) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + delta);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (delta * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + delta);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const timeSlots: number[] = [];
  for (let i = 7; i <= 21; i++) {
    timeSlots.push(i);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return { bg: '#34a853', text: '#fff' };
      case 'PENDING': return { bg: '#fbbc04', text: '#000' };
      case 'REJECTED': return { bg: '#ea4335', text: '#fff' };
      case 'CANCELLED': return { bg: '#9aa0a6', text: '#fff' };
      default: return { bg: '#5f6368', text: '#fff' };
    }
  };

  const weekDays = getWeekDays(new Date(selectedDate));
  const monthDays = getDaysInMonth(selectedDate);
  const monthName = selectedDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  const weekRange = firstDay && lastDay
    ? `${firstDay.getDate()} ${firstDay.toLocaleDateString('it-IT', { month: 'short' })} - ${lastDay.getDate()} ${lastDay.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}`
    : '';
  const dayString = selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const getDateTitle = () => {
    if (viewMode === 'day') return dayString;
    if (viewMode === 'week') return weekRange;
    return monthName;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <p className="text-muted">Caricamento calendario...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="mb-3">
          <h1 className="h3 fw-bold text-baleno-primary mb-1">Calendario</h1>
          <p className="text-muted mb-0">Visualizza tutte le prenotazioni</p>
        </div>

        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2">
            <div className="row g-2 align-items-center">
              <div className="col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={filterResource}
                  onChange={(e) => setFilterResource(e.target.value)}
                >
                  <option value="">Tutte le risorse</option>
                  {resources.map(resource => (
                    <option key={resource.id} value={resource.id}>{resource.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tutti gli stati</option>
                  <option value="PENDING">In Attesa</option>
                  <option value="APPROVED">Approvate</option>
                  <option value="REJECTED">Rifiutate</option>
                  <option value="CANCELLED">Cancellate</option>
                </select>
              </div>

              <div className="col-md-3 text-end">
                <span className="badge bg-light text-dark">
                  {filteredBookings.length} prenotazioni
                </span>
                {(filterResource || filterStatus) && (
                  <button
                    onClick={() => {
                      setFilterResource('');
                      setFilterStatus('');
                    }}
                    className="btn btn-link btn-sm text-muted p-0 ms-2"
                  >
                    Reset filtri
                  </button>
                )}
              </div>

              <div className="col-md-3">
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    onClick={goToToday}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Oggi
                  </button>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn btn-sm ${viewMode === 'day' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setViewMode('day')}
                    >
                      Giorno
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${viewMode === 'week' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setViewMode('week')}
                    >
                      Settimana
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${viewMode === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setViewMode('month')}
                    >
                      Mese
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <button
                onClick={() => changeDate(-1)}
                className="btn btn-sm btn-outline-secondary"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                </svg>
              </button>
              <h2 className="h5 mb-0 fw-bold text-capitalize">
                {getDateTitle()}
              </h2>
              <button
                onClick={() => changeDate(1)}
                className="btn btn-sm btn-outline-secondary"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>

            {/* Day View */}
            {viewMode === 'day' && (
              <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                <table className="table table-bordered mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }} className="text-center bg-light">Ora</th>
                      <th className="text-center">
                        {selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((hour) => {
                      const dayBookings = getBookingsForDate(selectedDate).filter(booking => {
                        const bookingStart = new Date(booking.startTime);
                        return bookingStart.getHours() === hour;
                      });

                      return (
                        <tr key={hour} style={{ height: '80px' }}>
                          <td className="text-center small text-muted bg-light align-top pt-2">
                            {hour}:00
                          </td>
                          <td className="p-2">
                            {dayBookings.map(booking => {
                              const colors = getStatusColor(booking.status);
                              const startTime = new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                              const endTime = new Date(booking.endTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

                              return (
                                <div
                                  key={booking.id}
                                  className="rounded shadow-sm mb-2 p-2"
                                  style={{
                                    backgroundColor: colors.bg,
                                    color: colors.text,
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <div className="fw-semibold">{booking.title}</div>
                                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                    {startTime} - {endTime}
                                  </div>
                                  <div className="text-truncate" style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                                    {booking.resource.name}
                                  </div>
                                </div>
                              );
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
              <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                <table className="table table-bordered mb-0" style={{ minWidth: '900px' }}>
                  <thead className="sticky-top bg-white" style={{ zIndex: 10 }}>
                    <tr>
                      <th style={{ width: '80px' }} className="text-center bg-light">Ora</th>
                      {weekDays.map((day, idx) => {
                        const isToday =
                          day.getDate() === new Date().getDate() &&
                          day.getMonth() === new Date().getMonth() &&
                          day.getFullYear() === new Date().getFullYear();
                        return (
                          <th key={idx} className={`text-center ${isToday ? 'bg-primary bg-opacity-10' : ''}`}>
                            <div className="small text-muted">
                              {day.toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase()}
                            </div>
                            <div className={`fw-bold ${isToday ? 'text-primary' : ''}`}>
                              {day.getDate()}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((hour) => (
                      <tr key={hour} style={{ height: '70px' }}>
                        <td className="text-center small text-muted bg-light align-top pt-1">
                          {hour}:00
                        </td>
                        {weekDays.map((day, dayIdx) => {
                          const dayBookings = getBookingsForDate(day).filter(booking => {
                            const bookingStart = new Date(booking.startTime);
                            return bookingStart.getHours() === hour;
                          });

                          return (
                            <td key={dayIdx} className="p-1" style={{ verticalAlign: 'top' }}>
                              {dayBookings.map(booking => {
                                const colors = getStatusColor(booking.status);
                                const startTime = new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

                                return (
                                  <div
                                    key={booking.id}
                                    className="rounded shadow-sm mb-1 p-2"
                                    style={{
                                      backgroundColor: colors.bg,
                                      color: colors.text,
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                    title={`${booking.title}\n${booking.resource.name}\n${startTime}`}
                                  >
                                    <div className="fw-semibold text-truncate">{booking.title}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                                      {startTime}
                                    </div>
                                  </div>
                                );
                              })}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Month View - Griglia classica con CELLE GRANDI */}
            {viewMode === 'month' && (
              <div>
                {/* Header giorni settimana */}
                <div className="row g-0 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                  {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day, idx) => (
                    <div
                      key={day}
                      className="col text-center py-2 border-end"
                      style={{ fontSize: '0.85rem', fontWeight: '600', color: '#6c757d' }}
                    >
                      {day.toUpperCase()}
                    </div>
                  ))}
                </div>

                {/* Griglia giorni - CELLE GRANDI */}
                <div className="row g-0">
                  {monthDays.map((day, index) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="col border"
                          style={{ minHeight: '160px', backgroundColor: '#fafafa' }}
                        />
                      );
                    }

                    const dayBookings = getBookingsForDate(day);
                    const isToday =
                      day.getDate() === new Date().getDate() &&
                      day.getMonth() === new Date().getMonth() &&
                      day.getFullYear() === new Date().getFullYear();

                    return (
                      <div
                        key={index}
                        className="col border"
                        style={{ minHeight: '160px', backgroundColor: 'white', cursor: 'pointer' }}
                      >
                        <div className="p-2">
                          {/* Numero giorno */}
                          <div
                            className={`d-inline-flex align-items-center justify-content-center mb-2 ${isToday ? 'bg-primary text-white rounded-circle' : ''}`}
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: isToday ? '600' : '500',
                              color: isToday ? '#fff' : '#6c757d',
                              width: isToday ? '28px' : 'auto',
                              height: isToday ? '28px' : 'auto'
                            }}
                          >
                            {day.getDate()}
                          </div>

                          {/* Eventi */}
                          <div className="d-flex flex-column" style={{ gap: '4px' }}>
                            {dayBookings.slice(0, 5).map(booking => {
                              const startTime = new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                              const colors = getStatusColor(booking.status);

                              return (
                                <div
                                  key={booking.id}
                                  className="rounded text-truncate"
                                  title={`${booking.title}\n${booking.resource.name}\n${startTime}`}
                                  style={{
                                    fontSize: '0.8rem',
                                    padding: '4px 8px',
                                    backgroundColor: colors.bg,
                                    color: colors.text,
                                    fontWeight: '500'
                                  }}
                                >
                                  <span style={{ opacity: 0.9 }}>{startTime}</span> {booking.title}
                                </div>
                              );
                            })}
                            {dayBookings.length > 5 && (
                              <div style={{ fontSize: '0.75rem', color: '#6c757d', paddingLeft: '8px', fontWeight: '500' }}>
                                +{dayBookings.length - 5} altri
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card border-0 shadow-sm mt-3">
          <div className="card-body py-2">
            <div className="d-flex gap-3 flex-wrap align-items-center">
              <span className="small fw-semibold text-muted">Legenda:</span>
              <div className="d-flex align-items-center gap-1">
                <div className="rounded" style={{ width: '12px', height: '12px', backgroundColor: '#34a853' }}></div>
                <span className="small">Approvate</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div className="rounded" style={{ width: '12px', height: '12px', backgroundColor: '#fbbc04' }}></div>
                <span className="small">In Attesa</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div className="rounded" style={{ width: '12px', height: '12px', backgroundColor: '#ea4335' }}></div>
                <span className="small">Rifiutate</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div className="rounded" style={{ width: '12px', height: '12px', backgroundColor: '#9aa0a6' }}></div>
                <span className="small">Cancellate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
