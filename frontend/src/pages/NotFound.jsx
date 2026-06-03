import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
      <div className="text-5xl font-extrabold text-neutral-200 font-mono tracking-tighter">404</div>
      <div className="space-y-1.5">
        <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Page Not Found</h2>
        <p className="text-[11px] text-neutral-400 max-w-xs mx-auto leading-relaxed">
          The requested address could not be located. It might have been relocated or deleted.
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-sm cursor-pointer"
      >
        Return to Home
      </button>
    </div>
  );
}

export default NotFound;
