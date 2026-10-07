import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

let toastListener: ((message: string, type: ToastType) => void) | null = null;

export const toast = (message: string, type: ToastType = 'info') => {
  toastListener?.(message, type);
};

const VARIANTS: Record<ToastType, { border: string; color: string; Icon: any }> = {
  success: { border: 'var(--color-success)', color: 'var(--color-success)', Icon: CheckCircle },
  error: { border: 'var(--color-danger)', color: 'var(--color-danger)', Icon: AlertTriangle },
  info: { border: 'var(--color-primary)', color: 'var(--color-primary)', Icon: Info },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 10000);
  }, []);

  useEffect(() => {
    toastListener = showToast;
    return () => {
      toastListener = null;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: 'min(440px, calc(100vw - 32px))',
        }}
      >
        {toasts.map(t => {
          const { border, color, Icon } = VARIANTS[t.type];
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                borderLeft: `4px solid ${border}`,
                boxShadow: 'var(--shadow-lg)',
                animation: 'slideInRight 0.25s ease-out',
              }}
            >
              <Icon size={20} style={{ color, flexShrink: 0, marginTop: 1 }} />
              <p style={{ flex: 1, margin: 0, fontSize: 14, color: 'var(--color-text)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2, flexShrink: 0, display: 'flex' }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
