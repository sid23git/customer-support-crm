import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/tickets';

const TicketsContext = createContext();

const MOCK_TICKETS = [
  {
    id: 1,
    ticket_id: 'TKT-001',
    customer_name: 'Sarah Jenkins',
    customer_email: 'sarah@acme.com',
    subject: 'Unable to access billing dashboard',
    description: 'Getting a 403 Forbidden error when trying to access the team invoices page. My account is an administrator role. Please check my privileges and let me know how to resolve this.',
    status: 'Open',
    notes: [],
    created_at: '2026-06-02T08:30:00.000Z'
  },
  {
    id: 2,
    ticket_id: 'TKT-002',
    customer_name: 'David Miller',
    customer_email: 'david@gmail.com',
    subject: 'API webhook signatures failing validation',
    description: 'The webhook signatures sent from your production server do not match the signing secret in our dashboard. We are using SHA256 and validating signatures in Node.js. Are there any extra payload headers or fields included in the hashing process?',
    status: 'In Progress',
    notes: [
      { id: 1, note_text: 'Looking into our signature generation logic. Seems it might be encoding payload twice.', created_at: '2026-06-02T09:15:00.000Z' }
    ],
    created_at: '2026-06-02T09:00:00.000Z'
  },
  {
    id: 3,
    ticket_id: 'TKT-003',
    customer_name: 'Elena Rostova',
    customer_email: 'elena.r@yandex.com',
    subject: 'Feature request: SSO support for Okta',
    description: 'Our enterprise security policies require Okta integration for single sign-on. Can you support this soon? It is a blocker for our wider rollout.',
    status: 'Closed',
    notes: [
      { id: 1, note_text: 'SSO is currently supported on our Enterprise Tier. Let me send you the setup docs.', created_at: '2026-06-01T14:22:00.000Z' },
      { id: 2, note_text: 'Docs sent. Closing this ticket.', created_at: '2026-06-01T15:30:00.000Z' }
    ],
    created_at: '2026-06-01T14:00:00.000Z'
  }
];

export const TicketsProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize localStorage if empty
  useEffect(() => {
    if (!localStorage.getItem('crm_tickets')) {
      localStorage.setItem('crm_tickets', JSON.stringify(MOCK_TICKETS));
    }
  }, []);

  const fetchTickets = async (search = '', status = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTickets(search, status);
      setTickets(data);
      setIsFallbackActive(false);
    } catch (err) {
      console.warn('API connection failed. Falling back to localStorage.', err);
      setIsFallbackActive(true);
      
      let localData = JSON.parse(localStorage.getItem('crm_tickets') || '[]');
      
      // Filter locally
      if (status && status !== 'all') {
        localData = localData.filter(t => t.status.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        const query = search.toLowerCase();
        localData = localData.filter(t => 
          t.customer_name.toLowerCase().includes(query) ||
          t.customer_email.toLowerCase().includes(query) ||
          t.subject.toLowerCase().includes(query) ||
          t.ticket_id.toLowerCase().includes(query)
        );
      }
      // Sort by created_at desc (newest first)
      localData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTickets(localData);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleTicket = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTicket(id);
      setIsFallbackActive(false);
      setLoading(false);
      return data;
    } catch (err) {
      console.warn(`API connection failed for ticket ID ${id}. Falling back to localStorage.`, err);
      setIsFallbackActive(true);
      
      const localData = JSON.parse(localStorage.getItem('crm_tickets') || '[]');
      const ticket = localData.find(t => t.ticket_id.toLowerCase() === id.toLowerCase());
      setLoading(false);
      if (!ticket) {
        throw new Error(`Ticket with ID ${id} not found.`);
      }
      return ticket;
    }
  };

  const addTicket = async (ticketData) => {
    setLoading(true);
    setError(null);
    try {
      const newTicket = await api.createTicket(ticketData);
      setIsFallbackActive(false);
      return newTicket;
    } catch (err) {
      console.warn('API connection failed to create ticket. Saving to localStorage.', err);
      setIsFallbackActive(true);
      
      const localData = JSON.parse(localStorage.getItem('crm_tickets') || '[]');
      const newId = localData.length > 0 ? Math.max(...localData.map(t => t.id || 0)) + 1 : 1;
      const ticket_id = `TKT-${newId.toString().padStart(3, '0')}`;
      const newTicket = {
        id: newId,
        ticket_id,
        ...ticketData,
        status: 'Open',
        notes: [],
        created_at: new Date().toISOString()
      };
      const updatedData = [newTicket, ...localData];
      localStorage.setItem('crm_tickets', JSON.stringify(updatedData));
      return newTicket;
    } finally {
      setLoading(false);
    }
  };

  const saveTicketUpdates = async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTicket = await api.updateTicket(id, updates);
      setIsFallbackActive(false);
      return updatedTicket;
    } catch (err) {
      console.warn(`API connection failed to update ticket ${id}. Saving to localStorage.`, err);
      setIsFallbackActive(true);
      
      const localData = JSON.parse(localStorage.getItem('crm_tickets') || '[]');
      const ticketIndex = localData.findIndex(t => t.ticket_id.toLowerCase() === id.toLowerCase());
      if (ticketIndex === -1) {
        throw new Error(`Ticket with ID ${id} not found in localStorage.`);
      }
      const existingTicket = localData[ticketIndex];
      const updatedNotes = [...(existingTicket.notes || [])];
      const noteText = updates.note !== undefined ? updates.note : updates.comment;
      if (noteText && noteText.trim()) {
        const newNoteId = updatedNotes.length > 0 ? Math.max(...updatedNotes.map(n => n.id || 0)) + 1 : 1;
        updatedNotes.push({
          id: newNoteId,
          note_text: noteText.trim(),
          created_at: new Date().toISOString()
        });
      }
      const updatedTicket = {
        ...existingTicket,
        status: updates.status || existingTicket.status,
        notes: updatedNotes
      };
      localData[ticketIndex] = updatedTicket;
      localStorage.setItem('crm_tickets', JSON.stringify(localData));
      return updatedTicket;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TicketsContext.Provider value={{
      tickets,
      isFallbackActive,
      loading,
      error,
      fetchTickets,
      fetchSingleTicket,
      addTicket,
      saveTicketUpdates,
      setError
    }}>
      {children}
    </TicketsContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketsProvider');
  }
  return context;
};
