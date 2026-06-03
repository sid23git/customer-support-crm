import React from 'react';

function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase().trim();

  let styles = 'bg-neutral-100 text-neutral-600 border border-neutral-200/60';
  let dotColor = 'bg-neutral-400';

  if (normalized === 'open') {
    styles = 'bg-blue-50 text-blue-700 border border-blue-200/40';
    dotColor = 'bg-blue-500';
  } else if (normalized === 'in progress') {
    styles = 'bg-amber-50 text-amber-800 border border-amber-200/40';
    dotColor = 'bg-amber-500';
  } else if (normalized === 'closed') {
    styles = 'bg-emerald-50 text-emerald-700 border border-emerald-200/40';
    dotColor = 'bg-emerald-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide whitespace-nowrap ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}

export default StatusBadge;
