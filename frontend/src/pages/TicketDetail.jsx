import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatRelativeTime } from '../utils/formatDate';

function TicketDetail() {
  const { ticket_id } = useParams();
  const navigate = useNavigate();
  const { fetchSingleTicket, saveTicketUpdates } = useTickets();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Fetch ticket details on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadTicket = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSingleTicket(ticket_id);
        if (isMounted) {
          setTicket(data);
          setStatus(data.status);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to retrieve ticket details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTicket();
    
    return () => {
      isMounted = false;
    };
  }, [ticket_id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    const payload = {
      status: status,
      note: note.trim()
    };

    console.log('PUT request body:', payload);

    try {
      const response = await saveTicketUpdates(ticket_id, payload);
      console.log('PUT response:', response);

      // Re-fetch fresh ticket details from backend and update UI states
      const freshTicket = await fetchSingleTicket(ticket_id);
      setTicket(freshTicket);
      setStatus(freshTicket.status);

      setNote(''); // Clear note textarea on success
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError(err.message || 'Failed to apply ticket updates. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Error boundary view
  if (error) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white border border-red-200 rounded-lg p-6 text-center space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto border border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wide">Error Loading Ticket</h3>
            <p className="text-[11px] text-neutral-500 mt-1">{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Return to Tickets
          </button>
        </div>
      </div>
    );
  }

  // Loading skeleton state (runs if loading, if ticket is not yet loaded, or if displaying stale data from a previous route param)
  if (loading || !ticket || ticket.ticket_id !== ticket_id) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="h-4 bg-neutral-150 rounded w-24 animate-pulse mb-3" />
          <div className="h-7 bg-neutral-150 rounded w-1/2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-neutral-200/80 rounded-lg p-6 space-y-4">
              <div className="h-4 bg-neutral-150 rounded w-20 animate-pulse" />
              <div className="h-20 bg-neutral-150 rounded w-full animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-neutral-150 rounded w-32 animate-pulse" />
              <div className="h-16 bg-neutral-150 rounded w-full animate-pulse" />
            </div>
          </div>
          <div className="bg-white border border-neutral-200/80 rounded-lg p-5 space-y-4 h-fit">
            <div className="h-4 bg-neutral-150 rounded w-24 animate-pulse" />
            <div className="h-8 bg-neutral-150 rounded w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-800 transition-colors font-medium border-0 bg-transparent p-0 cursor-pointer mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to tickets
          </button>
          <div className="flex items-center mt-1">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 m-0">{ticket.subject}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Ticket content and Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Description details card */}
          <div className="bg-white border border-neutral-200/80 rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Ticket Description</h3>
            <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Activity Logs & Comments section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Activity Log & Notes</h3>
            
            {ticket.notes && ticket.notes.length > 0 ? (
              <div className="space-y-3">
                {ticket.notes.map((noteItem, index) => (
                  <div key={noteItem.id || index} className="bg-white border border-neutral-200/50 rounded-lg p-4 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-800">Support Agent Note</span>
                      <span className="text-[10px] text-neutral-400 font-medium font-mono">{formatRelativeTime(noteItem.created_at)}</span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-wrap">{noteItem.note_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 border border-dashed border-neutral-200 rounded-lg text-neutral-400">
                <p className="text-[11px] font-medium">No internal agent notes added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Configuration Sidebar */}
        <div className="space-y-6">
          {/* Properties Card */}
          <div className="bg-white border border-neutral-200/80 rounded-lg p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Properties</h3>
            
            {/* Meta details */}
            <div className="space-y-3.5 pb-4 border-b border-neutral-100">
              <div>
                <span className="block text-[10px] text-neutral-450 font-medium">Customer</span>
                <span className="text-xs font-semibold text-neutral-800">{ticket.customer_name}</span>
              </div>
              <div>
                <span className="block text-[10px] text-neutral-450 font-medium">Email Address</span>
                <span className="text-xs font-medium font-mono text-neutral-600 break-all">{ticket.customer_email}</span>
              </div>
              <div>
                <span className="block text-[10px] text-neutral-450 font-medium">Created On</span>
                <span className="text-xs font-medium text-neutral-600">{formatDate(ticket.created_at)}</span>
              </div>
            </div>

            {/* Update properties form */}
            <form onSubmit={handleSave} className="space-y-4">
              {saveSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200/50 rounded-md text-[11px] font-semibold text-emerald-800">
                  Updates saved successfully.
                </div>
              )}
              {saveError && (
                <div className="p-2.5 bg-red-50 border border-red-200/50 rounded-md text-[11px] font-semibold text-red-800">
                  {saveError}
                </div>
              )}

              {/* Status input dropdown */}
              <div className="space-y-1.5">
                <label htmlFor="status" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Ticket Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={saving}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 cursor-pointer disabled:bg-neutral-50"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Note textarea */}
              <div className="space-y-1.5">
                <label htmlFor="note" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Add Note / Activity comment
                </label>
                <textarea
                  id="note"
                  rows="3"
                  placeholder="Type notes or comments to append..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={saving}
                  className="w-full px-2.5 py-2 text-xs font-medium bg-white border border-neutral-200 rounded-md placeholder-neutral-350 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 resize-y min-h-[70px] disabled:bg-neutral-50"
                />
              </div>

              {/* Action buttons */}
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:bg-neutral-200 disabled:text-neutral-400 cursor-pointer shadow-sm"
              >
                {saving ? (
                  <div className="flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </div>
                ) : (
                  'Save Updates'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetail;
