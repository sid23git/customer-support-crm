import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';

function Layout() {
  const { isFallbackActive } = useTickets();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* Fallback Warning Banner */}
      {isFallbackActive && (
        <div className="bg-red-50 border-b border-red-200 py-3 px-4 text-center sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-semibold text-red-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              <strong>API Offline:</strong> The backend at <code className="bg-red-100 text-red-900 px-1 py-0.5 rounded text-[11px] font-mono">{import.meta.env.VITE_API_URL || 'http://localhost:5000'}</code> is unreachable. Running on localStorage mock database.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-neutral-200/80 hidden md:flex flex-col sticky top-0 h-screen">
          <div className="p-6 border-b border-neutral-200/60">
            <Link to="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-neutral-900">
              <span className="w-5.5 h-5.5 bg-neutral-900 text-white rounded flex items-center justify-center text-[11px] font-bold">C</span>
              <span className="tracking-wide">Customer CRM</span>
            </Link>
          </div>
          
          <nav className="flex-1 p-4 space-y-1.5">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-md transition-all ${
                  isActive 
                    ? 'bg-neutral-100 text-neutral-900 font-bold' 
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              All Tickets
            </NavLink>

            <NavLink 
              to="/tickets/new" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-md transition-all ${
                  isActive 
                    ? 'bg-neutral-100 text-neutral-900 font-bold' 
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              New Ticket
            </NavLink>
          </nav>

          <div className="p-5 border-t border-neutral-200/60 text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">
            Notion CRM v1.0.0
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Mobile Nav */}
          <header className="bg-white border-b border-neutral-200/80 px-6 py-4.5 flex items-center justify-between md:hidden">
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-900">
              <span className="w-5 h-5 bg-neutral-900 text-white rounded flex items-center justify-center text-[10px] font-bold">C</span>
              <span>Customer CRM</span>
            </Link>
            <div className="flex gap-4">
              <Link to="/" className="text-xs text-neutral-500 font-semibold hover:text-neutral-900">Tickets</Link>
              <Link to="/tickets/new" className="text-xs text-neutral-500 font-semibold hover:text-neutral-900">+ New</Link>
            </div>
          </header>

          <main className="flex-1 max-w-5xl w-full mx-auto p-5 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
