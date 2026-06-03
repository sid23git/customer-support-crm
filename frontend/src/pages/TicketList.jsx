import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import TicketRow from '../components/TicketRow';
import EmptyState from '../components/EmptyState';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'in progress', label: 'In Progress' },
  { id: 'closed', label: 'Closed' }
];

function TicketList() {
  const { tickets, fetchTickets, loading } = useTickets();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Debounce search query changes by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch tickets on search or status filter changes
  useEffect(() => {
    fetchTickets(debouncedSearch, activeTab);
  }, [debouncedSearch, activeTab]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 m-0">Tickets</h1>
          <p className="text-xs text-neutral-400 font-medium mt-1">Manage and resolve customer support inquiries.</p>
        </div>
        <Link 
          to="/tickets/new" 
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-all shadow-sm active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Ticket
        </Link>
      </div>

      {/* Filter Options & Search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Status Filter Tabs */}
        <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/40 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative max-w-sm w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs font-medium bg-white border border-neutral-200 rounded-lg placeholder-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
          />
        </div>
      </div>

      {/* Tickets List Table */}
      <div className="bg-white border border-neutral-200/80 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/60">
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 w-24">Ticket ID</th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Customer</th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Subject</th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 w-32">Status</th>
                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 w-28">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton Loader
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-b border-neutral-100">
                    <td className="px-6 py-4.5"><div className="h-4 bg-neutral-100 rounded w-12 animate-pulse" /></td>
                    <td className="px-6 py-4.5">
                      <div className="space-y-1.5">
                        <div className="h-4 bg-neutral-100 rounded w-28 animate-pulse" />
                        <div className="h-3 bg-neutral-100 rounded w-20 animate-pulse" />
                      </div>
                    </td>
                    <td className="px-6 py-4.5"><div className="h-4 bg-neutral-100 rounded w-44 animate-pulse" /></td>
                    <td className="px-6 py-4.5"><div className="h-5 bg-neutral-100 rounded w-20 animate-pulse" /></td>
                    <td className="px-6 py-4.5"><div className="h-4 bg-neutral-100 rounded w-16 animate-pulse" /></td>
                  </tr>
                ))
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <TicketRow key={ticket.ticket_id} ticket={ticket} />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-6">
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TicketList;
