import { View, Text, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import Header from '@/components/layout/HeaderComponent';

const FindLocationScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView>
      <Header
        title="Tìm địa điểm"
        searchSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        placeholder="Tìm theo địa chỉ"
        handleClearFilters={handleClearFilters}
        backBtn
      />
    </SafeAreaView>
  );
};

export default FindLocationScreen;
