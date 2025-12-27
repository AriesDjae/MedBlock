import { useState, useMemo, useEffect } from 'react';
import { getServices } from '../services/api';
import { Search, Filter, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';

interface BlockchainRecord {
  id: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  patientAddress: string;
  doctorAddress: string;
  recordType: string;
  status: 'confirmed' | 'pending' | 'failed';
  recordHash: string;
}

export default function BlockchainExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [services, setServices] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getServices();
        setServices(res);
      } catch (err) {
        console.error('Failed to fetch services', err);
      }
    })();
  }, []);

  const mockRecords: BlockchainRecord[] = [
    {
      id: '1',
      txHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
      blockNumber: 18452341,
      timestamp: Date.now() - 3600000,
      patientAddress: '0x742d35Cc6634C0532925a3b844Bc54e4d6d3cFB3',
      doctorAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      recordType: 'diagnosis',
      status: 'confirmed',
      recordHash: '0xabcd1234efgh5678ijkl9012mnop3456qrst7890',
    },
    {
      id: '2',
      txHash: '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1',
      blockNumber: 18452340,
      timestamp: Date.now() - 7200000,
      patientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      doctorAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      recordType: 'consultation',
      status: 'confirmed',
      recordHash: '0xzxcv0987wxyz5678ijkl9012mnop3456qrst7890',
    },
    {
      id: '3',
      txHash: '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2',
      blockNumber: 18452339,
      timestamp: Date.now() - 10800000,
      patientAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      doctorAddress: '0x742d35Cc6634C0532925a3b844Bc54e4d6d3cFB3',
      recordType: 'lab_result',
      status: 'confirmed',
      recordHash: '0nhgf4567mnbv8901pqrs2345tuvw6789xyza0123',
    },
    {
      id: '4',
      txHash: '0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3',
      blockNumber: 18452338,
      timestamp: Date.now() - 14400000,
      patientAddress: '0x1111111111111111111111111111111111111111',
      doctorAddress: '0xffff0000ffff0000ffff0000ffff0000ffff0000',
      recordType: 'prescription',
      status: 'pending',
      recordHash: '0pppp3456qqqq7890rrrr1234ssss5678tttt9012',
    },
    {
      id: '5',
      txHash: '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4',
      blockNumber: 18452337,
      timestamp: Date.now() - 18000000,
      patientAddress: '0x2222222222222222222222222222222222222222',
      doctorAddress: '0xeeee1111eeee1111eeee1111eeee1111eeee1111',
      recordType: 'diagnosis',
      status: 'confirmed',
      recordHash: '0qqqq5678rrrr9012ssss3456tttt7890uuuu1234',
    },
  ];

  const filteredRecords = useMemo(() => {
    return mockRecords.filter((record) => {
      const matchesSearch =
        record.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patientAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctorAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.recordHash.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || record.recordType === filterType;

      return matchesSearch && matchesType;
    });
  }, [searchTerm, filterType]);

  const recordTypeOptions = ['all', 'consultation', 'diagnosis', 'prescription', 'lab_result'];

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formatHash = (hash: string) => `${hash.slice(0, 8)}...${hash.slice(-8)}`;

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Blockchain Explorer</h1>
          <p className="text-gray-400">View and verify all medical records on the blockchain</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by transaction hash, address, or record hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              {recordTypeOptions.map((type) => (
                <option key={type} value={type} className="bg-slate-800">
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600 bg-slate-800/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Transaction Hash</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Block</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-700/30 transition-colors duration-200 border-b border-slate-700/50"
                  >
                    <td className="px-6 py-4 text-sm">
                      <code className="text-blue-400 hover:text-blue-300 cursor-pointer font-mono">
                        {formatHash(record.txHash)}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono">{record.blockNumber.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <code className="text-cyan-400 font-mono">{formatAddress(record.patientAddress)}</code>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                        {record.recordType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {record.status === 'confirmed' && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Confirmed</span>
                          </>
                        )}
                        {record.status === 'pending' && (
                          <>
                            <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
                            <span className="text-yellow-400">Pending</span>
                          </>
                        )}
                        {record.status === 'failed' && (
                          <>
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Failed</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatTime(record.timestamp)}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                      >
                        Details
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-400">No records found matching your criteria</p>
            </div>
          )}
        </div>

        {expandedRow && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {filteredRecords
              .filter((r) => r.id === expandedRow)
              .map((record) => (
                <div key={record.id} className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Record Details</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Transaction Hash</p>
                      <code className="text-blue-400 font-mono break-all text-sm">{record.txHash}</code>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-1">Record Hash</p>
                      <code className="text-cyan-400 font-mono break-all text-sm">{record.recordHash}</code>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-1">Block Number</p>
                      <p className="text-white font-mono">{record.blockNumber.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-1">Doctor Address</p>
                      <code className="text-purple-400 font-mono text-sm">{record.doctorAddress}</code>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-400 mb-2">Verification</p>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                        <p className="text-sm text-green-300 flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4" />
                          Record verified on blockchain
                        </p>
                        <p className="text-xs text-gray-400">
                          This medical record has been cryptographically verified and is immutable.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedRow(null)}
                    className="mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              ))}
          </div>
        )}

        <div className="mt-8 p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <h3 className="text-lg font-semibold text-white mb-3">Backend Services</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Ethereum Connected</p>
              <p className="text-blue-300 font-semibold">{services ? (services.eth_connected ? 'Yes' : 'No') : 'Loading...'}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Firestore Config</p>
              <p className="text-blue-300 font-semibold">{services ? (services.firebase_present ? 'Configured' : 'Not present') : 'Loading...'}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">In-Memory Records</p>
              <p className="text-blue-300 font-semibold">{services ? services.in_memory_records : 'Loading...'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

 
