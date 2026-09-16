export const calculateSavings = (orig: number, disc: number): number => {
  return Math.round(((orig - disc) / orig) * 100);
};

/** Human-friendly "time remaining" label, e.g. "2 days left" / "5 hours left" / "Closed". */
export const formatTimeRemaining = (deadline: string, t?: (key: string, params?: Record<string, any>) => string): string => {
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs <= 0) return t ? t('groupBuying.closed') : 'Closed';
  const days = Math.floor(diffMs / 86400000);
  if (days >= 1) return t ? t('groupBuying.daysLeft', { count: days }) : `${days} day${days > 1 ? 's' : ''} left`;
  const hours = Math.floor(diffMs / 3600000);
  const h = Math.max(1, hours);
  return t ? t('groupBuying.hoursLeft', { count: h }) : `${h} hour${h > 1 ? 's' : ''} left`;
};
