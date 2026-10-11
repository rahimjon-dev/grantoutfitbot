import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Clock, CheckCircle2, Cog, Truck, PackageCheck, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const { t } = useLanguage();

  const configs = {
    pending: {
      label: t('status_pending'),
      icon: Clock,
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    confirmed: {
      label: t('status_confirmed'),
      icon: CheckCircle2,
      classes: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    },
    processing: {
      label: t('status_processing'),
      icon: Cog,
      classes: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    shipped: {
      label: t('status_shipped'),
      icon: Truck,
      classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    delivered: {
      label: t('status_delivered'),
      icon: PackageCheck,
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    cancelled: {
      label: t('status_cancelled'),
      icon: XCircle,
      classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    }
  };

  const current = configs[status] || configs.pending;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${current.classes}`}>
      <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
      <span>{current.label}</span>
    </span>
  );
}
