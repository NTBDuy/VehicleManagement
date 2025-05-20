type DateInput = Date | string | number | null | undefined;

export const formatDate = (input: DateInput): string => {
  if (!input) return '';

  const date = new Date(input);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatTime = (input: DateInput): string => {
  if (!input) return '';

  const date = new Date(input);
  if (isNaN(date.getTime())) return '';

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
};

export const formatDatetime = (input: DateInput): string => {
  if (!input) return '';

  const date = new Date(input);
  if (isNaN(date.getTime())) return '';

  const time = formatTime(date);
  const dateFormatted = formatDate(date);

  return `${time} - ${dateFormatted}`;
};

export const formatDayMonth = (input: DateInput): string => {
  if (!input) return '';

  const date = new Date(input);
  if (isNaN(date.getTime())) return '';

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate().toString().padStart(2, '0');
  const monthName = months[date.getMonth()];

  return `${dayName}, ${day} ${monthName}`;
};