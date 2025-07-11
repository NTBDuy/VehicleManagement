import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { DateData } from 'react-native-calendars';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

import { formatDate } from '@/utils/datetimeUtils';
import MyCalendar from '@/components/ui/MyCalendar';

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onApply: (startDate: string, endDate: string) => void;
  title?: string;
  confirmText?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  visible,
  onClose,
  startDate,
  endDate,
  onApply,
  title = 'Chọn khoảng thời gian',
  confirmText,
}) => {
  const { t } = useTranslation();

  const [selectedStartDate, setSelectedStartDate] = useState(startDate);
  const [selectedEndDate, setSelectedEndDate] = useState(endDate);
  const [selectedDate, setSelectedDate] = useState(startDate);
  const [isStartDate, setIsStartDate] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(startDate);

  useEffect(() => {
    if (visible) {
      setSelectedStartDate(startDate);
      setSelectedEndDate(endDate);
      setSelectedDate(startDate);
      setCurrentMonth(startDate);
      setIsStartDate(true);
    }
  }, [visible, startDate, endDate]);

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: '#3b82f6',
      selectedTextColor: '#ffffff',
    },
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    if (isStartDate) {
      setSelectedStartDate(day.dateString);
    } else {
      setSelectedEndDate(day.dateString);
    }
  };

  const handleApplyDateRange = () => {
    const finalStartDate =
      selectedStartDate <= selectedEndDate ? selectedStartDate : selectedEndDate;
    const finalEndDate = selectedStartDate <= selectedEndDate ? selectedEndDate : selectedStartDate;

    onApply(finalStartDate, finalEndDate);
    onClose();
  };

  const handleStartDatePress = () => {
    setSelectedDate(selectedStartDate);
    setCurrentMonth(selectedStartDate);
    setIsStartDate(true);
  };

  const handleEndDatePress = () => {
    setSelectedDate(selectedEndDate);
    setCurrentMonth(selectedEndDate);
    setIsStartDate(false);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        onPress={onClose}
        className="flex-1 justify-center bg-black/50"
        activeOpacity={1}>
        <TouchableOpacity activeOpacity={1}>
          <View className="mx-6 overflow-hidden rounded-3xl bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-gray-100 p-6">
              <View className="flex-row items-center">
                <Pressable
                  className={`rounded-full px-4 py-2 ${isStartDate ? 'bg-blue-500' : 'bg-gray-50'}`}
                  onPress={handleStartDatePress}>
                  <Text
                    className={`text-sm font-medium ${isStartDate ? 'text-white' : 'text-blue-500'}`}>
                    {formatDate(selectedStartDate)}
                  </Text>
                </Pressable>

                <Text className="mx-3 text-sm text-gray-400">đến</Text>

                <Pressable
                  className={`rounded-full px-4 py-2 ${!isStartDate ? 'bg-blue-500' : 'bg-gray-50'}`}
                  onPress={handleEndDatePress}>
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

            {/* Calendar */}
            <View className="p-6">
              <MyCalendar
                markingType="dot"
                markedDates={markedDates}
                onDayPress={handleDayPress}
                current={currentMonth}
                key={currentMonth}
              />

              {/* Confirm Button */}
              <TouchableOpacity
                className="mt-6 items-center rounded-2xl bg-blue-500 py-4 shadow-sm"
                onPress={handleApplyDateRange}>
                <Text className="text-base font-semibold text-white">
                  {confirmText || t('common.button.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default DateRangePicker;
