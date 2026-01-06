import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserCircle, Upload, FileText, Calendar, User, Wallet, Loader2, Stethoscope, ArrowLeft, CheckCircle } from 'lucide-react';
import { registerUser } from '../services/api';
import { connectWallet } from '../utils/wallet';
import { useWallet } from '../context/WalletContext';
import { getMedblocContract } from '../services/medbloc';

export default function RegistrationPage() {
  const [signer, setSigner] = useState<any>(null);
  const navigate = useNavigate();
  const { login } = useWallet();
  
  // Tabs: 'patient' or 'doctor'
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Unified Form State (Used for BOTH Doctor and Patient)
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    gender: 'male'
  });

  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  // 1. Helper to Connect Wallet (use shared util)
  const handleConnect = async () => {
    try {
      const res = await connectWallet();
      setSigner(res.signer);
      setWalletAddress(res.address);
    } catch (err) {
      alert(String(err));
    }
  };

  // 2. Handle Submissions
  const handleSubmit = async () => {
    // Auto-connect if not connected
    if (!walletAddress) {
      await handleConnect();
      // In a real app we'd wait for state update, but for demo we proceed if user approves
      if (!(window as any).ethereum?.selectedAddress) return;
    }

    setIsLoading(true);
    
    try {
      // SIMULATE "BLOCKCHAIN" DELAY
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (!signer) {
        await handleConnect();
      }

      if (!signer && !(window as any).ethereum) {
        throw new Error('No signer available');
      }

      // call backend register
      const effectiveSigner = signer || (await connectWallet()).signer;
      const res = await registerUser(effectiveSigner, formData.fullName);

      // also register on-chain via smart contract
      const contract = await getMedblocContract();

      if (activeTab === 'patient') {
        const tx = await contract.registerPatient();
        await tx.wait();
        alert("Patient Account Created: " + JSON.stringify(res));
        // Mark user as logged in (updates nav + landing page)
        login('patient');
        navigate('/explorer');
      } else {
        const tx = await contract.registerDoctor();
        await tx.wait();
        alert("Doctor Account Created: " + JSON.stringify(res));
        login('doctor');
        navigate('/patient-records');
      }
    } catch (error: any) {
      alert(error?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background (Same as Login) */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
        </Link>

        <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-8 backdrop-blur-sm shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 mb-8">
            {activeTab === 'patient' 
              ? "Join as a Patient to manage your health records" 
              : "Join as a Doctor to practice in the network"}
          </p>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setActiveTab('patient')}
              className={`p-4 rounded-lg border transition-all duration-200 flex items-center justify-center gap-3 ${
                activeTab === 'patient'
                  ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-800/50 border-slate-600 text-gray-400 hover:border-slate-500'
              }`}
            >
              <UserCircle className="w-6 h-6" />
              <span className="font-semibold text-lg">Patient</span>
            </button>

            <button
              onClick={() => setActiveTab('doctor')}
              className={`p-4 rounded-lg border transition-all duration-200 flex items-center justify-center gap-3 ${
                activeTab === 'doctor'
                  ? 'bg-blue-500/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-800/50 border-slate-600 text-gray-400 hover:border-slate-500'
              }`}
            >
              <Stethoscope className="w-6 h-6" />
              <span className="font-semibold text-lg">Doctor</span>
            </button>
          </div>

          <div className="space-y-6">
              
              {/* Wallet Binder Display (Visible for Both) */}
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Connected Wallet</label>
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <Wallet className="w-5 h-5 text-blue-400" />
                  </div>
                  {walletAddress ? (
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-sm">{walletAddress}</span>
                       <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  ) : (
                    <button onClick={handleConnect} className="text-sm text-blue-400 hover:underline">
                      Click to Connect Wallet
                    </button>
                  )}
                </div>
              </div>

              {/* --- SHARED FORM FIELDS (For Both Doctor & Patient) --- */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500"
                    placeholder={activeTab === 'doctor' ? "Dr. Jane Doe" : "John Doe"}
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type="date"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500"
                      value={formData.birthDate}
                      onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                  <select 
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* --- DOCTOR ONLY: The "Gimmick" Upload --- */}
              {activeTab === 'doctor' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Medical License / Certificate</label>
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors group">
                        <input 
                            type="file" 
                            id="cert-upload" 
                            className="hidden" 
                            accept=".pdf,.jpg,.png"
                            onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                            {certificateFile ? (
                                <>
                                    <FileText className="w-10 h-10 text-green-400 mb-2"/>
                                    <span className="text-green-400 font-medium break-all">{certificateFile.name}</span>
                                    <span className="text-xs text-gray-500 mt-1">Ready for Verification</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-gray-500 group-hover:text-blue-400 transition-colors mb-2"/>
                                    <span className="text-gray-300 font-medium">Upload Document</span>
                                    <span className="text-xs text-gray-500 mt-1">PDF or Image (Max 5MB)</span>
                                </>
                            )}
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        * Uploading will trigger automated smart-contract verification.
                    </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full py-4 rounded-lg font-bold text-white transition-all transform hover:scale-[1.02] shadow-lg ${
                  activeTab === 'patient' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/20'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" /> 
                    {activeTab === 'doctor' ? "Verifying Credentials..." : "Creating Account..."}
                  </span>
                ) : (
                  `Register as ${activeTab === 'patient' ? 'Patient' : 'Doctor'}`
                )}
              </button>

          </div>
        </div>
      </div>
    </div>
  );
}