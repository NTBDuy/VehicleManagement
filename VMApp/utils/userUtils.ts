const STATUS_CONFIG = new Map<boolean, { labelKey: string; color: string }>([
  [true, { labelKey: 'common.status.active', color: 'green-500' }],
  [false, { labelKey: 'common.status.inactive', color: 'red-500' }],
]);

const DEFAULT_CONFIG = {
  labelKey: 'common.status.unknown',
  color: 'gray-500',
};

const getStatusConfig = (status: boolean) =>
  STATUS_CONFIG.get(status) ?? DEFAULT_CONFIG;

export const getUserBackgroundColor = (status: boolean): string => {
  return `bg-${getStatusConfig(status).color}`;
};

export const getUserLabel = (status: boolean, t: (key: string) => string): string => {
  return t(getStatusConfig(status).labelKey);
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
