export const calculateSavings = (orig: number, disc: number): number => {
  return Math.round(((orig - disc) / orig) * 100);
};

/** Human-friendly "time remaining" label, e.g. "2 days left" / "5 hours left" / "Closed". */
export const formatTimeRemaining = (deadline: string): string => {
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs <= 0) return 'Closed';
  const days = Math.floor(diffMs / 86400000);
  if (days >= 1) return `${days} day${days > 1 ? 's' : ''} left`;
  const hours = Math.floor(diffMs / 3600000);
  return `${Math.max(1, hours)} hour${hours > 1 ? 's' : ''} left`;
};
