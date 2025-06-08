import { StatusConfig } from "@/types/StatusConfig";

type StatusNumber = 0 | 1 | 2;

const STATUS_CONFIG: Record<StatusNumber, StatusConfig> = {
  0: { labelEn: 'Incoming', labelVi: 'Sắp tới', color: 'orange-600' },
  1: { labelEn: 'In Progress', labelVi: 'Đang tiến hành', color: 'blue-600' },
  2: { labelEn: 'Done', labelVi: 'Hoàn thành', color: 'green-600' },
};

const DEFAULT_CONFIG: StatusConfig = {
  labelEn: 'Unknown',
  labelVi: 'Không xác định',
  color: 'gray-600',
};

export const getMaintenanceBorderColor = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return `border-${config.color}`;
};

export const getMaintenanceBackgroundColor = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return `bg-${config.color}`;
};

export const getMaintenanceLabelEn = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return config.labelEn;
};

export const getMaintenanceLabelVi = (status: number): string => {
  const config = STATUS_CONFIG[status as StatusNumber] || DEFAULT_CONFIG;
  return config.labelVi;
};
