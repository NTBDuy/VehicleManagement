import { StatusConfig } from '@/types/StatusConfig';

type StatusNumber = 0 | 1 | 2 | 3 | 4 | 5;

const STATUS_CONFIG: Record<StatusNumber, Omit<StatusConfig, 'label'> & { labelKey: string }> = {
  0: { labelKey: 'common.status.pending', color: 'amber-600' },
  1: { labelKey: 'common.status.approved', color: 'green-600' },
  2: { labelKey: 'common.status.rejected', color: 'red-600' },
  3: { labelKey: 'common.status.cancelled', color: 'slate-600' },
  4: { labelKey: 'common.status.inProgress', color: 'blue-600' },
  5: { labelKey: 'common.status.done', color: 'teal-600' },
};

const DEFAULT_CONFIG = {
  labelKey: 'common.status.unknown',
  color: 'gray-600',
};

const getStatusConfig = (status: number) => STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;

export const getRequestBorderColor = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return `border-${config.color}`;
};

export const getRequestBackgroundColor = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return `bg-${config.color}`;
};

export const getRequestLabel = (status: number, t: (key: string) => string): string => {
  return t(getStatusConfig(status).labelKey);
};

export const getLocationLabel = (order: number, locationsLength: number, t: any) => {
  if (order === 0) return t('common.fields.startPoint');
  if (order === locationsLength - 1) return t('common.fields.endPoint');
  return `${t('common.fields.stopPoint')} ${order}`;
};

export const calculateDistance = (
  lat0: number,
  lon0: number,
  lat1: number,
  lon1: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371;
  const dLat = toRad(lat0 - lat1);
  const dLon = toRad(lon0 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat0)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
};
