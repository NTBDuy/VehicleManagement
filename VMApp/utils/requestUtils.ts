export const getColorByStatus = (status: number) => {
  switch (status) {
    case 0: return 'border-yellow-600';
    case 1: return 'border-blue-400';
    case 2: return 'border-green-600';
    case 3: return 'border-gray-600';
    default: return 'border-gray-400';
  }
};