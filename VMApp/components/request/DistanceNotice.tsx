import React from 'react';
import { View, Text } from 'react-native';

interface DistanceNoticeProps {
  show: boolean;
}

export const DistanceNotice: React.FC<DistanceNoticeProps> = ({ show }) => {
  if (!show) return null;

  return (
    <View className="my-2 rounded-xl bg-blue-50 p-4">
      <Text className="mb-1 text-sm font-medium text-blue-900">Lưu ý:</Text>
      <Text className="text-sm text-blue-700">
        • Khoảng cách dự kiến được tính bằng tổng khoảng cách đường thẳng giữa các điểm dừng theo
        thứ tự hành trình (ví dụ: A → B → C). Con số này chỉ mang tính tham khảo và có thể khác với
        khoảng cách thực tế di chuyển. Hệ thống sẽ tính lại khoảng cách thực tế sau khi hoàn tất
        chuyến đi.
      </Text>
    </View>
  );
};