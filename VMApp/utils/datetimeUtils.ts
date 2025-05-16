type DateInput = Date | string | number | null | undefined;

/**
 * Định dạng ngày thành DD/MM/YYYY
 */
export const formatDate = (input: DateInput): string => {
  if (!input) return '';

  const date = new Date(input);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};