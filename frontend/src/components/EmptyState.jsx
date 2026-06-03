import React from 'react';

function EmptyState({ 
  title = 'No tickets found', 
  description = 'Try adjusting your search query or filters to find what you are looking for.' 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-dashed border-neutral-200 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 border border-neutral-200/40 mb-3.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-xs font-semibold text-neutral-800 mb-1">{title}</h3>
      <p className="text-[11px] text-neutral-400 max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}

export default EmptyState;
