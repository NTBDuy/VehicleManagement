import { View, Text, Switch, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';
import React, { useEffect, useState } from 'react';
import InfoRow from 'components/InfoRowComponent';
import { formatDayMonth } from 'utils/datetimeUtils';
import InputField from 'components/InputFieldComponent';
import Vehicle from 'types/Vehicle';
import DropDownPicker from 'react-native-dropdown-picker';

interface ConfirmComponentProps {
  startDate: string;
  endDate: string;
}

const RequestConfirm = ({ startDate, endDate }: ConfirmComponentProps) => {
  const [note, setNote] = useState('');
  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View>
        <InputField label="NOTE" value={note} onChangeText={setNote} />
      </View>
    </ScrollView>
  );
};

export default RequestConfirm;
