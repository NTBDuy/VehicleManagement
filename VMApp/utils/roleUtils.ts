import { StatusConfig } from '@/types/StatusConfig';

type StatusNumber = 0 | 1 | 2;

const STATUS_CONFIG: Record<StatusNumber, StatusConfig> = {
  0: { labelEn: 'Admin', labelVi: 'Quản trị viên', color: 'orange-600' },
  1: { labelEn: 'Employee', labelVi: 'Nhân viên', color: 'blue-600' },
  2: { labelEn: 'Manager', labelVi: 'Trưởng phòng', color: 'green-600' },
};

const DEFAULT_CONFIG: StatusConfig = {
  labelEn: 'Unknown',
  labelVi: 'Không xác định',
  color: 'gray-500',
};

export const getRoleBackgroundColor = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return `bg-${config.color}`;
};

export const getRoleLabelEn = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return config.labelEn;
};

export const getRoleLabelVi = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return config.labelVi;
};
