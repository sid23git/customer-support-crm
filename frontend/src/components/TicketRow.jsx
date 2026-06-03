import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatRelativeTime } from '../utils/formatDate';

function TicketRow({ ticket }) {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/tickets/${ticket.ticket_id}`);
  };

  return (
    <tr 
      onClick={handleRowClick}
      className="border-b border-neutral-200/50 hover:bg-neutral-50/80 transition-colors cursor-pointer group"
    >
      <td className="px-6 py-4.5 text-xs font-mono text-neutral-400 font-medium">
        {ticket.ticket_id}
      </td>
      <td className="px-6 py-4.5">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-neutral-800 group-hover:text-neutral-900">
            {ticket.customer_name}
          </span>
          <span className="text-[10px] text-neutral-400 font-medium font-mono mt-0.5">
            {ticket.customer_email}
          </span>
        </div>
      </td>
      <td className="px-6 py-4.5 text-xs text-neutral-600 font-medium max-w-xs truncate">
        {ticket.subject}
      </td>
      <td className="px-6 py-4.5">
        <StatusBadge status={ticket.status} />
      </td>
      <td className="px-6 py-4.5 text-xs text-neutral-400 font-medium font-mono">
        {formatRelativeTime(ticket.created_at)}
      </td>
    </tr>
  );
}

export default TicketRow;
