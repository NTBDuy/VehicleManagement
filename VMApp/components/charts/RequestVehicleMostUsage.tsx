import { chartConfig } from '@/config/charConfig';
import { useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { VehicleUsageData } from '@/types/Statistic';

const screenWidth = Dimensions.get('window').width;

interface Props {
  vehicleData: VehicleUsageData[];
  t: any;
}

const RequestVehicleMostUsageChart = ({ vehicleData, t }: Props) => {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
    distance: number;
  } | null>(null);

  const chartData = {
    labels: vehicleData.map((item) => item.licensePlate.replace(/^deleted_/, '')),
    datasets: [
      {
        data: vehicleData.map((item) => item.count),
        color: (opacity = 1) => `rgba(234,88,12, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: [t('statistic.times')],
  };

  const labels = vehicleData.map((item) => item.licensePlate.replace(/^deleted_/, ''));

  return (
    <ScrollView horizontal>
      <LineChart
        data={chartData}
        width={Math.max(screenWidth, labels.length * 20)}
        height={348}
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        onDataPointClick={({ value, index, x, y }) => {
          const selected = vehicleData[index];
          setTooltip({
            x,
            y,
            value,
            label: selected.licensePlate.replace(/^deleted_/, ''),
            distance: selected.totalDistance,
          });
        }}
        bezier
        style={{ marginLeft: -32 }}
      />

      {tooltip && (
        <View
          className="items-center justify-center"
          style={{
            position: 'absolute',
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 6,
            zIndex: 10,
            left: tooltip.x - 40,
            top: tooltip.y - 20,
          }}>
          <View
            className="rounded-2xl bg-white px-4 py-3 shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}>
            <Text className="mb-1 text-center text-xs text-gray-500">{tooltip.label}</Text>
            <Text className="text-center text-lg font-bold text-orange-600">
              {t('statistic.timeWithCount', { count: tooltip.value })}
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-700">{tooltip.distance} km</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default RequestVehicleMostUsageChart;
