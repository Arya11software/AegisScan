import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ToastNotification() {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />
  };

  const borders = {
    success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200',
    error: 'border-rose-500/40 bg-rose-950/90 text-rose-200',
    info: 'border-blue-500/40 bg-blue-950/90 text-blue-200'
  };

  return (
    <div className="fixed top-20 right-6 z-50 transition-all duration-300 transform translate-y-0">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md max-w-md ${borders[toast.type] || borders.info}`}>
        {icons[toast.type] || icons.info}
        <p className="text-xs font-medium">{toast.message}</p>
      </div>
    </div>
  );
}
