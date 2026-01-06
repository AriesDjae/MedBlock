import { useState, useEffect } from 'react';
import { 
  Search, 
  UserCircle, 
  FileText, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  AlertCircle,
  Loader2,
  Copy,
  Shield,
  Eye,
  RefreshCw
} from 'lucide-react';
import { getMedblocContract } from '../../services/medbloc';
import { getSigner } from '../../services/web3';

interface Record {
  recordId: string;
  patient: string;
  doctor: string;
  ipfsCid: string;
  createdAt: number;
  ipfsData?: any;
}

interface PatientAccess {
  address: string;
  hasAccess: boolean;
  recordCount: number;
  lastChecked?: number;
}

export default function RecordExplorer() {
  const [doctorAddress, setDoctorAddress] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentPatients, setRecentPatients] = useState<string[]>([]);
  const [accessStatus, setAccessStatus] = useState<Map<string, PatientAccess>>(new Map());

  useEffect(() => {
    loadDoctorAddress();
    loadRecentPatients();
  }, []);

  const loadDoctorAddress = async () => {
    try {
      const signer = await getSigner();
      const address = await signer.getAddress();
      setDoctorAddress(address);
    } catch (err) {
      setError('Please connect your wallet');
    }
  };

  const loadRecentPatients = () => {
    const saved = localStorage.getItem('medBlockRecentPatients');
    if (saved) {
      setRecentPatients(JSON.parse(saved));
    }
  };

  const saveRecentPatient = (address: string) => {
    const normalized = address.toLowerCase();
    const updated = [normalized, ...recentPatients.filter(a => a.toLowerCase() !== normalized)].slice(0, 10);
    setRecentPatients(updated);
    localStorage.setItem('medBlockRecentPatients', JSON.stringify(updated));
  };

  const checkAccess = async (patientAddress: string) => {
    if (!doctorAddress || !patientAddress) return false;
    
    setCheckingAccess(true);
    try {
      const contract = await getMedblocContract();
      const hasAccess = await contract.access(patientAddress, doctorAddress);
      
      const recordIds = hasAccess ? await contract.getRecordIdsOf(patientAddress) : [];
      
      setAccessStatus(prev => {
        const updated = new Map(prev);
        updated.set(patientAddress.toLowerCase(), {
          address: patientAddress,
          hasAccess,
          recordCount: recordIds.length,
          lastChecked: Date.now(),
        });
        return updated;
      });
      
      return hasAccess;
    } catch (err: any) {
      console.error('Access check failed:', err);
      return false;
    } finally {
      setCheckingAccess(false);
    }
  };

  const fetchRecords = async (patientAddress: string) => {
    if (!doctorAddress) {
      setError('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedPatient(patientAddress);
    saveRecentPatient(patientAddress);

    try {
      // First check access
      const hasAccess = await checkAccess(patientAddress);
      
      if (!hasAccess) {
        setError(`You do not have access to records for ${patientAddress.slice(0, 6)}...${patientAddress.slice(-4)}. The patient must grant you access first.`);
        setRecords([]);
        return;
      }

      const contract = await getMedblocContract();
      const recordIds = await contract.getRecordIdsOf(patientAddress);
      
      if (recordIds.length === 0) {
        setError('No records found for this patient.');
        setRecords([]);
        return;
      }

      // Fetch all records
      const recordPromises = recordIds.map(async (id: any) => {
        const record = await contract.getRecord(id);
        return {
          recordId: id.toString(),
          patient: record.patient,
          doctor: record.doctor,
          ipfsCid: record.ipfsCid,
          createdAt: Number(record.createdAt) * 1000, // Convert to milliseconds
        };
      });

      const fetchedRecords = await Promise.all(recordPromises);
      
      // Fetch IPFS data for each record
      const recordsWithData = await Promise.all(
        fetchedRecords.map(async (record) => {
          try {
            const ipfsRes = await fetch(`https://${record.ipfsCid}.ipfs.w3s.link`);
            if (ipfsRes.ok) {
              const ipfsData = await ipfsRes.json();
              return { ...record, ipfsData };
            }
          } catch (err) {
            console.warn(`Failed to fetch IPFS data for ${record.ipfsCid}:`, err);
          }
          return record;
        })
      );

      setRecords(recordsWithData);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch records. Please try again.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchAddress.trim()) {
      setError('Please enter a patient wallet address');
      return;
    }
    
    // Basic address validation
    if (!searchAddress.startsWith('0x') || searchAddress.length !== 42) {
      setError('Invalid wallet address format. Must start with 0x and be 42 characters long.');
      return;
    }

    fetchRecords(searchAddress.trim());
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const patientAccessInfo = selectedPatient ? accessStatus.get(selectedPatient.toLowerCase()) : null;

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Record Explorer</h1>
              <p className="text-gray-400 mt-1">View patient medical records you have access to</p>
            </div>
          </div>

          {/* Doctor Address Display */}
          {doctorAddress && (
            <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCircle className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Logged in as Doctor</p>
                  <p className="text-white font-mono text-sm">{doctorAddress}</p>
                </div>
              </div>
              <button
                onClick={() => selectedPatient && fetchRecords(selectedPatient)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            Search Patient Records
          </h2>

          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Enter patient wallet address (0x...)"
                value={searchAddress}
                onChange={(e) => {
                  setSearchAddress(e.target.value);
                  setError(null);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || checkingAccess || !searchAddress.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {loading || checkingAccess ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Recent Patients */}
          {recentPatients.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Recent Patients:</p>
              <div className="flex flex-wrap gap-2">
                {recentPatients.map((address) => {
                  const accessInfo = accessStatus.get(address);
                  return (
                    <button
                      key={address}
                      onClick={() => {
                        setSearchAddress(address);
                        fetchRecords(address);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors ${
                        selectedPatient?.toLowerCase() === address
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                          : 'bg-slate-800/50 border-slate-600 text-gray-300 hover:border-slate-500'
                      }`}
                    >
                      {formatAddress(address)}
                      {accessInfo && (
                        <span className={`ml-2 ${accessInfo.hasAccess ? 'text-green-400' : 'text-red-400'}`}>
                          {accessInfo.hasAccess ? '✓' : '✗'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 font-semibold">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Access Status Banner */}
        {selectedPatient && patientAccessInfo && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            patientAccessInfo.hasAccess
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            {patientAccessInfo.hasAccess ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-semibold ${
                patientAccessInfo.hasAccess ? 'text-green-300' : 'text-yellow-300'
              }`}>
                {patientAccessInfo.hasAccess
                  ? `Access Granted - ${patientAccessInfo.recordCount} record(s) available`
                  : 'Access Denied - Patient must grant you access to view records'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Patient: <span className="font-mono">{selectedPatient}</span>
              </p>
            </div>
          </div>
        )}

        {/* Records Table */}
        {records.length > 0 && (
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Records ({records.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600 bg-slate-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Record ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Patient</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created By</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">IPFS CID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {records.map((record) => (
                    <tr
                      key={record.recordId}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-blue-400">
                        #{record.recordId}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <code className="text-cyan-400 font-mono">{formatAddress(record.patient)}</code>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <code className="text-purple-400 font-mono">{formatAddress(record.doctor)}</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {formatDate(record.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <code className="text-gray-400 font-mono text-xs">{record.ipfsCid.slice(0, 12)}...</code>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(record.ipfsCid);
                            }}
                            className="p-1.5 hover:bg-slate-700 rounded text-gray-400 hover:text-white transition-colors"
                            title="Copy IPFS CID"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://${record.ipfsCid}.ipfs.w3s.link`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300 transition-colors"
                            title="View on IPFS"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Record Details */}
        {records.length > 0 && (
          <div className="mt-6 space-y-4">
            {records.map((record) => (
              <div
                key={record.recordId}
                className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      Record #{record.recordId}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Created: {formatDate(record.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold border border-green-500/30">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Verified on Blockchain
                    </span>
                  </div>
                </div>

                {record.ipfsData ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {record.ipfsData.patientName && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Patient Name</p>
                          <p className="text-white font-semibold">{record.ipfsData.patientName}</p>
                        </div>
                      )}
                      {record.ipfsData.recordType && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Record Type</p>
                          <p className="text-white font-semibold capitalize">{record.ipfsData.recordType}</p>
                        </div>
                      )}
                      {record.ipfsData.dateOfBirth && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Date of Birth</p>
                          <p className="text-white">{record.ipfsData.dateOfBirth}</p>
                        </div>
                      )}
                    </div>

                    {record.ipfsData.diagnosis && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Diagnosis</p>
                        <p className="text-white bg-slate-800/50 p-3 rounded-lg">{record.ipfsData.diagnosis}</p>
                      </div>
                    )}

                    {record.ipfsData.treatment && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Treatment Plan</p>
                        <p className="text-white bg-slate-800/50 p-3 rounded-lg">{record.ipfsData.treatment}</p>
                      </div>
                    )}

                    {record.ipfsData.prescriptions && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Prescriptions</p>
                        <p className="text-white bg-slate-800/50 p-3 rounded-lg">{record.ipfsData.prescriptions}</p>
                      </div>
                    )}

                    {record.ipfsData.notes && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Additional Notes</p>
                        <p className="text-white bg-slate-800/50 p-3 rounded-lg">{record.ipfsData.notes}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-600">
                      <p className="text-xs text-gray-400 mb-2">IPFS Content Identifier</p>
                      <code className="text-xs text-gray-300 bg-slate-900/50 p-2 rounded block break-all">
                        {record.ipfsCid}
                      </code>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">
                      IPFS data not available. CID: <code className="text-gray-300">{record.ipfsCid}</code>
                    </p>
                    <a
                      href={`https://${record.ipfsCid}.ipfs.w3s.link`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-flex items-center gap-1"
                    >
                      Try viewing on IPFS <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !selectedPatient && records.length === 0 && (
          <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-12 text-center">
            <Eye className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300 font-semibold mb-2">No patient selected</p>
            <p className="text-sm text-gray-500">
              Enter a patient wallet address above to view their medical records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

