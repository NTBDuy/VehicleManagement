export const getRoleLabel = (role: number): string => {
  const roles = ['Admin', 'Employee', 'Manager'];
  return roles[role] ?? 'Unknown';
};

export const getRoleStyle = (role: number): string => {
  const styles = ['bg-red-500', 'bg-green-500', 'bg-blue-500'];
  return styles[role] ?? 'bg-gray-500';
};
