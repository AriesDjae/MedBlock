import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import PatientDataRecording from './pages/PatientDataRecording';
import BlockchainExplorer from './pages/BlockchainExplorer';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navigation />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/patient-records" element={<PatientDataRecording />} />
            <Route path="/explorer" element={<BlockchainExplorer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
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
