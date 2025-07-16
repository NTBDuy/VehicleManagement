import { formatDate } from '@/utils/datetimeUtils';
import { faCalendarAlt, faChevronRight, faFilter, faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import Request from '@/types/Request';

import RequestDailyStatisticChart from '@/components/charts/RequestDailyStatistic';
import RequestStatisticChart from '@/components/charts/RequestStatusStatistic';
import RequestUserUsageChart from '@/components/charts/RequestUserUsage';
import RequestVehicleMostUsageChart from '@/components/charts/RequestVehicleMostUsage';
import Header from '@/components/layout/HeaderComponent';
import DateRangePicker from '@/components/modal/DateRangePicker';
import RequestStatisticItem from '@/components/request/RequestStatisticItem';
import LoadingData from '@/components/ui/LoadingData';
import { StatisticService } from '@/services/statisticService';
import { DailyData, UserUsageData, VehicleUsageData } from '@/types/Statistic';
import { FlashList } from '@shopify/flash-list';

type ItemDropDownPicker = { label: string; value: number };

const StatusItems: ItemDropDownPicker[] = [
  { label: 'Tất cả', value: 6 },
  { label: 'Chờ duyệt', value: 0 },
  { label: 'Đã duyệt', value: 1 },
  { label: 'Đã từ chối', value: 2 },
  { label: 'Đã huỷ', value: 3 },
  { label: 'Đang tiến hành', value: 4 },
  { label: 'Hoàn thành', value: 5 },
];

const FilterItems: ItemDropDownPicker[] = [
  { label: 'Số yêu cầu theo trạng thái', value: 0 },
  { label: 'Số lượt yêu cầu theo ngày', value: 1 },
  { label: 'Phương tiện sử dụng nhiều nhất', value: 2 },
  { label: 'Người dùng đặt yêu cầu nhiều nhất', value: 3 },
];

const RequestStatistic = () => {
  const { t } = useTranslation();

  const [request, setRequest] = useState<Request[]>([]);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate] = useState('2025-07-01');

  const [openStatusDropDown, setOpenStatusDropDown] = useState(false);
  const [openFilterDropDown, setOpenFilterDropDown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(6);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [statusItem, setStatusItem] = useState(StatusItems);
  const [filterItem, setFilterItem] = useState(FilterItems);

  const [vehicleData, setVehicleData] = useState<VehicleUsageData[]>([]);
  const [userData, setUserData] = useState<UserUsageData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  useEffect(() => {
    fetchChartData();
  }, [startDate, endDate, selectedStatus, selectedFilter]);

  const getStatistic = async () => {
    const resultRequestStat =
      selectedStatus === 6
        ? await StatisticService.getRequestStatistic(startDate, endDate)
        : await StatisticService.getRequestStatistic(startDate, endDate, selectedStatus);
    setRequest(resultRequestStat);
  };

  const fetchChartData = async () => {
    setIsLoadingChart(true);
    try {
      switch (selectedFilter) {
        case 0:
          getStatistic();
          break;
        case 1:
          getStatistic();
          const resultDailyData =
            selectedStatus === 6
              ? await StatisticService.getStatRequestPerDay(startDate, endDate)
              : await StatisticService.getStatRequestPerDay(startDate, endDate, selectedStatus);
          setDailyData(resultDailyData);
          break;
        case 2:
          getStatistic();
          const resultVehicleUsage =
            selectedStatus === 6
              ? await StatisticService.getStatVehicleMostUsage(startDate, endDate)
              : await StatisticService.getStatVehicleMostUsage(startDate, endDate, selectedStatus);
          setVehicleData(resultVehicleUsage);
          break;
        case 3:
          getStatistic();
          const resultUserUsage =
            selectedStatus === 6
              ? await StatisticService.getStatUserMostUsage(startDate, endDate)
              : await StatisticService.getStatUserMostUsage(startDate, endDate, selectedStatus);
          setUserData(resultUserUsage);
          break;
        default:
          return;
      }
    } catch (error) {
      console.error('Fetch request failed:', error);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const handleDateRangeApply = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const renderRequestItem = (item: Request) => (
    <RequestStatisticItem key={item.requestId} item={item} />
  );

  const renderChart = () => {
    if (isLoadingChart) {
      return <LoadingData />;
    }

    switch (selectedFilter) {
      case 0:
        return <RequestStatisticChart request={request} />;
      case 1:
        if (dailyData.length > 0) {
          return <RequestDailyStatisticChart dailyData={dailyData} />;
        }
      case 2:
        if (vehicleData.length > 0) {
          return <RequestVehicleMostUsageChart vehicleData={vehicleData} />;
        }
      case 3:
        if (userData.length > 0) {
          return <RequestUserUsageChart userData={userData} />;
        }
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/** Header - tiêu đề */}
      <Header title="Phân tích yêu cầu" />

      {/** Body - nội dung */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {/** Date Picker - Chọn ngày */}
        <Pressable
          onPress={() => setDatePickerVisible(true)}
          className="mx-4 mt-4 flex-row items-center rounded-2xl bg-white px-4 py-4 shadow-sm"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
          }}>
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <FontAwesomeIcon icon={faCalendarAlt} size={16} color="#3B82F6" />
          </View>
          <Text className="text-base font-medium text-gray-900">
            {formatDate(startDate)} - {formatDate(endDate)}
          </Text>
        </Pressable>

        {/** Filter by status - Chọn trạng thái */}
        <View
          className="mx-4 mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
          }}>
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <FontAwesomeIcon icon={faList} size={16} color="#10B981" />
            </View>
            <DropDownPicker
              open={openStatusDropDown}
              value={selectedStatus}
              items={statusItem}
              setOpen={setOpenStatusDropDown}
              setValue={setSelectedStatus}
              setItems={setStatusItem}
              style={{
                borderWidth: 0,
                backgroundColor: 'transparent',
                padding: 0,
                flex: 1,
              }}
              dropDownContainerStyle={{
                borderWidth: 0,
                backgroundColor: 'white',
                borderRadius: 16,
                marginTop: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
              textStyle={{ fontSize: 16, color: '#1F2937', fontWeight: '500' }}
              showArrowIcon
              ArrowDownIconComponent={() => (
                <FontAwesomeIcon icon={faChevronRight} size={14} color="#9CA3AF" />
              )}
              listMode="MODAL"
              modalContentContainerStyle={{
                backgroundColor: '#fff',
                margin: 20,
              }}
            />
          </View>
        </View>

        {/** Statistical chart - Biểu đồ thống kê */}
        <View
          className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
          }}>
          <Pressable
            onPress={() => setOpenFilterDropDown(true)}
            className="mb-1 flex-row items-center justify-between">
            <Text className="ml-3 text-lg font-semibold text-gray-900">Biểu đồ thống kê</Text>

            {/* <TouchableOpacity onPress={() => setOpenFilterDropDown(true)} className="ml-auto mr-3"> */}
            <View className="ml-auto mr-3"></View>
            <FontAwesomeIcon icon={faFilter} size={18} color="#444444" />
            {/* </TouchableOpacity> */}
          </Pressable>

          <View className="mb-4 flex-row items-center">
            <Text className="ml-3 text-sm text-gray-600">{FilterItems[selectedFilter].label}</Text>
          </View>

          {renderChart()}
        </View>

        {/** Request List - Danh sách yêu cầu */}
        <View className="mt-4 flex-1">
          <View className="mx-4 mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-900">Danh sách yêu cầu</Text>
            <Text className="text-sm text-gray-500">{request.length} mục</Text>
          </View>

          {request.length > 0 ? (
            <FlashList
              data={request}
              renderItem={({ item }) => renderRequestItem(item)}
              keyExtractor={(item) => item.requestId.toString()}
              estimatedItemSize={80}
            />
          ) : (
            <View className="mx-4 mt-8 items-center justify-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <FontAwesomeIcon icon={faFilter} size={24} color="#9CA3AF" />
              </View>
              <Text className="mb-2 text-base font-medium text-gray-500">Không có dữ liệu</Text>
              <Text className="text-center text-sm text-gray-400">
                Thay đổi bộ lọc hoặc khoảng thời gian để xem kết quả
              </Text>
            </View>
          )}
        </View>

        {/** DropDown - Danh sách chọn loại biểu đồ */}
        {openFilterDropDown && (
          <DropDownPicker
            open={openFilterDropDown}
            value={selectedFilter}
            items={filterItem}
            setOpen={setOpenFilterDropDown}
            setValue={setSelectedFilter}
            setItems={setFilterItem}
            style={{
              height: 0,
              padding: 0,
              borderWidth: 0,
            }}
            dropDownDirection="AUTO"
            showArrowIcon={false}
            showTickIcon={true}
            listMode="MODAL"
            modalContentContainerStyle={{
              backgroundColor: '#fff',
              margin: 20,
            }}
            labelStyle={{ display: 'none' }}
          />
        )}
      </ScrollView>

      {/** Date Range Picker Modal */}
      <DateRangePicker
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        startDate={startDate}
        endDate={endDate}
        onApply={handleDateRangeApply}
      />
    </SafeAreaView>
  );
};

export default RequestStatistic;
