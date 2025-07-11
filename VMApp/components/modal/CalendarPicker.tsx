import { formatDate } from '@/utils/datetimeUtils';
import { Modal, Pressable, TouchableOpacity, View, Text } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import MyCalendar from '../ui/MyCalendar';
import { boolean } from 'yup';
import { useState } from 'react';
import { DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

interface CalendarPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedStartDate: string;
  selectedEndDate: string;
  setSelectedDate: (date: string) => void;
  setSelectedStartDate: (date: string) => void;
  setSelectedEndDate: (date: string) => void;
  handleApplyDateRange: () => void;
}

const CalendarPicker = ({
  visible,
  onClose,
  selectedDate,
  selectedStartDate,
  selectedEndDate,
  setSelectedDate,
  setSelectedStartDate,
  setSelectedEndDate,
  handleApplyDateRange,
}: CalendarPickerProps) => {
  const { t } = useTranslation();

  const today = new Date().toISOString().split('T')[0];

  const [currentMonth, setCurrentMonth] = useState(today);

  const [isStartDate, setIsStartDate] = useState(true);

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: '#3b82f6',
      selectedTextColor: '#ffffff',
    },
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    isStartDate ? setSelectedStartDate(day.dateString) : setSelectedEndDate(day.dateString);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        onPress={onClose}
        className="flex-1 justify-center bg-black/50"
        activeOpacity={1}>
        <TouchableOpacity activeOpacity={1}>
          <View className="mx-6 overflow-hidden rounded-3xl bg-white">
            <View className="flex-row items-center justify-between border-b border-gray-100 p-6">
              <View className="flex-row items-center">
                <Pressable
                  className={`rounded-full px-4 py-2 ${isStartDate ? 'bg-blue-500' : 'bg-gray-50'}`}
                  onPress={() => {
                    setSelectedDate(selectedStartDate);
                    setCurrentMonth(selectedStartDate);
                    setIsStartDate(true);
                  }}>
                  <Text
                    className={`text-sm font-medium ${isStartDate ? 'text-white' : 'text-blue-500'}`}>
                    {formatDate(selectedStartDate)}
                  </Text>
                </Pressable>

                <Text className="mx-3 text-sm text-gray-400">đến</Text>

                <Pressable
                  className={`rounded-full px-4 py-2 ${!isStartDate ? 'bg-blue-500' : 'bg-gray-50'}`}
                  onPress={() => {
                    setSelectedDate(selectedEndDate);
                    setCurrentMonth(selectedEndDate);
                    setIsStartDate(false);
                  }}>
                  <Text
                    className={`text-sm font-medium ${!isStartDate ? 'text-white' : 'text-blue-500'}`}>
                    {formatDate(selectedEndDate)}
                  </Text>
                </Pressable>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <FontAwesomeIcon icon={faTimes} size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View className="p-6">
              <MyCalendar
                markingType="dot"
                markedDates={markedDates}
                onDayPress={handleDayPress}
                current={currentMonth}
                key={currentMonth}
              />
              <TouchableOpacity
                className="mt-6 items-center rounded-2xl bg-blue-500 py-4 shadow-sm"
                onPress={handleApplyDateRange}>
                <Text className="text-base font-semibold text-white">
                  {t('common.button.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CalendarPicker;
