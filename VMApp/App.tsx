import AppContent from 'navigation/AppNavigator';
import './global.css';
import { AuthProvider } from 'contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
