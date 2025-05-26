import { KeyboardAvoidingView, Platform } from 'react-native';
import AppContent from 'navigation/AppNavigator';
import './global.css';
import { AuthProvider } from 'contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from 'config/toastConfig';

export default function App() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <AuthProvider>
        <AppContent />
        <Toast config={toastConfig} />
      </AuthProvider>
    </KeyboardAvoidingView>
  );
}


