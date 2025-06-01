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

export const getStatusLabel = (status: boolean): string => {
  return status ? 'Active' : 'Deactivate';
};

export const getStatusStyle = (status: boolean): string => {
  return status ? 'bg-green-500' : 'bg-red-500';
};
