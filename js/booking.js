/**
 * ============================================================================
 * TEJAS LADIES TYLOR — Booking & Appointment Management Engine
 * ============================================================================
 * Uses localStorage to store appointments client-side with ID generator:
 * e.g., TLT-2026-001, TLT-2026-002...
 * ============================================================================
 */

(function (global) {
  'use strict';

  const STORAGE_APPOINTMENTS_KEY = 'tlt_appointments';

  // Seed sample initial appointment for demo accounts so appointments.html has rich preview
  function seedDefaultAppointments() {
    try {
      const existing = localStorage.getItem(STORAGE_APPOINTMENTS_KEY);
      if (!existing) {
        const sampleAppointments = [
          {
            id: 'TLT-2026-001',
            userEmail: 'priya@example.com',
            fullName: 'Priya Sharma',
            phone: '+91 98765 43210',
            service: 'Designer Blouses',
            serviceCategory: 'Bridal & Party Wear',
            date: '2026-09-22',
            time: '11:00 AM - 12:00 PM',
            requirements: 'Raw silk saree blouse with deep U back, potli button detailing, and elbow-length sleeves with zari border.',
            status: 'Confirmed',
            createdAt: '2026-09-10'
          },
          {
            id: 'TLT-2026-002',
            userEmail: 'priya@example.com',
            fullName: 'Priya Sharma',
            phone: '+91 98765 43210',
            service: 'Ethnic & Traditional Wear',
            serviceCategory: 'Custom Tailoring',
            date: '2026-09-28',
            time: '04:00 PM - 05:00 PM',
            requirements: 'Anarkali suit stitching with heavy flare and sweetheart neckline. Fabric will be provided at boutique.',
            status: 'Confirmed',
            createdAt: '2026-09-12'
          }
        ];
        localStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(sampleAppointments));
      }
    } catch (e) {
      console.warn('Could not seed appointments:', e);
    }
  }

  seedDefaultAppointments();

  /**
   * Retrieve all appointments from localStorage
   */
  function getAllAppointments() {
    try {
      const data = localStorage.getItem(STORAGE_APPOINTMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading appointments:', e);
      return [];
    }
  }

  /**
   * Save appointments list to storage
   */
  function saveAllAppointments(appointments) {
    try {
      localStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(appointments));
    } catch (e) {
      console.error('Error saving appointments:', e);
    }
  }

  /**
   * Generate next serial appointment ID: TLT-2026-XXX
   */
  function generateAppointmentId() {
    const list = getAllAppointments();
    const currentYear = new Date().getFullYear();
    const nextSeq = list.length + 1;
    return `TLT-${currentYear}-${String(nextSeq).padStart(3, '0')}`;
  }

  /**
   * Create a new appointment
   * @param {Object} bookingData
   * @returns {Object} { success: boolean, message: string, appointment?: Object }
   */
  function createAppointment(bookingData) {
    const appointments = getAllAppointments();

    const newAppointment = {
      id: generateAppointmentId(),
      userEmail: (bookingData.email || '').trim().toLowerCase(),
      fullName: (bookingData.fullName || '').trim(),
      phone: (bookingData.phone || '').trim(),
      service: bookingData.service || 'Custom Tailoring',
      serviceCategory: bookingData.serviceCategory || 'Bespoke Tailoring',
      date: bookingData.date,
      time: bookingData.time,
      requirements: (bookingData.requirements || '').trim() || 'Standard consultation and measurement session.',
      status: 'Confirmed',
      createdAt: new Date().toISOString().split('T')[0]
    };

    appointments.unshift(newAppointment);
    saveAllAppointments(appointments);

    return {
      success: true,
      message: 'Appointment booked successfully!',
      appointment: newAppointment
    };
  }

  /**
   * Retrieve appointments for a specific user (or all if not filtered)
   * @param {string} email
   * @returns {Array}
   */
  function getUserAppointments(email) {
    const all = getAllAppointments();
    if (!email) return all;
    return all.filter(item => (item.userEmail || '').toLowerCase() === email.toLowerCase());
  }

  /**
   * Cancel an appointment by ID
   * @param {string} id
   * @returns {boolean}
   */
  function cancelAppointment(id) {
    const appointments = getAllAppointments();
    const index = appointments.findIndex(a => a.id === id);

    if (index === -1) return false;

    appointments[index].status = 'Cancelled';
    saveAllAppointments(appointments);
    return true;
  }

  // Export Booking API
  global.TLT_BOOKING = {
    createAppointment,
    getAllAppointments,
    getUserAppointments,
    cancelAppointment,
    generateAppointmentId
  };

})(window);
