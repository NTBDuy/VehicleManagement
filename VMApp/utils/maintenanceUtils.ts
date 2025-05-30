export const getColorByStatus = (status: number) => {
  switch (status) {
    case 0:
      return 'border-orange-600';
    case 1:
      return 'border-blue-400';
    case 2:
      return 'border-green-600';
    case 3:
      return 'border-gray-600';
    default:
      return 'border-gray-400';
  }
};

export const getBgColorByStatus = (status: number) => {
  switch (status) {
    case 0:
      return 'bg-orange-500';
    case 1:
      return 'bg-blue-500';
    case 2:
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export const getStatusLabel = (status: number) => {
  switch (status) {
    case 0:
      return 'Pending';
    case 1:
      return 'In Progress';
    case 2:
      return 'Done';
    default:
      return 'Unknown';
  }
};
