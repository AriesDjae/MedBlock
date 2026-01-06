import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WalletProvider } from './context/WalletContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import PatientDataRecording from './pages/PatientDataRecording';
import BlockchainExplorer from './pages/BlockchainExplorer';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import PatientConsentPage from './pages/Patient/PatientConsentPage';
import ContractTestPage from './pages/ContractTestPage';
import RecordExplorer from './pages/Doctor/RecordExplorer';

function App() {
  return (
    <WalletProvider>
      <Router>
        <ErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Navigation />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/patient-records" element={<PatientDataRecording />} />
              <Route path="/doctor-records" element={<RecordExplorer />} />
              <Route path="/consent" element={<PatientConsentPage />} />
              <Route path="/explorer" element={<BlockchainExplorer />} />
              <Route path="/test-contract" element={<ContractTestPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </ErrorBoundary>
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
