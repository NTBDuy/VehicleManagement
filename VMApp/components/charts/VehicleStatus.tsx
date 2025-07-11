import { chartConfig } from '@/config/charConfig';
import Vehicle from '@/types/Vehicle';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import EmptyList from '../ui/EmptyListComponent';
import StatItem from '../ui/StatItemComponent';

interface Props {
  vehicles: Vehicle[];
}

const screenWidth = Dimensions.get('window').width;

const VehicleStatus = ({ vehicles }: Props) => {
  const { t } = useTranslation();

  const vehicleStat = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter((request) => request.status === 0).length;
    const inUse = vehicles.filter((request) => request.status === 1).length;
    const underMaintenance = vehicles.filter((request) => request.status === 2).length;
    return { total, available, inUse, underMaintenance };
  }, [vehicles]);

  const vehicleChartData = [
    {
      name: t('common.status.available'),
      count: vehicleStat.available,
      color: '#10b981',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.inUse'),
      count: vehicleStat.inUse,
      color: '#3b82f6',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.maintenance'),
      count: vehicleStat.underMaintenance,
      color: '#ff7a04',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
  ].filter((item) => item.count > 0);

  return (
    <View className="p-4">
      <StatItem label={t('common.status.total')} value={vehicleStat.total} />
      <StatItem
        label={t('common.status.available')}
        value={vehicleStat.available}
        status="available"
      />
      <StatItem label={t('common.status.inUse')} value={vehicleStat.inUse} status="inUse" />
      <StatItem
        label={t('common.status.maintenance')}
        value={vehicleStat.underMaintenance}
        status="underMaintenance"
      />
      <View className="my-4 border-t border-gray-200"></View>
      {vehicleStat.total > 0 && vehicleChartData.length > 0 ? (
        <View className="items-center">
          <PieChart
            data={vehicleChartData}
            width={screenWidth - 24}
            height={200}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="2"
            center={[32, 0]}
            absolute={false}
            hasLegend={true}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              paddingRight: '124%',
            }}
          />
        </View>
      ) : (
        <EmptyList />
      )}
    </View>
  );
};

export default VehicleStatus;
