'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '../../config/api';

interface Booking {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  resource: {
    name: string;
    type: string;
  };
}

type ViewMode = 'week' | 'month';

export default function PublicCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  useEffect(() => {
    // Fetch ONLY approved bookings (no authentication needed)
    fetch(`${API_ENDPOINTS.bookings}?status=APPROVED`)
      .then(res => {
        if (!res.ok) throw new Error('Errore nel caricamento');
        return res.json();
      })
      .then(data => {
        const bookingsArray = Array.isArray(data) ? data : [];
        // Filter only APPROVED
        const approved = bookingsArray.filter(b => b.status === 'APPROVED');
        setBookings(approved);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError('Errore nel caricamento del calendario');
        setLoading(false);
      });
  }, []);

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
    return bookings.filter(booking => {
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
    if (viewMode === 'week') {
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

  const weekDays = getWeekDays(selectedDate);
  const monthDays = getDaysInMonth(selectedDate);
  const monthName = selectedDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  const weekRange = firstDay && lastDay
    ? `${firstDay.getDate()} ${firstDay.toLocaleDateString('it-IT', { month: 'short' })} - ${lastDay.getDate()} ${lastDay.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}`
    : '';

  const getDateTitle = () => {
    if (viewMode === 'week') return weekRange;
    return monthName;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <p className="text-muted">Caricamento calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <nav className="navbar bg-white shadow-sm">
        <div className="container-fluid">
          <h1 className="h4 mb-0 text-baleno-primary fw-bold">Calendario Prenotazioni</h1>
          <Link href="/" className="text-decoration-none fw-medium" style={{ color: 'var(--baleno-primary)' }}>
            ← Torna alla home
          </Link>
        </div>
      </nav>

      {/* Calendar Content */}
      <div className="container py-4">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              {error}
            </div>
          )}

          {/* Info banner */}
          <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
            <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            <span>Visualizzazione calendario pubblico - Solo prenotazioni approvate</span>
          </div>

          {/* Calendar controls */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body py-2">
              <div className="row g-2 align-items-center">
                <div className="col-md-6">
                  <div className="d-flex gap-2">
                    <button
                      onClick={goToToday}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Oggi
                    </button>
                    <div className="btn-group" role="group">
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
                <div className="col-md-6 text-end">
                  <span className="badge bg-light text-dark me-2">
                    {bookings.length} prenotazioni approvate
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
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
                                  const startTime = new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

                                  return (
                                    <div
                                      key={booking.id}
                                      className="rounded shadow-sm mb-1 p-2"
                                      style={{
                                        backgroundColor: '#008055',
                                        color: 'white',
                                        fontSize: '0.75rem'
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

              {/* Month View */}
              {viewMode === 'month' && (
                <div>
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

                  {(() => {
                    const weeks: (Date | null)[][] = [];
                    for (let i = 0; i < monthDays.length; i += 7) {
                      const weekSlice = monthDays.slice(i, i + 7);
                      while (weekSlice.length < 7) {
                        weekSlice.push(null);
                      }
                      weeks.push(weekSlice);
                    }

                    return weeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="row g-0">
                        {week.map((day, dayIdx) => {
                          if (!day) {
                            return (
                              <div
                                key={`empty-${weekIdx}-${dayIdx}`}
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
                              key={`day-${weekIdx}-${dayIdx}`}
                              className="col border"
                              style={{ minHeight: '160px', backgroundColor: 'white' }}
                            >
                              <div className="p-2">
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

                                <div className="d-flex flex-column" style={{ gap: '4px' }}>
                                  {dayBookings.slice(0, 5).map(booking => {
                                    const startTime = new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

                                    return (
                                      <div
                                        key={booking.id}
                                        className="rounded text-truncate"
                                        title={`${booking.title}\n${booking.resource.name}\n${startTime}`}
                                        style={{
                                          fontSize: '0.8rem',
                                          padding: '4px 8px',
                                          backgroundColor: '#008055',
                                          color: 'white',
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
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-4">
            <Link href="/register" className="btn btn-primary btn-lg fw-semibold px-5">
              Registrati per prenotare
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
