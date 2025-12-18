import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, Stethoscope, UserCircle, ArrowRight, Loader2, Shield } from 'lucide-react';
import { useWallet } from '../context/WalletContext'; // 👈 IMPORT THE HOOK

export default function LoginPage() {
  const navigate = useNavigate();
  
  // 1. GET THE GLOBAL FUNCTIONS
  const { connectWallet, login, walletAddress } = useWallet();

  // Local state only for UI loading/errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'patient' | null>(null);

  const handleLogin = async () => {
    if (!selectedRole) {
        setError("Please select a role (Doctor or Patient) first.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
        // Step 1: Connect Wallet (Trigger MetaMask)
        // We await this to ensure wallet is connected BEFORE we log them in
        await connectWallet();
        
        // Step 2: Update Global State (This makes the Nav bar update!)
        login(selectedRole);

        // Step 3: Redirect
        if (selectedRole === 'doctor') {
            navigate('/patient-records');
        } else {
            navigate('/explorer');
        }
    } catch (err) {
        console.error(err);
        setError("Failed to connect wallet. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Securely access your medical dashboard</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-8 backdrop-blur-sm shadow-xl">
          
          {error && (
             <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
               {error}
             </div>
          )}

          <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setSelectedRole('doctor'); setError(null); }}
                    className={`p-6 rounded-lg border transition-all duration-200 flex flex-col items-center gap-3 ${
                      selectedRole === 'doctor'
                        ? 'bg-blue-500/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-slate-800/50 border-slate-600 text-gray-400 hover:border-slate-500'
                    }`}
                  >
                    <Stethoscope className={`w-10 h-10 ${selectedRole === 'doctor' ? 'text-blue-400' : 'text-gray-500'}`} />
                    <span className="font-medium text-lg">Doctor</span>
                  </button>

                  <button
                    onClick={() => { setSelectedRole('patient'); setError(null); }}
                    className={`p-6 rounded-lg border transition-all duration-200 flex flex-col items-center gap-3 ${
                      selectedRole === 'patient'
                        ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-800/50 border-slate-600 text-gray-400 hover:border-slate-500'
                    }`}
                  >
                    <UserCircle className={`w-10 h-10 ${selectedRole === 'patient' ? 'text-cyan-400' : 'text-gray-500'}`} />
                    <span className="font-medium text-lg">Patient</span>
                  </button>
               </div>

               <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg text-white flex items-center justify-center gap-2 transition-all duration-200 ${
                    isLoading
                      ? 'bg-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/25'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      {/* Show address if already connected, otherwise Show 'Connect' */}
                      {walletAddress ? "Login now" : "Connect Wallet & Login"}
                    </>
                  )}
               </button>

               <div className="pt-4 text-center border-t border-slate-700">
                  <p className="text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
                      Register here
                    </Link>
                  </p>
               </div>
          </div>
        </div>
      </div>
    </div>
  );
}