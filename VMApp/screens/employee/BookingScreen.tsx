import { View, Text, SafeAreaView, Platform, Pressable, Switch, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from 'components/HeaderComponent';
import DateTimePicker from '@react-native-community/datetimepicker';
import InfoRow from 'components/InfoRowComponent';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCalendarDays,
  faCarSide,
  faCalendarCheck,
  faCar,
  faTruckPickup,
  faVanShuttle,
  faEllipsisV,
} from '@fortawesome/free-solid-svg-icons';
import { formatDayMonth } from 'utils/datetimeUtils';
import InputField from 'components/InputFieldComponent';
import EmptyList from 'components/EmptyListComponent';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Vehicle from 'types/Vehicle';
import vehicleData from '../../data/vehicle.json';
import DropDownPicker from 'react-native-dropdown-picker';

const vehicles: Vehicle[] = vehicleData;

const Booking = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [purpose, setPurpose] = useState('');
  const [avaibleVehicle, setAvailbleVehicle] = useState<Vehicle[]>([]);

  const [isMultiDayTrip, setIsMultiDayTrip] = useState(false);
  const [isAssignDriver, setIsAssignDriver] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>();

  const [open, setOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [items, setItems] = useState([
    { label: 'Business trip', value: 'BusinessTrip' },
    { label: 'External meeting', value: 'ExternalMeeting' },
    { label: 'Pick up/drop off guests', value: 'Guests' },
    { label: 'Other', value: 'Other' },
  ]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (vehicles) {
      getAvailbleVehicle();
    }
  }, [vehicles]);

  const toggleSwitch = () => setIsMultiDayTrip((previousState) => !previousState);
  const toggleSwitchDriver = () => setIsAssignDriver((previousState) => !previousState);

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

  const onDayPress = (day: any) => {
    const date = day.dateString;

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate('');
    } else if (date < startDate) {
      setStartDate(date);
      setEndDate('');
    } else {
      setEndDate(date);
    }
  };

  const getMarkedDates = () => {
    let marked: { [date: string]: any } = {};
    if (startDate) {
      marked[startDate] = {
        startingDay: true,
        color: '#3b82f6',
        textColor: 'white',
      };
    }
    if (endDate) {
      marked[endDate] = {
        endingDay: true,
        color: '#3b82f6',
        textColor: 'white',
      };

      let current = new Date(startDate);
      while (current < new Date(endDate)) {
        current.setDate(current.getDate() + 1);
        const d = current.toISOString().split('T')[0];
        if (d !== endDate) {
          marked[d] = { color: '#93c5fd', textColor: 'black' };
        }
      }
    }

    return marked;
  };

  const renderDateComponent = () => (
    <View className="px-2">
      <View className="mb-4">
        <View className="mb-1 flex-row items-center">
          <Switch
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor={isMultiDayTrip ? '#fff' : '#f3f4f6'}
            ios_backgroundColor="#d1d5db"
            onValueChange={toggleSwitch}
            value={isMultiDayTrip}
            className="-m-2 scale-75"
          />
          <Text className="ml-2 text-sm text-gray-600">
            {isMultiDayTrip ? 'Multi-day trip' : 'Day trip'}
          </Text>
        </View>
      </View>
      {isMultiDayTrip ? (
        <InfoRow
          label="Date"
          value=""
          valueComponent={
            <View className="flex-row">
              <Text className="font-semibold text-gray-800">{formatDayMonth(startDate)} - </Text>
              <Text className="font-semibold text-gray-800">{formatDayMonth(endDate)}</Text>
            </View>
          }
        />
      ) : (
        <InfoRow label="Date" value={formatDayMonth(startDate)} />
      )}
      <View className="mt-4">
        <Calendar
          markingType={isMultiDayTrip ? 'period' : undefined}
          markedDates={
            isMultiDayTrip
              ? getMarkedDates()
              : {
                  [startDate]: { selected: true, disableTouchEvent: true },
                }
          }
          onDayPress={(day) => {
            isMultiDayTrip ? onDayPress(day) : setStartDate(day.dateString);
          }}
          theme={{
            textSectionTitleColor: '#94a3b8',
            selectedDayBackgroundColor: '#3b82f6',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#3b82f6',
            arrowColor: '#3b82f6',
            selectedDotColor: '#fff',
          }}
          minDate={today}
          style={{
            borderRadius: 12,
            overflow: 'hidden',
          }}
        />
      </View>
    </View>
  );

  /** Func: Get icon for each vehicle */
  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'Sedan':
        return faCar;
      case 'SUV':
        return faCarSide;
      case 'Truck':
        return faTruckPickup;
      case 'Van':
        return faVanShuttle;
      default:
        return faCar;
    }
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <Pressable
      onPress={() => setSelectedVehicle(item)}
      className={`mb-4 flex-row items-center rounded-2xl ${selectedVehicle == item ? 'bg-blue-100' : 'bg-gray-100'}  px-2 py-4`}>
      <View className="ml-2 mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-300">
        <Text className="text-xl font-semibold text-white">
          <FontAwesomeIcon icon={getVehicleTypeIcon(item.Type)} size={24} color="#0d4d87" />
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-bold">{item.LicensePlate}</Text>
        <Text className="text-sm">
          {item.Brand} {item.Model}
        </Text>
      </View>
    </Pressable>
  );

  const renderVehicleComponent = () => (
    <View className="px-2">
      <View className="mb-4">
        <View className="bg-gray-50 px-4 ">
          <Text className="text-lg font-semibold text-gray-800">Availbe Vehicle</Text>
        </View>
      </View>
      <View className="px-2 mb-20">
        <FlatList
          data={avaibleVehicle}
          renderItem={renderVehicleItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );

  const renderConfirmComponent = () => (
    <View>
      <View className="rounded-2xl bg-white">
        <View className="bg-gray-50 px-4 pb-3">
          <Text className="text-lg font-semibold text-gray-800">Request Information</Text>
        </View>

        <View className="p-4">
          <InfoRow
            label="Time"
            value=""
            valueComponent={
              <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                {formatDayMonth(startDate)} - {formatDayMonth(endDate)}
              </Text>
            }
          />
          <InfoRow
            label="Vehicle"
            value=""
            valueComponent={
              <Text className="max-w-[60%] text-right font-semibold text-gray-800">
                {selectedVehicle?.Brand} {selectedVehicle?.Model} #{selectedVehicle?.LicensePlate}
              </Text>
            }
            isLast
          />
        </View>
      </View>
      <View className="mt-4 rounded-2xl bg-white">
        <View className="bg-gray-50 px-4 pb-3">
          <Text className="text-lg font-semibold text-gray-800">Purpose</Text>
        </View>
        <View className="p-4">
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">Select a purpose</Text>
            <View className="z-10 rounded-lg border border-gray-300 bg-white">
              <DropDownPicker
                open={open}
                value={selectedPurpose}
                items={items}
                setOpen={setOpen}
                setValue={setSelectedPurpose}
                setItems={setItems}
                placeholder="Choose a Purpose..."
                style={{ borderColor: '#D1D5DB', borderRadius: 8 }}
                dropDownContainerStyle={{ borderColor: '#D1D5DB' }}
              />
            </View>
          </View>
          {selectedPurpose === 'Other' && (
            <InputField
              label="Detail Purpose"
              value={purpose}
              onChangeText={setPurpose}
              require={false}
            />
          )}
        </View>
      </View>
      <View className="mt-4 rounded-2xl bg-white">
        <View className="bg-gray-50 px-4 pb-3">
          <Text className="text-lg font-semibold text-gray-800">Driver</Text>
        </View>
        <View className="p-4">
          <View className="mb-2">
            <View className='justify-between flex-row items-center'>
              <Switch
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor={isAssignDriver ? '#fff' : '#f3f4f6'}
                ios_backgroundColor="#d1d5db"
                onValueChange={toggleSwitchDriver}
                value={isAssignDriver}
                className="-m-2 scale-75"
              />
              <Text className="max-w-[60%] text-right font-semibold text-gray-800">{isAssignDriver ? 'Assign a driver' : 'Drive by self'}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
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

      {/* Fixed button at bottom */}
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
