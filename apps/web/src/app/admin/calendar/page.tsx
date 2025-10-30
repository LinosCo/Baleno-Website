'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

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

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    fetch('http://localhost:4000/api/bookings/public/calendar', {
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

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(selectedDate);
  const monthName = selectedDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
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
        {/* Header */}
        <div className="mb-4">
          <h1 className="h3 fw-bold text-baleno-primary">Calendario Completo</h1>
          <p className="text-muted">Visualizza tutte le prenotazioni nel calendario</p>
        </div>

        {/* Calendar Navigation */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button
                onClick={() => changeMonth(-1)}
                className="btn btn-outline-secondary"
              >
                ← Precedente
              </button>
              <h2 className="h5 mb-0 fw-bold text-capitalize">{monthName}</h2>
              <button
                onClick={() => changeMonth(1)}
                className="btn btn-outline-secondary"
              >
                Successivo →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="row g-2">
              {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
                <div key={day} className="col text-center fw-semibold text-muted small py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="row g-2">
              {days.map((day, index) => {
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
                        isToday ? 'bg-primary bg-opacity-10 border-primary' : 'border-secondary'
                      }`}
                      style={{ minHeight: '100px' }}
                    >
                      <div className={`small fw-semibold mb-2 ${isToday ? 'text-primary' : ''}`}>
                        {day.getDate()}
                      </div>
                      <div className="d-flex flex-column gap-1">
                        {dayBookings.slice(0, 3).map(booking => (
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
                        {dayBookings.length > 3 && (
                          <div className="text-muted text-center" style={{ fontSize: '0.7rem' }}>
                            +{dayBookings.length - 3} altre
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h3 className="h6 fw-semibold mb-3">Legenda</h3>
            <div className="d-flex gap-4 flex-wrap">
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
