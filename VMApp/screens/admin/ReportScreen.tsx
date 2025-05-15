import { View, Text, SafeAreaView } from 'react-native';
import React from 'react';
import Header from 'components/Header';

const ReportScreen = () => {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <Header title='Report and Analysis'/>
    </SafeAreaView>
  );
};

export default ReportScreen;
