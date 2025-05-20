export const getBorderColorByStatus = (status: number) => {
  switch (status) {
    case 0:
      return 'border-orange-600';
    case 1:
      return 'border-green-600';
    case 2:
      return 'border-red-600';
    case 3:
      return 'border-gray-600';
  }
};
