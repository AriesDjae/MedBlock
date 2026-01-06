import { useState, useEffect } from 'react';
import { getMedblocContract } from '../services/medbloc';
import { getSigner } from '../services/web3';
import { MEDBLOC_CONTRACT } from '../contracts/medbloc';
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink,
  UserCircle,
  Stethoscope,
  Key,
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react';

type TestResult = {
  success: boolean;
  message: string;
  txHash?: string;
  data?: any;
};

export default function ContractTestPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  // Form inputs
  const [doctorAddress, setDoctorAddress] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [ipfsCid, setIpfsCid] = useState('');
  const [recordId, setRecordId] = useState('');
  const [checkPatientAddress, setCheckPatientAddress] = useState('');
  const [checkDoctorAddress, setCheckDoctorAddress] = useState('');
  const [accessPatientAddress, setAccessPatientAddress] = useState('');
  const [accessDoctorAddress, setAccessDoctorAddress] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const signer = await getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
      setWalletAddress(null);
    }
  };

  const handleTest = async (testFn: () => Promise<any>, description: string) => {
    if (!isConnected) {
      setResult({ success: false, message: 'Please connect your wallet first' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const contract = await getMedblocContract();
      const data = await testFn();
      setResult({ 
        success: true, 
        message: `${description} successful!`,
        data,
        txHash: data?.hash || data?.txHash
      });
    } catch (err: any) {
      setResult({ 
        success: false, 
        message: `${description} failed: ${err.message || err.reason || String(err)}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Registration functions
  const testRegisterPatient = () => handleTest(
    async () => {
      const contract = await getMedblocContract();
      const tx = await contract.registerPatient();
      await tx.wait();
      return { hash: tx.hash };
    },
    'Register Patient'
  );

  const testRegisterDoctor = () => handleTest(
    async () => {
      const contract = await getMedblocContract();
      const tx = await contract.registerDoctor();
      await tx.wait();
      return { hash: tx.hash };
    },
    'Register Doctor'
  );

  // Access control functions
  const testGrantAccess = () => handleTest(
    async () => {
      if (!doctorAddress) throw new Error('Doctor address required');
      const contract = await getMedblocContract();
      const tx = await contract.grantAccess(doctorAddress);
      await tx.wait();
      return { hash: tx.hash };
    },
    'Grant Access'
  );

  const testRevokeAccess = () => handleTest(
    async () => {
      if (!doctorAddress) throw new Error('Doctor address required');
      const contract = await getMedblocContract();
      const tx = await contract.revokeAccess(doctorAddress);
      await tx.wait();
      return { hash: tx.hash };
    },
    'Revoke Access'
  );

  // Record functions
  const testAddRecord = () => handleTest(
    async () => {
      if (!patientAddress) throw new Error('Patient address required');
      if (!ipfsCid) throw new Error('IPFS CID required');
      const contract = await getMedblocContract();
      const tx = await contract.addRecord(patientAddress, ipfsCid);
      await tx.wait();
      return { hash: tx.hash };
    },
    'Add Record'
  );

  // View functions
  const testIsPatient = () => handleTest(
    async () => {
      const address = checkPatientAddress || walletAddress;
      if (!address) throw new Error('Address required');
      const contract = await getMedblocContract();
      const isPatient = await contract.isPatient(address);
      return { address, isPatient };
    },
    'Check if Patient'
  );

  const testIsDoctor = () => handleTest(
    async () => {
      const address = checkDoctorAddress || walletAddress;
      if (!address) throw new Error('Address required');
      const contract = await getMedblocContract();
      const isDoctor = await contract.isDoctor(address);
      return { address, isDoctor };
    },
    'Check if Doctor'
  );

  const testCheckAccess = () => handleTest(
    async () => {
      const patient = accessPatientAddress || walletAddress;
      const doctor = accessDoctorAddress;
      if (!patient || !doctor) throw new Error('Both patient and doctor addresses required');
      const contract = await getMedblocContract();
      const hasAccess = await contract.access(patient, doctor);
      return { patient, doctor, hasAccess };
    },
    'Check Access'
  );

  const testGetRecord = () => handleTest(
    async () => {
      if (!recordId) throw new Error('Record ID required');
      const contract = await getMedblocContract();
      const record = await contract.getRecord(recordId);
      return {
        recordId,
        patient: record.patient,
        doctor: record.doctor,
        ipfsCid: record.ipfsCid,
        createdAt: record.createdAt.toString(),
      };
    },
    'Get Record'
  );

  const testGetMyRecordIds = () => handleTest(
    async () => {
      const contract = await getMedblocContract();
      const recordIds = await contract.getMyRecordIds();
      return { recordIds: recordIds.map((id: any) => id.toString()) };
    },
    'Get My Record IDs'
  );

  const testGetRecordIdsOf = () => handleTest(
    async () => {
      const address = patientAddress || walletAddress;
      if (!address) throw new Error('Patient address required');
      const contract = await getMedblocContract();
      const recordIds = await contract.getRecordIdsOf(address);
      return { patient: address, recordIds: recordIds.map((id: any) => id.toString()) };
    },
    'Get Record IDs Of Patient'
  );

  const testGetRecordCount = () => handleTest(
    async () => {
      const contract = await getMedblocContract();
      const count = await contract.getRecordCount();
      return { count: count.toString() };
    },
    'Get Record Count'
  );

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Smart Contract Test Page</h1>
              <p className="text-gray-400 mt-1">Test all contract functions without role restrictions</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Connected Wallet</p>
                    <p className="text-white font-mono text-sm">{walletAddress}</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <p className="text-gray-400">Not connected</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Contract: {formatAddress(MEDBLOC_CONTRACT.address)}</p>
              <button
                onClick={checkConnection}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Result Banner */}
        {result && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-start gap-4 ${
              result.success
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-semibold ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                {result.message}
              </p>
              {result.txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1"
                >
                  View on Etherscan <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {result.data && (
                <pre className="text-xs text-gray-300 mt-2 bg-slate-900/50 p-2 rounded overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Registration Section */}
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-blue-400" />
              Registration
            </h2>
            <div className="space-y-3">
              <button
                onClick={testRegisterPatient}
                disabled={loading || !isConnected}
                className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCircle className="w-4 h-4" />}
                Register as Patient
              </button>
              <button
                onClick={testRegisterDoctor}
                disabled={loading || !isConnected}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
                Register as Doctor
              </button>
            </div>
          </div>

          {/* Access Control Section */}
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" />
              Access Control
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Doctor Address (0x...)"
                value={doctorAddress}
                onChange={(e) => setDoctorAddress(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={testGrantAccess}
                  disabled={loading || !isConnected || !doctorAddress}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Grant Access
                </button>
                <button
                  onClick={testRevokeAccess}
                  disabled={loading || !isConnected || !doctorAddress}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Revoke Access
                </button>
              </div>
            </div>
          </div>

          {/* Records Section */}
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Records
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Patient Address (0x...)"
                value={patientAddress}
                onChange={(e) => setPatientAddress(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
              <input
                type="text"
                placeholder="IPFS CID (e.g., QmXxxx...)"
                value={ipfsCid}
                onChange={(e) => setIpfsCid(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
              <button
                onClick={testAddRecord}
                disabled={loading || !isConnected || !patientAddress || !ipfsCid}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
              >
                Add Record
              </button>
            </div>
          </div>

          {/* View Functions Section */}
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-yellow-400" />
              View Functions
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Check Patient (or use wallet)"
                  value={checkPatientAddress}
                  onChange={(e) => setCheckPatientAddress(e.target.value)}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500"
                />
                <button
                  onClick={testIsPatient}
                  disabled={loading || !isConnected}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Is Patient?
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Check Doctor (or use wallet)"
                  value={checkDoctorAddress}
                  onChange={(e) => setCheckDoctorAddress(e.target.value)}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500"
                />
                <button
                  onClick={testIsDoctor}
                  disabled={loading || !isConnected}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Is Doctor?
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Patient (or use wallet)"
                  value={accessPatientAddress}
                  onChange={(e) => setAccessPatientAddress(e.target.value)}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500"
                />
                <input
                  type="text"
                  placeholder="Doctor Address"
                  value={accessDoctorAddress}
                  onChange={(e) => setAccessDoctorAddress(e.target.value)}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500"
                />
              </div>
              <button
                onClick={testCheckAccess}
                disabled={loading || !isConnected || !accessDoctorAddress}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                Check Access
              </button>
              <input
                type="text"
                placeholder="Record ID (number)"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={testGetRecord}
                  disabled={loading || !isConnected || !recordId}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Get Record
                </button>
                <button
                  onClick={testGetRecordCount}
                  disabled={loading || !isConnected}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Get Count
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={testGetMyRecordIds}
                  disabled={loading || !isConnected}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  My Records
                </button>
                <button
                  onClick={testGetRecordIdsOf}
                  disabled={loading || !isConnected}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Patient Records
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong className="text-blue-400">Note:</strong> This is a testing page. All functions call the smart contract directly.
            Make sure you're connected to Sepolia testnet and have test ETH for gas fees.
          </p>
        </div>
      </div>
    </div>
  );
}

