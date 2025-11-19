'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Booking {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  isPrivate?: boolean;
  resource: {
    name: string;
    type: string;
  };
}

type ViewMode = 'week' | 'month';

export default function PublicCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  useEffect(() => {
    // Fetch from PUBLIC endpoint (no authentication needed)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(`${apiUrl}/bookings/public/calendar`)
      .then(res => {
        if (!res.ok) throw new Error('Errore nel caricamento');
        return res.json();
      })
      .then(data => {
        const bookingsArray = Array.isArray(data) ? data : [];
        setBookings(bookingsArray);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
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
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 50%, #ffffff 100%)' }}>
      {/* Header */}
      <nav className="bg-white shadow-sm py-3">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0 fw-bold" style={{ color: '#2B548E' }}>Calendario Prenotazioni</h1>
            <div className="d-flex gap-3 align-items-center">
              <Link href="/resources" className="btn fw-semibold" style={{
                background: 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)',
                border: 'none',
                color: 'white'
              }}>
                Esplora Spazi
              </Link>
              <Link href="/" className="text-decoration-none fw-medium d-flex align-items-center gap-1" style={{ color: '#2B548E', transition: 'color 0.2s ease' }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
                </svg>
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Calendar Content */}
      <div className="container py-5">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Calendar */}
          <div className="card shadow-lg" style={{
            border: '1px solid rgba(43, 84, 142, 0.1)',
            borderRadius: '24px',
            overflow: 'hidden'
          }}>
            {/* Controls inside calendar card */}
            <div className="card-body py-3 border-bottom" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
              <div className="d-flex gap-2">
                <button
                  onClick={goToToday}
                  className="btn btn-sm fw-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #EDBB00 0%, #d4a600 100%)',
                    border: 'none',
                    color: '#2B548E',
                    borderRadius: '12px'
                  }}
                >
                  Oggi
                </button>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className="btn btn-sm fw-semibold"
                    style={{
                      background: viewMode === 'week' ? 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)' : 'transparent',
                      border: '2px solid #2B548E',
                      color: viewMode === 'week' ? 'white' : '#2B548E',
                      borderRadius: '12px 0 0 12px'
                    }}
                    onClick={() => setViewMode('week')}
                  >
                    Settimana
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm fw-semibold"
                    style={{
                      background: viewMode === 'month' ? 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)' : 'transparent',
                      border: '2px solid #2B548E',
                      borderLeft: 'none',
                      color: viewMode === 'month' ? 'white' : '#2B548E',
                      borderRadius: '0 12px 12px 0'
                    }}
                    onClick={() => setViewMode('month')}
                  >
                    Mese
                  </button>
                </div>
              </div>
            </div>
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
                                        backgroundColor: booking.isPrivate ? '#6c757d' : '#008055',
                                        color: 'white',
                                        fontSize: '0.75rem'
                                      }}
                                      title={booking.isPrivate ? 'Evento Privato' : `${booking.title}\n${booking.resource.name}\n${startTime}`}
                                    >
                                      <div className="fw-semibold text-truncate">
                                        {booking.isPrivate ? 'Evento Privato' : booking.title}
                                      </div>
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

              {/* Month View - Compatto */}
              {viewMode === 'month' && (
                <div>
                  <div className="row g-0 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                    {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day) => (
                      <div
                        key={day}
                        className="col text-center py-1 border-end"
                        style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6c757d' }}
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
                                style={{ height: '95px', backgroundColor: '#fafafa' }}
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
                              style={{ height: '95px', backgroundColor: 'white' }}
                            >
                              <div className="p-1" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div
                                  className={`d-inline-flex align-items-center justify-content-center mb-1 ${isToday ? 'bg-primary text-white rounded-circle' : ''}`}
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: isToday ? '600' : '500',
                                    color: isToday ? '#fff' : '#6c757d',
                                    width: isToday ? '22px' : 'auto',
                                    height: isToday ? '22px' : 'auto',
                                    flexShrink: 0
                                  }}
                                >
                                  {day.getDate()}
                                </div>

                                <div className="d-flex flex-column overflow-hidden" style={{ gap: '2px', flex: 1 }}>
                                  {dayBookings.slice(0, 3).map(booking => {
                                    const startTime = new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

                                    return (
                                      <div
                                        key={booking.id}
                                        className="rounded text-truncate"
                                        title={booking.isPrivate ? 'Evento Privato' : `${booking.title}\n${booking.resource.name}\n${startTime}`}
                                        style={{
                                          fontSize: '0.65rem',
                                          padding: '2px 4px',
                                          backgroundColor: booking.isPrivate ? '#6c757d' : '#008055',
                                          color: 'white',
                                          fontWeight: '500',
                                          lineHeight: 1.2
                                        }}
                                      >
                                        {booking.isPrivate ? (
                                          <span>Privato</span>
                                        ) : (
                                          <><span style={{ opacity: 0.9 }}>{startTime}</span> {booking.title}</>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {dayBookings.length > 3 && (
                                    <div style={{ fontSize: '0.6rem', color: '#6c757d', paddingLeft: '4px', fontWeight: '500' }}>
                                      +{dayBookings.length - 3}
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
            <p className="text-muted mb-3">Vedi uno spazio libero? Esplora le risorse disponibili e prenota!</p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link href="/resources" className="btn btn-lg fw-semibold px-4" style={{
                background: 'linear-gradient(135deg, #2B548E 0%, #1e3a5f 100%)',
                border: 'none',
                color: 'white',
                borderRadius: '12px'
              }}>
                Esplora Spazi
              </Link>
              <Link href="/bookings/new" className="btn btn-lg fw-semibold px-4" style={{
                background: 'linear-gradient(135deg, #EDBB00 0%, #d4a600 100%)',
                border: 'none',
                color: '#2B548E',
                borderRadius: '12px'
              }}>
                Prenota Ora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
