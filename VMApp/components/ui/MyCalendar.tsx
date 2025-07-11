import React, { useEffect, useMemo } from 'react';
import { Calendar, CalendarProps, DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { ViewStyle } from 'react-native';
import { setupCalendarLocale, setCalendarLocale } from '@/config/calendarLocale';

interface MyCalendarProps extends Omit<CalendarProps, 'onDayPress'> {
  markingType?: 'period' | 'multi-dot' | 'multi-period' | 'custom' | 'dot';
  markedDates?: { [date: string]: any };
  onDayPress?: (day: DateData) => void;
  theme?: {
    backgroundColor?: string;
    calendarBackground?: string;
    textSectionTitleColor?: string;
    selectedDayBackgroundColor?: string;
    selectedDayTextColor?: string;
    todayTextColor?: string;
    dayTextColor?: string;
    textDisabledColor?: string;
    arrowColor?: string;
    selectedDotColor?: string;
    [key: string]: any;
  };
  minDate?: string;
  maxDate?: string;
  style?: ViewStyle;
  current?: string; 
}

const MyCalendar = ({
  markingType,
  markedDates,
  onDayPress,
  theme,
  minDate,
  maxDate,
  current,
  style,
  ...otherProps
}: MyCalendarProps) => {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;

  setupCalendarLocale();
  setCalendarLocale(currentLocale);

  const defaultTheme = {
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: '#94a3b8',
    selectedDayBackgroundColor: '#3b82f6',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#3b82f6',
    dayTextColor: '#2d4150',
    textDisabledColor: '#d9e1e8',
    arrowColor: '#3b82f6',
    selectedDotColor: '#fff',
  };

  const defaultStyle: ViewStyle = {
    borderRadius: 12,
    overflow: 'hidden',
  };

  return (
    <Calendar
      markingType={markingType}
      markedDates={markedDates}
      onDayPress={onDayPress}
      theme={{
        ...defaultTheme,
        ...theme,
      }}
      current={current}
      minDate={minDate}
      maxDate={maxDate}
      firstDay={1}
      style={{
        ...defaultStyle,
        ...style,
      }}
      {...otherProps}
    />
  );
};

export default MyCalendar;
