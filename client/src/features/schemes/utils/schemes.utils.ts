export const formatLoanAmount = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};
