import { StatusConfig } from '@/types/StatusConfig';

const STATUS_CONFIG = new Map<boolean, StatusConfig>([
  [true, { labelEn: 'Active', labelVi: 'Hoạt động', color: 'green-500' }],
  [false, { labelEn: 'Inactive', labelVi: 'Không hoạt động', color: 'red-500' }],
]);

const DEFAULT_CONFIG: StatusConfig = {
  labelEn: 'Unknown',
  labelVi: 'Không xác định',
  color: 'gray-500',
};

export const getUserBackgroundColor = (status: boolean): string => {
  const config = STATUS_CONFIG.get(status) ?? DEFAULT_CONFIG;
  return `bg-${config.color}`;
};

export const getUserLabelEn = (status: boolean): string => {
  const config = STATUS_CONFIG.get(status) ?? DEFAULT_CONFIG;
  return config.labelEn;
};

export const getUserLabelVi = (status: boolean): string => {
  const config = STATUS_CONFIG.get(status) ?? DEFAULT_CONFIG;
  return config.labelVi;
};

export const getUserInitials = (fullname?: string, email?: string): string => {
  if (fullname && fullname.trim() !== '') {
    const words = fullname.trim().split(' ');
    return words.length >= 2
      ? words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase()
      : words[0][0].toUpperCase();
  }
  return email ? email[0].toUpperCase() : '';
};

export const formatVietnamPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '+84 $1 $2 $3');
  }

  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    const withoutZero = cleaned.slice(1);
    return withoutZero.replace(/(\d{3})(\d{3})(\d{3})/, '+84 $1 $2 $3');
  }

  return phoneNumber;
};
