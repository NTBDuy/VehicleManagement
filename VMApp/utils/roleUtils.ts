type StatusNumber = 0 | 1 | 2;

const STATUS_CONFIG: Record<StatusNumber, { labelKey: string; color: string }> = {
  0: { labelKey: 'common.role.admin', color: 'orange-600' },
  1: { labelKey: 'common.role.employee', color: 'blue-600' },
  2: { labelKey: 'common.role.manager', color: 'green-600' },
};

const DEFAULT_CONFIG = {
  labelKey: 'common.status.unknown',
  color: 'gray-500',
};

const getStatusConfig = (status: number) => STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;

export const getRoleBackgroundColor = (status: number): string => {
  return `bg-${getStatusConfig(status).color}`;
};

export const getRoleLabel = (status: number, t: (key: string) => string): string => {
  return t(getStatusConfig(status).labelKey);
};
