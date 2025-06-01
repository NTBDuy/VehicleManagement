import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { formatDayMonth } from 'utils/datetimeUtils';

import InfoRow from '@/components/ui/InfoRowComponent';

interface DatePickerComponentProps {
  isMultiDayTrip: boolean;
  setIsMultiDayTrip: React.Dispatch<React.SetStateAction<boolean>>;
  startDate: string;
  endDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  setIsDisable: React.Dispatch<React.SetStateAction<boolean>>;
}

const RequestDatePicker = ({
  isMultiDayTrip,
  setIsMultiDayTrip,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  setIsDisable,
}: DatePickerComponentProps) => {
  const toggleSwitch = () => setIsMultiDayTrip((previousState) => !previousState);

  const [today] = useState(new Date().toISOString().split('T')[0]);

  const getMarkedDates = () => {
    let marked: { [date: string]: any } = {};
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
          marked[d] = { color: '#93c5fd', textColor: 'black' };
        }
      }
    }

    return marked;
  };

  const onDayPress = (day: any) => {
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

  return (
    <View className="px-2">
      <View className="mb-4">
        <View className="flex-row items-center mb-1">
          <Switch
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor={isMultiDayTrip ? '#fff' : '#f3f4f6'}
            ios_backgroundColor="#d1d5db"
            onValueChange={toggleSwitch}
            value={isMultiDayTrip}
            className="-m-2 scale-75"
          />
          <Text className="ml-2 text-sm text-gray-600">
            {isMultiDayTrip ? 'Multi-day trip' : 'Day trip'}
          </Text>
        </View>
      </View>
      {isMultiDayTrip ? (
        <InfoRow
          label="Date"
          value=""
          valueComponent={
            <View className="flex-row">
              <Text className="font-semibold text-gray-800">{formatDayMonth(startDate)} - </Text>
              <Text className="font-semibold text-gray-800">{formatDayMonth(endDate)}</Text>
            </View>
          }
        />
      ) : (
        <InfoRow label="Date" value={formatDayMonth(startDate)} />
      )}
      <View className="mt-4">
        <Calendar
          markingType={isMultiDayTrip ? 'period' : undefined}
          markedDates={
            isMultiDayTrip
              ? getMarkedDates()
              : {
                  [startDate]: { selected: true, disableTouchEvent: true },
                }
          }
          onDayPress={(day) => {
            setIsDisable(false);
            isMultiDayTrip ? onDayPress(day) : setStartDate(day.dateString);
          }}
          theme={{
            textSectionTitleColor: '#94a3b8',
            selectedDayBackgroundColor: '#3b82f6',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#3b82f6',
            arrowColor: '#3b82f6',
            selectedDotColor: '#fff',
          }}
          minDate={today}
          style={{
            borderRadius: 12,
            overflow: 'hidden',
          }}
        />
      </View>
    </View>
  );
};

export default RequestDatePicker;
