import { View, Text, SafeAreaView } from 'react-native';
import React from 'react';
import HeaderComponent from 'components/HeaderComponent';

const ReportScreen = () => {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <HeaderComponent title='Report and Analysis'/>
    </SafeAreaView>
  );
};

export default ReportScreen;
