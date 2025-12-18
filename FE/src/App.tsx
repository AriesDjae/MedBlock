import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WalletProvider } from './context/WalletContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import PatientDataRecording from './pages/PatientDataRecording';
import BlockchainExplorer from './pages/BlockchainExplorer';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';

// Helper to Protect Routes
const ProtectedRoute = ({ children, roleRequired }: { children: JSX.Element, roleRequired: 'doctor' | 'patient' }) => {
  // We can't use the hook here directly inside the render logic easily without separating components, 
  // but for simplicity in your structure, we will handle protection inside the pages or via Navigation.
  // For now, let's keep the routing simple and handle hiding logic in Navigation/Landing.
  return children;
};

function App() {
  return (
    // 👇 THIS <WalletProvider> IS CRITICAL. IF IT IS MISSING, LOGIN WON'T WORK.
    <WalletProvider> 
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navigation />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/patient-records" element={<PatientDataRecording />} />
            <Route path="/explorer" element={<BlockchainExplorer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </WalletProvider>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-white mb-4">404</h1>
      <p className="text-xl text-gray-300 mb-8">Page not found</p>
      <a href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
        Back to Home
      </a>
    </div>
  );
}

export default App;
