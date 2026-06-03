import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch tickets filtering by search query and status.
 * @param {string} search 
 * @param {string} status 
 */
export const getTickets = async (search = '', status = '') => {
  const response = await client.get('/api/tickets', {
    params: {
      search,
      status: status === 'all' ? '' : status,
    },
  });
  return response.data;
};

/**
 * Fetch a single ticket by its ID.
 * @param {string|number} id 
 */
export const getTicket = async (id) => {
  const response = await client.get(`/api/tickets/${id}`);
  return response.data;
};

/**
 * Create a new customer support ticket.
 * @param {object} data - { customer_name, customer_email, subject, description }
 */
export const createTicket = async (data) => {
  const response = await client.post('/api/tickets', data);
  return response.data;
};

/**
 * Update an existing ticket (e.g., status, notes, comments).
 * @param {string|number} id 
 * @param {object} data - { status, comment, ... }
 */
export const updateTicket = async (id, data) => {
  const response = await client.put(`/api/tickets/${id}`, data);
  return response.data;
};

export default {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
};
