import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import Header from 'components/HeaderComponent';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDays, faCarSide, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import Vehicle from 'types/Vehicle';
import vehicleData from '../../data/vehicle.json';
import RequestDatePicker from 'components/RequestDatePicker';
import RequestVehiclePicker from 'components/RequestVehiclePicker';
import RequestConfirm from 'components/RequestConfirm';

const vehicles: Vehicle[] = vehicleData;

const Booking = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [isMultiDayTrip, setIsMultiDayTrip] = useState(false);
  const [avaibleVehicle, setAvailbleVehicle] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>();
  const [purpose, setPurpose] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [isAssignDriver, setIsAssignDriver] = useState(false);

  useEffect(() => {
    if (vehicles) {
      getAvailbleVehicle();
    }
  }, [vehicles]);

  const tabs = [
    { id: 0, title: 'Choose Date', icon: faCalendarDays },
    { id: 1, title: 'Choose Vehicle', icon: faCarSide },
    { id: 2, title: 'Purpose & Confirm', icon: faCalendarCheck },
  ];

  const getAvailbleVehicle = () => {
    const data = vehicles.filter((item) => item.Status === 0);
    return setAvailbleVehicle(data);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderDateComponent();
      case 1:
        return renderVehicleComponent();
      case 2:
        return renderConfirmComponent();
      default:
        return renderDateComponent();
    }
  };

  const renderDateComponent = () => (
    <RequestDatePicker
      isMultiDayTrip={isMultiDayTrip}
      setIsMultiDayTrip={setIsMultiDayTrip}
      startDate={startDate}
      endDate={endDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
    />
  );

  const renderVehicleComponent = () => (
    <RequestVehiclePicker
      avaibleVehicle={avaibleVehicle}
      setSelectedVehicle={setSelectedVehicle}
      selectedVehicle={selectedVehicle}
    />
  );

  const renderConfirmComponent = () => (
    <RequestConfirm
      startDate={startDate}
      endDate={endDate}
      selectedVehicle={selectedVehicle}
      selectedPurpose={selectedPurpose}
      setSelectedPurpose={setSelectedPurpose}
      purpose={purpose}
      setPurpose={setPurpose}
      isAssignDriver={isAssignDriver}
      setIsAssignDriver={setIsAssignDriver}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header title="Booking" />
      <View className="mt-4 flex-1 px-6">
        <View className="mb-4 overflow-hidden rounded-2xl">
          <View className="flex-row">
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                className={`flex-1 items-center py-4`}
                onPress={() => setActiveTab(tab.id)}>
                <View className="flex-row items-center">
                  <View
                    className={`mt-2 h-[1] ${
                      activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-600'
                    } mr-1 w-12`}></View>
                  <FontAwesomeIcon
                    icon={tab.icon}
                    color={activeTab === tab.id ? '#3b82f6' : '#6b7280'}
                    size={20}
                  />
                  <View
                    className={`mt-2 h-[1] ${
                      activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-600'
                    } ml-1 w-12`}></View>
                </View>
                <Text
                  className={`mt-1 text-xs font-medium ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-600'
                  }`}>
                  {tab.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View className="mb-24 flex-1">{renderTabContent()}</View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 bg-gray-50 px-6 pb-12">
        {activeTab === 0 && (
          <Pressable
            className="mt-4 w-full rounded-2xl bg-blue-400 py-4 active:bg-blue-500"
            onPress={() => setActiveTab(activeTab + 1)}>
            <Text className="text-center text-lg font-bold text-white">Next</Text>
          </Pressable>
        )}
        {activeTab === 1 && (
          <View className="flex-row items-center justify-between">
            <Pressable
              className="mt-4 w-[48%] rounded-2xl bg-gray-400 py-4 active:bg-gray-500"
              onPress={() => setActiveTab(activeTab - 1)}>
              <Text className="text-center text-lg font-bold text-white">Back</Text>
            </Pressable>

            <Pressable
              className="mt-4 w-[48%] rounded-2xl bg-blue-400 py-4 active:bg-blue-500"
              onPress={() => setActiveTab(activeTab + 1)}>
              <Text className="text-center text-lg font-bold text-white">Next</Text>
            </Pressable>
          </View>
        )}
        {activeTab === 2 && (
          <View className="flex-row items-center justify-between">
            <Pressable
              className="mt-4 w-[48%] rounded-2xl bg-gray-400 py-4 active:bg-gray-500"
              onPress={() => setActiveTab(activeTab - 1)}>
              <Text className="text-center text-lg font-bold text-white">Back</Text>
            </Pressable>

            <Pressable
              className="mt-4 w-[48%] rounded-2xl bg-blue-400 py-4 active:bg-blue-500"
              onPress={() => {}}>
              <Text className="text-center text-lg font-bold text-white">Confirm</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Booking;
