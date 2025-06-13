import { StatusConfig } from '@/types/StatusConfig';

type StatusNumber = 0 | 1 | 2 | 3 | 4 | 5;

const STATUS_CONFIG: Record<StatusNumber, StatusConfig> = {
  0: { labelEn: 'Pending', labelVi: 'Chờ duyệt', color: 'amber-600' },
  1: { labelEn: 'Approved', labelVi: 'Đã duyệt', color: 'green-600' },
  2: { labelEn: 'Rejected', labelVi: 'Đã từ chối', color: 'red-600' },
  3: { labelEn: 'Cancelled', labelVi: 'Đã huỷ', color: 'slate-600' },
  4: { labelEn: 'In Progress', labelVi: 'Đang sử dụng', color: 'blue-600' },
  5: { labelEn: 'Done', labelVi: 'Hoàn thành', color: 'teal-600' },
};

const DEFAULT_CONFIG: StatusConfig = {
  labelEn: 'Unknown',
  labelVi: 'Không xác định',
  color: 'gray-600',
};

export const getRequestBorderColor = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return `border-${config.color}`;
};

export const getRequestBackgroundColor = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return `bg-${config.color}`;
};

export const getRequestLabelEn = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return config.labelEn;
};

export const getRequestLabelEnVi = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return config.labelVi;
};

export const getLocationLabel = (order: number, locationsLength: number) => {
  if (order === 0) return 'Điểm xuất phát';
  if (order === locationsLength - 1) return 'Điểm kết thúc';
  return `Điểm dừng ${order}`;
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
