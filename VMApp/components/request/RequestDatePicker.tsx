import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, Text, View } from 'react-native';
import { DateData } from 'react-native-calendars';
import { formatDayMonthEn, formatDayMonthVi } from 'utils/datetimeUtils';

import InfoRow from '@/components/ui/InfoRowComponent';
import MyCalendar from '@/components/ui/MyCalendar';

interface DatePickerComponentProps {
  isMultiDayTrip: boolean;
  setIsMultiDayTrip: (value: boolean) => void;
  startDate: string;
  endDate: string;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setIsDisabled: (value: boolean) => void;
  handleClearList: () => void;
}

interface MarkedDate {
  startingDay?: boolean;
  endingDay?: boolean;
  color?: string;
  textColor?: string;
  selected?: boolean;
  disableTouchEvent?: boolean;
}

const RequestDatePicker = ({
  isMultiDayTrip,
  setIsMultiDayTrip,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  setIsDisabled,
  handleClearList,
}: DatePickerComponentProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  const isViCurrent = currentLocale === 'vi-VN';
  const [today] = useState<string>(new Date().toISOString().split('T')[0]);

  const toggleSwitch = (): void => setIsMultiDayTrip(!isMultiDayTrip);

  const getMarkedDates = (): { [date: string]: MarkedDate } => {
    let marked: { [date: string]: MarkedDate } = {};

    if (startDate) {
      marked[startDate] = {
        startingDay: true,
        color: '#3b82f6',
        textColor: 'white',
      };
    }

    if (endDate) {
      marked[endDate] = {
        endingDay: true,
        color: '#3b82f6',
        textColor: 'white',
      };

      let current = new Date(startDate);
      while (current < new Date(endDate)) {
        current.setDate(current.getDate() + 1);
        const d = current.toISOString().split('T')[0];
        if (d !== endDate) {
          marked[d] = {
            color: '#93c5fd',
            textColor: 'black',
          };
        }
      }
    }

    return marked;
  };

  const onDayPress = (day: DateData): void => {
    const date = day.dateString;
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate('');
    } else if (date < startDate) {
      setStartDate(date);
      setEndDate('');
    } else {
      setEndDate(date);
    }
  };

  const handleDayPress = (day: DateData): void => {
    setIsDisabled(false);
    handleClearList();
    if (isMultiDayTrip) {
      onDayPress(day);
    } else {
      setStartDate(day.dateString);
    }
  };

  return (
    <View className="px-2">
      <View className="mb-4">
        <View className="mb-1 flex-row items-center">
          <Switch
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor={isMultiDayTrip ? '#fff' : '#f3f4f6'}
            ios_backgroundColor="#d1d5db"
            onValueChange={toggleSwitch}
            value={isMultiDayTrip}
            className="-m-2 scale-75"
          />
          <Text className="ml-2 text-sm text-gray-600">
            {isMultiDayTrip
              ? `${t('request.create.tripType.multi')}`
              : `${t('request.create.tripType.day')}`}
          </Text>
        </View>
      </View>

      {isMultiDayTrip ? (
        <InfoRow
          label={t('common.fields.date')}
          value=""
          valueComponent={
            <View className="flex-row">
              <Text className="font-semibold text-gray-800">
                {isViCurrent ? formatDayMonthVi(startDate) : formatDayMonthEn(startDate)} -{' '}
              </Text>
              <Text className="font-semibold text-gray-800">
                {isViCurrent ? formatDayMonthVi(endDate) : formatDayMonthEn(endDate)}
              </Text>
            </View>
          }
        />
      ) : (
        <InfoRow
          label={t('common.fields.date')}
          value={isViCurrent ? formatDayMonthVi(startDate) : formatDayMonthEn(startDate)}
        />
      )}

      <View className="mt-4">
        <MyCalendar
          markingType={isMultiDayTrip ? 'period' : undefined}
          markedDates={
            isMultiDayTrip
              ? getMarkedDates()
              : {
                  [startDate]: {
                    selected: true,
                  },
                }
          }
          onDayPress={handleDayPress}
          minDate={today}
        />
        <View className="mt-3 rounded-xl bg-blue-50 p-4">
          <Text className="text-sm font-medium text-blue-900">
            Khi thay đổi ngày đã chọn trước đó ứng dụng sẽ lấy danh sách xe khả dụng mới!
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RequestDatePicker;
