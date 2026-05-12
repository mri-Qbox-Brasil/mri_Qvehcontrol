import { useEffect, useState } from 'react';

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

export const Toast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'showToast') {
        const newToast: ToastMessage = {
          id: Date.now(),
          text: event.data.text,
          type: event.data.toastType || 'info'
        };
        
        setToasts(prev => [...prev, newToast]);

        // Auto remove after 3 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 3000);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none w-64 items-center">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`px-4 py-2 rounded-xl backdrop-blur-md border shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 w-full ${
            toast.type === 'success' 
              ? 'bg-dash-accent/10 border-dash-accent/30 text-dash-accent shadow-[0_0_15px_rgba(0,230,153,0.15)]' 
              : toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                : 'bg-zinc-900/80 border-zinc-700 text-zinc-300 shadow-xl'
          }`}
        >
          {toast.type === 'success' && (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.type === 'info' && (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
