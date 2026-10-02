import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ToastNotification() {
  const { toast } = useApp();

  if (!toast) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-[#0A6E4F] shrink-0" />,
      border: 'border-[#B6DEC9] border-l-4 border-l-[#0A6E4F]',
      badge: 'bg-[#EBF5F0] text-[#0A6E4F]'
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-[#C53030] shrink-0" />,
      border: 'border-[#FBC4C4] border-l-4 border-l-[#C53030]',
      badge: 'bg-[#FDF2F2] text-[#C53030]'
    },
    info: {
      icon: <Info className="w-4 h-4 text-[#0D9488] shrink-0" />,
      border: 'border-[#B2EBE4] border-l-4 border-l-[#0D9488]',
      badge: 'bg-[#EDFAF8] text-[#0D9488]'
    }
  };

  const config = typeConfig[toast.type] || typeConfig.info;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 transition-all duration-200 transform translate-y-0 animate-fade-in max-w-sm sm:max-w-md w-full">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg bg-[#FFFFFF] border shadow-lg ${config.border}`}>
        {config.icon}
        <p className="text-xs font-semibold text-[#16201B] flex-1">{toast.message}</p>
      </div>
    </div>
  );
}
