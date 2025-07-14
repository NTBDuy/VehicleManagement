import { Text, View } from 'react-native';
import RequestItem from '../request/HistoryRequestItem';

interface Props {
  title: string;
  chart?: any;

  showRequest?: boolean;
  stat?: any;
  maxValue?: number;
}

const StatSection = ({ title, chart, showRequest = false, stat, maxValue }: Props) => (
  <View className="mb-2 overflow-hidden rounded-2xl bg-white shadow-sm">
    <View className="bg-gray-50 px-4 py-3">
      <Text className="text-lg font-semibold text-gray-800">{title}</Text>
    </View>
    {chart}
    {showRequest && (
      <View className="-mb-4 p-4">
        <View>
          {stat.slice(0, maxValue).map((item: any) => (
            <RequestItem item={item} key={item.requestId} />
          ))}
        </View>
      </View>
    )}
  </View>
);

export default StatSection;
