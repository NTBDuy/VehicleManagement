// utils/toastConfig.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BaseToast, ErrorToast, ToastConfigParams } from 'react-native-toast-message';

interface CustomToastProps {
  text1?: string;
  text2?: string;
  onPress?: () => void;
}

const CustomSuccessToast: React.FC<ToastConfigParams<any>> = ({ text1, text2, onPress }) => (
  <TouchableOpacity 
    style={[styles.toastContainer, styles.successToast]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.iconContainer}>
      <Text style={styles.successIcon}>✓</Text>
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{text1}</Text>
      {text2 && <Text style={styles.subtitle}>{text2}</Text>}
    </View>
  </TouchableOpacity>
);

const CustomErrorToast: React.FC<ToastConfigParams<any>> = ({ text1, text2, onPress }) => (
  <TouchableOpacity 
    style={[styles.toastContainer, styles.errorToast]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.iconContainer}>
      <Text style={styles.errorIcon}>✕</Text>
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{text1}</Text>
      {text2 && <Text style={styles.subtitle}>{text2}</Text>}
    </View>
  </TouchableOpacity>
);

const CustomInfoToast: React.FC<ToastConfigParams<any>> = ({ text1, text2, onPress }) => (
  <TouchableOpacity 
    style={[styles.toastContainer, styles.infoToast]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.iconContainer}>
      <Text style={styles.infoIcon}>ℹ</Text>
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{text1}</Text>
      {text2 && <Text style={styles.subtitle}>{text2}</Text>}
    </View>
  </TouchableOpacity>
);

export const toastConfig = {
  success: (props: ToastConfigParams<any>) => <CustomSuccessToast {...props} />,
  error: (props: ToastConfigParams<any>) => <CustomErrorToast {...props} />,
  info: (props: ToastConfigParams<any>) => <CustomInfoToast {...props} />,
  
  defaultSuccess: (props: ToastConfigParams<any>) => (
    <BaseToast
      {...props}
      style={styles.defaultSuccessToast}
      contentContainerStyle={styles.defaultContentContainer}
      text1Style={styles.defaultTitle}
      text2Style={styles.defaultSubtitle}
    />
  ),
  
  defaultError: (props: ToastConfigParams<any>) => (
    <ErrorToast
      {...props}
      style={styles.defaultErrorToast}
      contentContainerStyle={styles.defaultContentContainer}
      text1Style={styles.defaultTitle}
      text2Style={styles.defaultSubtitle}
    />
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    height: 60,
    width: '90%',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successToast: {
    backgroundColor: '#4CAF50',
  },
  errorToast: {
    backgroundColor: '#F44336',
  },
  infoToast: {
    backgroundColor: '#2196F3',
  },
  iconContainer: {
    marginRight: 12,
  },
  successIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  // Default toast styles
  defaultSuccessToast: {
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 5,
    backgroundColor: 'white',
  },
  defaultErrorToast: {
    borderLeftColor: '#F44336',
    borderLeftWidth: 5,
    backgroundColor: 'white',
  },
  defaultContentContainer: {
    paddingHorizontal: 15,
  },
  defaultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  defaultSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});