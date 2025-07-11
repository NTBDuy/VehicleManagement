import { chartConfig } from '@/config/charConfig';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import Request from '@/types/Request';
import StatItem from '../ui/StatItemComponent';
import EmptyList from '../ui/EmptyListComponent';

type Props = {
  request: Request[];
  showDetails?: boolean;
};

const screenWidth = Dimensions.get('window').width;

const RequestStatusStatisticChart = ({ request, showDetails = false }: Props) => {
  const { t } = useTranslation();

  const requestStat = useMemo(() => {
    const total = request.length;
    const pending = request.filter((request) => request.status === 0).length;
    const approved = request.filter((request) => request.status === 1).length;
    const rejected = request.filter((request) => request.status === 2).length;
    const cancelled = request.filter((request) => request.status === 3).length;
    const inProgress = request.filter((request) => request.status === 4).length;
    const done = request.filter((request) => request.status === 5).length;
    return { total, pending, approved, rejected, cancelled, inProgress, done };
  }, [request]);

  const requestChartData = [
    {
      name: t('common.status.pending'),
      count: requestStat.pending,
      color: '#e17100',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.approved'),
      count: requestStat.approved,
      color: '#009966',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.rejected'),
      count: requestStat.rejected,
      color: '#e7000b',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.cancelled'),
      count: requestStat.cancelled,
      color: '#45556c',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.inProgress'),
      count: requestStat.inProgress,
      color: '#155dfc',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
    {
      name: t('common.status.done'),
      count: requestStat.done,
      color: '#00a63e',
      legendFontColor: '#374151',
      legendFontSize: 14,
    },
  ].filter((item) => item.count > 0);

  return (
    <View className="p-4">
      {showDetails && (
        <View>
          <StatItem label={t('common.status.total')} value={requestStat.total} />
          <StatItem
            label={t('common.status.pending')}
            value={requestStat.pending}
            status="pending"
          />
          <StatItem
            label={t('common.status.approved')}
            value={requestStat.approved}
            status="approved"
          />
          <StatItem
            label={t('common.status.rejected')}
            value={requestStat.rejected}
            status="rejected"
          />
          <StatItem
            label={t('common.status.cancelled')}
            value={requestStat.cancelled}
            status="cancelled"
          />
          <StatItem
            label={t('common.status.inProgress')}
            value={requestStat.inProgress}
            status="inProgress"
          />
          <StatItem label={t('common.status.done')} value={requestStat.done} status="done" />
          <View className="my-4 border-t border-gray-200"></View>
        </View>
      )}

      {requestStat.total > 0 ? (
        <View className="items-center">
          <PieChart
            data={requestChartData}
            width={screenWidth - 48}
            height={200}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="0"
            center={[0, 12]}
            absolute={false}
            hasLegend={true}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      ) : (
        <EmptyList />
      )}
    </View>
  );
};

export default RequestStatusStatisticChart;
