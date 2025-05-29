import { useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';

import InputField from 'components/InputFieldComponent';

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
