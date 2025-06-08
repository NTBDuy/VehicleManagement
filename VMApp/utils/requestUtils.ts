import { StatusConfig } from '@/types/StatusConfig';

type StatusNumber = 0 | 1 | 2 | 3 | 4 | 5;

const STATUS_CONFIG: Record<StatusNumber, StatusConfig> = {
  0: { labelEn: 'Pending', labelVi: 'Chờ duyệt', color: 'amber-600' },
  1: { labelEn: 'Approved', labelVi: 'Đã duyệt', color: 'green-600' },
  2: { labelEn: 'Rejected', labelVi: 'Đã từ chối', color: 'red-600' },
  3: { labelEn: 'Cancelled', labelVi: 'Đã huỷ', color: 'slate-600' },
  4: { labelEn: 'In Progress', labelVi: 'Đang sử dụng', color: 'blue-600' },
  5: { labelEn: 'Done', labelVi: 'Hoàn thành', color: 'green-700' },
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
