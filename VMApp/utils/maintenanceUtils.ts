type StatusNumber = 0 | 1 | 2;

const STATUS_CONFIG: Record<StatusNumber, { labelKey: string; color: string }> = {
  0: { labelKey: 'common.status.incoming', color: 'orange-600' },
  1: { labelKey: 'common.status.inProgress', color: 'blue-600' },
  2: { labelKey: 'common.status.done', color: 'green-600' },
};

const DEFAULT_CONFIG = {
  labelKey: 'common.status.unknown',
  color: 'gray-600',
};

const getStatusConfig = (status: number) =>
  STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;

export const getMaintenanceBorderColor = (status: number): string => {
  return `border-${getStatusConfig(status).color}`;
};

export const getMaintenanceBackgroundColor = (status: number): string => {
  return `bg-${getStatusConfig(status).color}`;
};

export const getMaintenanceLabel = (status: number, t: (key: string) => string): string => {
  return t(getStatusConfig(status).labelKey);
};
