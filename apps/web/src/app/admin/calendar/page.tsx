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

interface PositionedBooking extends Booking {
  top: number;
  height: number;
  left: number;
  width: number;
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

    // Fetch bookings
    fetch(API_ENDPOINTS.bookings, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
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

    // Fetch resources for filter
    fetch(API_ENDPOINTS.resources, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
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

  // Apply filters
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

  // Get week days starting from Monday
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

  // Calculate event position and height (Google Calendar style)
  const calculateEventPosition = (booking: Booking, pixelsPerHour: number = 60): { top: number; height: number } => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    const top = (startHour - 0) * pixelsPerHour; // 0 = midnight
    const height = (endHour - startHour) * pixelsPerHour;

    return { top, height: Math.max(height, 20) }; // Min 20px height
  };

  // Detect overlapping events and calculate horizontal positioning
  const positionOverlappingEvents = (bookings: Booking[], pixelsPerHour: number = 60): PositionedBooking[] => {
    if (bookings.length === 0) return [];

    // Sort by start time
    const sorted = [...bookings].sort((a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const positioned: PositionedBooking[] = [];
    const columns: { start: Date; end: Date; events: PositionedBooking[] }[] = [];

    sorted.forEach(booking => {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      const { top, height } = calculateEventPosition(booking, pixelsPerHour);

      // Find a column where this event doesn't overlap
      let columnIndex = columns.findIndex(col =>
        new Date(col.end).getTime() <= start.getTime()
      );

      if (columnIndex === -1) {
        // Create new column
        columnIndex = columns.length;
        columns.push({ start, end, events: [] });
      } else {
        // Update column end time
        columns[columnIndex].end = end;
      }

      const totalColumns = columns.filter(col =>
        new Date(col.start).getTime() < end.getTime() &&
        new Date(col.end).getTime() > start.getTime()
      ).length;

      const positionedBooking: PositionedBooking = {
        ...booking,
        top,
        height,
        left: (columnIndex / Math.max(totalColumns, 1)) * 100,
        width: (1 / Math.max(totalColumns, 1)) * 100
      };

      positioned.push(positionedBooking);
      columns[columnIndex].events.push(positionedBooking);
    });

    return positioned;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before month start
    const firstDayOfWeek = firstDay.getDay();
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday = 0
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

  // Generate time slots (0:00 - 23:00)
  const timeSlots = [];
  for (let i = 0; i < 24; i++) {
    timeSlots.push(i);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return { bg: '#34a853', text: '#fff' }; // Green
      case 'PENDING': return { bg: '#fbbc04', text: '#000' }; // Yellow
      case 'REJECTED': return { bg: '#ea4335', text: '#fff' }; // Red
      case 'CANCELLED': return { bg: '#9aa0a6', text: '#fff' }; // Gray
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
        {/* Header */}
        <div className="mb-3">
          <h1 className="h3 fw-bold text-baleno-primary mb-1">Calendario</h1>
          <p className="text-muted mb-0">Visualizza tutte le prenotazioni</p>
        </div>

        {/* Filtri */}
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

        {/* Calendar Navigation */}
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
              <div className="overflow-auto" style={{ maxHeight: '700px' }}>
                <div className="d-flex" style={{ minHeight: '1440px' }}>
                  {/* Time column */}
                  <div style={{ width: '60px', flexShrink: 0 }}>
                    {timeSlots.map((hour) => (
                      <div
                        key={hour}
                        className="text-end pe-2 text-muted"
                        style={{ height: '60px', fontSize: '0.75rem', paddingTop: '2px' }}
                      >
                        {hour === 0 ? '' : `${hour}:00`}
                      </div>
                    ))}
                  </div>

                  {/* Event column */}
                  <div className="flex-grow-1 position-relative border-start" style={{ borderLeft: '1px solid #e0e0e0' }}>
                    {/* Hour lines */}
                    {timeSlots.map((hour) => (
                      <div
                        key={hour}
                        className="border-top"
                        style={{
                          height: '60px',
                          borderColor: '#e0e0e0',
                          borderTopWidth: hour === 0 ? '0' : '1px'
                        }}
                      />
                    ))}

                    {/* Events */}
                    {positionOverlappingEvents(getBookingsForDate(selectedDate), 60).map((booking) => {
                      const colors = getStatusColor(booking.status);
                      const startTime = new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                      const endTime = new Date(booking.endTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div
                          key={booking.id}
                          className="position-absolute rounded shadow-sm"
                          style={{
                            top: `${booking.top}px`,
                            left: `calc(${booking.left}% + 4px)`,
                            width: `calc(${booking.width}% - 8px)`,
                            height: `${booking.height}px`,
                            backgroundColor: colors.bg,
                            color: colors.text,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            fontSize: '0.85rem',
                            zIndex: 1
                          }}
                          title={`${booking.title}\n${booking.resource.name}\n${startTime} - ${endTime}`}
                        >
                          <div className="fw-semibold text-truncate">{booking.title}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                            {startTime} - {endTime}
                          </div>
                          {booking.height > 40 && (
                            <div className="text-truncate" style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                              {booking.resource.name}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
              <div className="overflow-auto" style={{ maxHeight: '700px' }}>
                <div className="d-flex" style={{ minHeight: '1440px' }}>
                  {/* Time column */}
                  <div style={{ width: '60px', flexShrink: 0 }}>
                    <div style={{ height: '40px' }} /> {/* Header spacer */}
                    {timeSlots.map((hour) => (
                      <div
                        key={hour}
                        className="text-end pe-2 text-muted"
                        style={{ height: '60px', fontSize: '0.75rem', paddingTop: '2px' }}
                      >
                        {hour === 0 ? '' : `${hour}:00`}
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  <div className="flex-grow-1 d-flex">
                    {weekDays.map((day, dayIdx) => {
                      const isToday =
                        day.getDate() === new Date().getDate() &&
                        day.getMonth() === new Date().getMonth() &&
                        day.getFullYear() === new Date().getFullYear();

                      return (
                        <div
                          key={dayIdx}
                          className="flex-grow-1 position-relative border-start"
                          style={{ borderLeft: '1px solid #e0e0e0' }}
                        >
                          {/* Header */}
                          <div
                            className={`text-center py-2 border-bottom ${isToday ? 'bg-primary bg-opacity-10' : ''}`}
                            style={{ height: '40px', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}
                          >
                            <div className="small text-muted" style={{ fontSize: '0.7rem' }}>
                              {day.toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase()}
                            </div>
                            <div className={`fw-bold ${isToday ? 'text-primary' : ''}`} style={{ fontSize: '0.9rem' }}>
                              {day.getDate()}
                            </div>
                          </div>

                          {/* Hour lines */}
                          {timeSlots.map((hour) => (
                            <div
                              key={hour}
                              className="border-top"
                              style={{
                                height: '60px',
                                borderColor: '#e0e0e0',
                                borderTopWidth: hour === 0 ? '0' : '1px'
                              }}
                            />
                          ))}

                          {/* Events */}
                          {positionOverlappingEvents(getBookingsForDate(day), 60).map((booking) => {
                            const colors = getStatusColor(booking.status);
                            const startTime = new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

                            return (
                              <div
                                key={booking.id}
                                className="position-absolute rounded shadow-sm"
                                style={{
                                  top: `${booking.top + 40}px`, // +40 for header
                                  left: `calc(${booking.left}% + 4px)`,
                                  width: `calc(${booking.width}% - 8px)`,
                                  height: `${booking.height}px`,
                                  backgroundColor: colors.bg,
                                  color: colors.text,
                                  padding: '4px 6px',
                                  cursor: 'pointer',
                                  overflow: 'hidden',
                                  fontSize: '0.75rem',
                                  zIndex: 1
                                }}
                                title={`${booking.title}\n${booking.resource.name}\n${startTime}`}
                              >
                                <div className="fw-semibold text-truncate">{booking.title}</div>
                                {booking.height > 30 && (
                                  <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                                    {startTime}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Month View */}
            {viewMode === 'month' && (
              <div className="p-3">
                <div className="row g-0 mb-3">
                  {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
                    <div key={day} className="col text-center fw-bold text-muted py-2" style={{ fontSize: '0.9rem' }}>
                      {day}
                    </div>
                  ))}
                </div>
                <div className="row g-3">
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
                            isToday ? 'bg-primary bg-opacity-10 border-primary border-2' : 'bg-white'
                          }`}
                          style={{ minHeight: '120px', cursor: 'pointer' }}
                        >
                          <div className={`fw-bold mb-2 ${isToday ? 'text-primary' : 'text-dark'}`} style={{ fontSize: '0.9rem' }}>
                            {day.getDate()}
                          </div>
                          <div className="d-flex flex-column gap-1">
                            {dayBookings.slice(0, 3).map(booking => {
                              const startTime = new Date(booking.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                              const colors = getStatusColor(booking.status);
                              return (
                                <div
                                  key={booking.id}
                                  className="rounded text-truncate"
                                  title={`${booking.title}\n${booking.resource.name}\n${startTime}`}
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '3px 6px',
                                    fontWeight: '500',
                                    backgroundColor: colors.bg,
                                    color: colors.text
                                  }}
                                >
                                  <span className="text-truncate">{startTime} {booking.title}</span>
                                </div>
                              );
                            })}
                            {dayBookings.length > 3 && (
                              <div className="text-center fw-semibold text-muted" style={{ fontSize: '0.7rem' }}>
                                +{dayBookings.length - 3}
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
                <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#34a853' }}></div>
                <span className="small">Approvate</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#fbbc04' }}></div>
                <span className="small">In Attesa</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#ea4335' }}></div>
                <span className="small">Rifiutate</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#9aa0a6' }}></div>
                <span className="small">Cancellate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
