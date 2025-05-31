export const getColorByStatus = (status: number) => {
  switch (status) {
    case 0: return 'border-amber-600';      // Pending
    case 1: return 'border-emerald-600';    // Approved
    case 2: return 'border-red-600';        // Rejected
    case 3: return 'border-slate-600';      // Cancelled
    case 4: return 'border-blue-600';       // In Progress
    case 5: return 'border-green-600';      // Done
    default: return 'border-gray-600';
  }
};