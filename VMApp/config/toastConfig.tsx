import React from 'react';
import { Text, View } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'green' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold'
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: 'red' }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold'
      }}
      text2Style={{
        fontSize: 14
      }}
    />
  ),
};
