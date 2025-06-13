import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { View, Text } from 'react-native';

const WarningNote = () => {
  return (
    <View className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <View className="flex-row items-start">
        <View className="mr-3 mt-0.5">
          <FontAwesomeIcon icon={faWarning} size={18} color="#D97706" />
        </View>
        <View className="flex-1">
          <Text className="mb-2 text-sm font-semibold text-amber-800">Lưu ý quan trọng:</Text>
          <View className="space-y-1">
            <Text className="text-sm text-amber-700">
              • Chụp ảnh tại mỗi điểm dừng theo đúng thứ tự
            </Text>
            <Text className="text-sm text-amber-700">
              • Đảm bảo vị trí GPS chính xác tại mỗi điểm
            </Text>
            <Text className="text-sm text-amber-700">
              • Ghi chú rõ ràng về tình hình tại mỗi điểm
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WarningNote;
