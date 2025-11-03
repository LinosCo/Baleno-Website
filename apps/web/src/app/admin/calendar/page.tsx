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

type ViewMode = 'week' | 'month';

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    fetch(`${API_ENDPOINTS.bookings}/public/calendar`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Get week days starting from Monday
  const getWeekDays = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));

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
      const bookingDate = new Date(booking.startTime);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const changeWeek = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (delta * 7));
    setSelectedDate(newDate);
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Generate time slots (8:00 - 20:00)
  const timeSlots = [];
  for (let i = 8; i <= 20; i++) {
    timeSlots.push(`${i}:00`);
  }

  const weekDays = getWeekDays(new Date(selectedDate));
  const monthDays = getDaysInMonth(selectedDate);
  const monthName = selectedDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  const weekRange = firstDay && lastDay
    ? `${firstDay.getDate()} ${firstDay.toLocaleDateString('it-IT', { month: 'short' })} - ${lastDay.getDate()} ${lastDay.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}`
    : '';

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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h1 className="h3 fw-bold text-baleno-primary mb-1">Calendario</h1>
            <p className="text-muted mb-0">Visualizza tutte le prenotazioni</p>
          </div>
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

        {/* Calendar Navigation */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <button
                onClick={() => viewMode === 'week' ? changeWeek(-1) : changeMonth(-1)}
                className="btn btn-sm btn-outline-secondary"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                </svg>
              </button>
              <h2 className="h5 mb-0 fw-bold text-capitalize">
                {viewMode === 'week' ? weekRange : monthName}
              </h2>
              <button
                onClick={() => viewMode === 'week' ? changeWeek(1) : changeMonth(1)}
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
                      <th style={{ width: '80px', minWidth: '80px' }} className="text-center bg-light"></th>
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
                    {timeSlots.map((time, timeIdx) => (
                      <tr key={timeIdx} style={{ height: '60px' }}>
                        <td className="text-center small text-muted bg-light align-top pt-1">
                          {time}
                        </td>
                        {weekDays.map((day, dayIdx) => {
                          const dayBookings = getBookingsForDate(day).filter(booking => {
                            const bookingStart = new Date(booking.startTime);
                            const hour = bookingStart.getHours();
                            const timeHour = time.split(':')[0];
                            return hour === parseInt(timeHour || '0');
                          });

                          return (
                            <td key={dayIdx} className="p-1 position-relative" style={{ verticalAlign: 'top' }}>
                              {dayBookings.map(booking => (
                                <div
                                  key={booking.id}
                                  className={`small p-2 rounded mb-1 ${
                                    booking.status === 'APPROVED'
                                      ? 'bg-success bg-opacity-25 border border-success text-success-emphasis'
                                      : booking.status === 'PENDING'
                                      ? 'bg-warning bg-opacity-25 border border-warning text-warning-emphasis'
                                      : 'bg-secondary bg-opacity-25 border border-secondary text-secondary-emphasis'
                                  }`}
                                  style={{ fontSize: '0.75rem', cursor: 'pointer' }}
                                  title={`${booking.title}\n${booking.resource.name}\n${new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`}
                                >
                                  <div className="fw-semibold text-truncate">{booking.title}</div>
                                  <div className="text-truncate" style={{ fontSize: '0.7rem' }}>
                                    {new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              ))}
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
              <div className="p-3">
                <div className="row g-0 mb-2">
                  {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
                    <div key={day} className="col text-center fw-semibold text-muted small py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="row g-2">
                  {monthDays.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="col p-3" />;
                    }

                    const dayBookings = getBookingsForDate(day);
                    const isToday =
                      day.getDate() === new Date().getDate() &&
                      day.getMonth() === new Date().getMonth() &&
                      day.getFullYear() === new Date().getFullYear();

                    return (
                      <div key={index} className="col">
                        <div
                          className={`border rounded p-2 ${
                            isToday ? 'bg-primary bg-opacity-10 border-primary' : ''
                          }`}
                          style={{ minHeight: '100px', cursor: 'pointer' }}
                        >
                          <div className={`small fw-semibold mb-2 ${isToday ? 'text-primary' : ''}`}>
                            {day.getDate()}
                          </div>
                          <div className="d-flex flex-column gap-1">
                            {dayBookings.slice(0, 2).map(booking => (
                              <div
                                key={booking.id}
                                className={`small p-1 rounded text-truncate ${
                                  booking.status === 'APPROVED'
                                    ? 'bg-success bg-opacity-25 text-success-emphasis'
                                    : booking.status === 'PENDING'
                                    ? 'bg-warning bg-opacity-25 text-warning-emphasis'
                                    : 'bg-secondary bg-opacity-25 text-secondary-emphasis'
                                }`}
                                title={`${booking.title} - ${booking.resource.name}`}
                                style={{ fontSize: '0.7rem' }}
                              >
                                {booking.title}
                              </div>
                            ))}
                            {dayBookings.length > 2 && (
                              <div className="text-muted text-center" style={{ fontSize: '0.7rem' }}>
                                +{dayBookings.length - 2}
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

        {/* Legend */}
        <div className="card border-0 shadow-sm mt-3">
          <div className="card-body py-3">
            <div className="d-flex gap-4 flex-wrap align-items-center">
              <span className="small fw-semibold text-muted">Legenda:</span>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="bg-success bg-opacity-25 border border-success rounded"
                  style={{ width: '16px', height: '16px' }}
                ></div>
                <span className="small">Approvate</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="bg-warning bg-opacity-25 border border-warning rounded"
                  style={{ width: '16px', height: '16px' }}
                ></div>
                <span className="small">In Attesa</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="bg-secondary bg-opacity-25 border border-secondary rounded"
                  style={{ width: '16px', height: '16px' }}
                ></div>
                <span className="small">Cancellate/Rifiutate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
