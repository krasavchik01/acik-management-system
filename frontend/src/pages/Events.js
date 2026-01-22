import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import Layout from '../components/Layout';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // calendar, list, timeline
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getTypeColor = (type) => {
    const colors = {
      'Conference': 'primary',
      'Workshop': 'success',
      'Webinar': 'info',
      'Meetup': 'warning',
      'Social': 'secondary'
    };
    return colors[type] || 'secondary';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Conference': '🎤',
      'Workshop': '🛠️',
      'Webinar': '💻',
      'Meetup': '🤝',
      'Social': '🎉'
    };
    return icons[type] || '📅';
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const isEventToday = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    return eventDate.toDateString() === today.toDateString();
  };

  const isEventUpcoming = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    return eventDate > today;
  };

  const isEventPast = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    return eventDate < today && !isEventToday(date);
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
        >
          <div className="day-number">{day}</div>
          {dayEvents.length > 0 && (
            <div className="day-events">
              {dayEvents.slice(0, 2).map((event, idx) => (
                <div
                  key={idx}
                  className={`day-event badge-${getTypeColor(event.type)}`}
                  onClick={() => handleEventClick(event)}
                >
                  {getTypeIcon(event.type)} {event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="day-event-more">+{dayEvents.length - 2} more</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <Layout pageTitle="Events">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Events">
      <div className="events-page">
        {/* Header with stats */}
        <div className="events-header">
          <div className="events-stats">
            <div className="stat-item">
              <span className="stat-number">{events.length}</span>
              <span className="stat-label">Total Events</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {events.filter(e => isEventUpcoming(e.startDate)).length}
              </span>
              <span className="stat-label">Upcoming</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {events.filter(e => isEventToday(e.startDate)).length}
              </span>
              <span className="stat-label">Today</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {events.filter(e => e.type === 'Conference').length}
              </span>
              <span className="stat-label">Conferences</span>
            </div>
          </div>

          <button className="btn btn-primary">
            <span>➕</span>
            New Event
          </button>
        </div>

        {/* Search and Filters */}
        <div className="events-controls">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Type:</label>
              <select
                className="filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Webinar">Webinar</option>
                <option value="Meetup">Meetup</option>
                <option value="Social">Social</option>
              </select>
            </div>
          </div>

          <div className="view-switcher">
            <button
              className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
              title="Calendar view"
            >
              📅
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
            <button
              className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
              title="Timeline view"
            >
              ⏱️
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="calendar-view">
            <div className="calendar-header">
              <button className="calendar-nav-btn" onClick={previousMonth}>
                ‹
              </button>
              <h2 className="calendar-month">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button className="calendar-nav-btn" onClick={nextMonth}>
                ›
              </button>
            </div>

            <div className="calendar-grid">
              <div className="calendar-weekday">Sun</div>
              <div className="calendar-weekday">Mon</div>
              <div className="calendar-weekday">Tue</div>
              <div className="calendar-weekday">Wed</div>
              <div className="calendar-weekday">Thu</div>
              <div className="calendar-weekday">Fri</div>
              <div className="calendar-weekday">Sat</div>
              {renderCalendar()}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="events-list">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className={`event-item ${isEventPast(event.startDate) ? 'past' : ''}`}
                onClick={() => handleEventClick(event)}
              >
                <div className="event-date-badge">
                  <div className="badge-month">
                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="badge-day">
                    {new Date(event.startDate).getDate()}
                  </div>
                </div>

                <div className="event-content">
                  <div className="event-header-row">
                    <div className="event-title-group">
                      <h3 className="event-title">{event.title}</h3>
                      <span className={`type-badge badge-${getTypeColor(event.type)}`}>
                        {getTypeIcon(event.type)} {event.type}
                      </span>
                    </div>
                    {isEventToday(event.startDate) && (
                      <span className="badge badge-danger">Today</span>
                    )}
                  </div>

                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}

                  <div className="event-meta">
                    <span className="meta-tag">
                      🕒 {new Date(event.startDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {event.location && (
                      <span className="meta-tag">
                        📍 {event.location.venue || event.location.city}
                      </span>
                    )}
                    {event.attendees && (
                      <span className="meta-tag">
                        👥 {event.attendees.length} attendees
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📅</span>
                <h3>No events found</h3>
                <p>Try adjusting your filters or create a new event</p>
              </div>
            )}
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="timeline-view">
            <div className="timeline">
              {filteredEvents
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                .map((event, idx) => (
                  <div
                    key={event._id}
                    className={`timeline-item ${isEventPast(event.startDate) ? 'past' : 'upcoming'}`}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="timeline-marker">
                      <div className={`marker-dot badge-${getTypeColor(event.type)}`}>
                        {getTypeIcon(event.type)}
                      </div>
                    </div>

                    <div className="timeline-content">
                      <div className="timeline-date">
                        {new Date(event.startDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>

                      <div className="timeline-card">
                        <div className="timeline-card-header">
                          <h3>{event.title}</h3>
                          <span className={`type-badge badge-${getTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                        </div>

                        {event.description && (
                          <p className="timeline-description">{event.description}</p>
                        )}

                        <div className="timeline-meta">
                          <span className="meta-tag">
                            🕒 {new Date(event.startDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {event.location && (
                            <span className="meta-tag">
                              📍 {event.location.venue || event.location.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📅</span>
                <h3>No events found</h3>
                <p>Try adjusting your filters or create a new event</p>
              </div>
            )}
          </div>
        )}

        {/* Event Detail Modal */}
        {showModal && selectedEvent && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{selectedEvent.title}</h2>
                  <span className={`type-badge badge-${getTypeColor(selectedEvent.type)}`}>
                    {getTypeIcon(selectedEvent.type)} {selectedEvent.type}
                  </span>
                </div>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>

              <div className="modal-body">
                {selectedEvent.description && (
                  <div className="modal-section">
                    <label>Description</label>
                    <p>{selectedEvent.description}</p>
                  </div>
                )}

                <div className="modal-section">
                  <label>Date & Time</label>
                  <p>
                    📅 {new Date(selectedEvent.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    <br />
                    🕒 {new Date(selectedEvent.startDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {selectedEvent.endDate && (
                      <>
                        {' - '}
                        {new Date(selectedEvent.endDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </>
                    )}
                  </p>
                </div>

                {selectedEvent.location && (
                  <div className="modal-section">
                    <label>Location</label>
                    <p>
                      📍 {selectedEvent.location.venue}
                      {selectedEvent.location.address && (
                        <>
                          <br />
                          {selectedEvent.location.address}
                        </>
                      )}
                      {selectedEvent.location.city && (
                        <>
                          <br />
                          {selectedEvent.location.city}
                        </>
                      )}
                    </p>
                  </div>
                )}

                {selectedEvent.organizer && (
                  <div className="modal-section">
                    <label>Organizer</label>
                    <p>{selectedEvent.organizer}</p>
                  </div>
                )}

                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div className="modal-section">
                    <label>Attendees ({selectedEvent.attendees.length})</label>
                    <div className="attendees-list">
                      {selectedEvent.attendees.slice(0, 10).map((attendee, idx) => (
                        <span key={idx} className="attendee-name">
                          👤 {attendee.name || attendee}
                        </span>
                      ))}
                      {selectedEvent.attendees.length > 10 && (
                        <span className="attendee-name">
                          +{selectedEvent.attendees.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={closeModal}>
                  Close
                </button>
                <button className="btn btn-secondary">
                  Add to Calendar
                </button>
                <button className="btn btn-primary">Edit Event</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Events;
