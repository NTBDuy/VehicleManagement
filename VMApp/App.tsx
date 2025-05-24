import AppContent from 'navigation/AppNavigator';
import './global.css';
import { AuthProvider } from 'contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from 'config/toastConfig';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}
