import { useState, useMemo } from 'react';
import {
  Shield,
  UserCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Key,
  History,
  Filter,
} from 'lucide-react';
import { getMedblocContract } from '../../services/medbloc';

type ConsentStatus = 'pending' | 'approved' | 'denied';

interface ConsentRequest {
  id: string;
  doctorName: string;
  doctorAddress: string;
  specialization: string;
  reason: string;
  requestedScopes: string[];
  requestedAt: string;
  expiresAt?: string;
  status: ConsentStatus;
}

interface BannerState {
  type: 'idle' | 'success' | 'error';
  message?: string;
}

export default function PatientConsentPage() {
  const [requests, setRequests] = useState<ConsentRequest[]>([
    {
      id: '1',
      doctorName: 'Dr. Jane Smith',
      doctorAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      specialization: 'Cardiologist',
      reason: 'Access to your recent ECG and blood test results for follow-up consultation.',
      requestedScopes: ['View medical history', 'View lab results'],
      requestedAt: '2 hours ago',
      expiresAt: 'in 24 hours',
      status: 'pending',
    },
    {
      id: '2',
      doctorName: 'Dr. Ahmed Ali',
      doctorAddress: '0x742d35Cc6634C0532925a3b844Bc54e4d6d3cFB3',
      specialization: 'General Practitioner',
      reason: 'Review of chronic medication history before prescription renewal.',
      requestedScopes: ['View prescriptions'],
      requestedAt: 'Yesterday',
      expiresAt: 'in 3 days',
      status: 'pending',
    },
    {
      id: '3',
      doctorName: 'Dr. Emily Chen',
      doctorAddress: '0x1111111111111111111111111111111111111111',
      specialization: 'Oncologist',
      reason: 'Historical access previously granted for treatment planning.',
      requestedScopes: ['View medical history', 'View lab results', 'View imaging'],
      requestedAt: '3 weeks ago',
      status: 'approved',
      expiresAt: 'Until revoked',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('pending');
  const [banner, setBanner] = useState<BannerState>({ type: 'idle' });
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredRequests = useMemo(
    () =>
      requests.filter((r) => {
        if (filter === 'all') return true;
        return r.status === filter;
      }),
    [requests, filter]
  );

  const handleDecision = async (
    request: ConsentRequest,
    decision: Extract<ConsentStatus, 'approved' | 'denied'>
  ) => {
    try {
      setLoadingId(request.id);
      const contract = await getMedblocContract();

      if (decision === 'approved') {
        const tx = await contract.grantAccess(request.doctorAddress);
        await tx.wait();
      } else {
        const tx = await contract.revokeAccess(request.doctorAddress);
        await tx.wait();
      }

      setRequests((prev) =>
        prev.map((req) => (req.id === request.id ? { ...req, status: decision } : req))
      );

      setBanner({
        type: 'success',
        message:
          decision === 'approved'
            ? 'On-chain access granted. This doctor can now view your records according to the contract.'
            : 'On-chain access revoked. This doctor can no longer view your records.',
      });
    } catch (err: any) {
      setBanner({
        type: 'error',
        message:
          err?.message ||
          'Failed to update access on-chain. Please check your wallet and try again.',
      });
    } finally {
      setLoadingId(null);
      setTimeout(() => setBanner({ type: 'idle' }), 4000);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
              Patient Control Center
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Consent & Access Control</h1>
          <p className="text-gray-400 max-w-2xl">
            Review which doctors can access your medical records. Approve or deny new requests in
            one secure place.
          </p>
        </header>

        {banner.type !== 'idle' && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-300">{banner.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                Changes are reflected on your account immediately.
              </p>
            </div>
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-[2fr,minmax(0,1fr)] items-start">
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-cyan-500/10">
              <UserCircle className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-gray-300 font-semibold">You are in control</p>
              <p className="text-xs text-gray-400">
                Doctors can only see your data after you explicitly grant access. You can revoke it
                at any time.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-600/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                <Key className="w-4 h-4 text-yellow-300" />
                Access filter
              </div>
              <Filter className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['pending', 'approved', 'denied', 'all'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    filter === value
                      ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                      : 'bg-slate-900/40 border-slate-600 text-gray-400 hover:border-slate-400'
                  }`}
                >
                  {value === 'all'
                    ? 'All'
                    : value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {filteredRequests.length === 0 && (
            <div className="bg-slate-800/60 border border-slate-600/60 rounded-xl p-8 text-center">
              <Lock className="w-8 h-8 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-300 font-semibold mb-1">No requests in this view</p>
              <p className="text-sm text-gray-500">
                When a doctor requests access to your data, you&apos;ll be able to review it here.
              </p>
            </div>
          )}

          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 border border-slate-700/70 rounded-xl p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-purple-500/10">
                    <UserCircle className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-lg">{request.doctorName}</p>
                      <span className="px-2 py-0.5 text-[11px] rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40">
                        {request.specialization}
                      </span>
                      <span className="px-2 py-0.5 text-[11px] rounded-full bg-slate-800 text-gray-300 border border-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        Requested {request.requestedAt}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">
                      Wallet:{' '}
                      <span className="font-mono text-[11px] text-cyan-300">
                        {request.doctorAddress.slice(0, 10)}...
                        {request.doctorAddress.slice(-6)}
                      </span>
                    </p>
                    {request.expiresAt && (
                      <p className="text-xs text-gray-500">
                        Expires {request.expiresAt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  {request.status === 'pending' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending approval
                    </span>
                  )}
                  {request.status === 'approved' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-300 border border-green-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Access granted
                    </span>
                  )}
                  {request.status === 'denied' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-300 border border-red-500/30 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Access denied
                    </span>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-[2fr,minmax(0,1.2fr)] gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-300 uppercase mb-1">
                      Why this doctor is requesting access
                    </p>
                    <p className="text-sm text-gray-300">{request.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-300 uppercase mb-2">
                      Data this doctor wants to access
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {request.requestedScopes.map((scope) => (
                        <span
                          key={scope}
                          className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-600 text-gray-200 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-cyan-300" />
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3">
                  <div className="text-xs text-gray-400 bg-slate-900/60 border border-slate-700 rounded-lg p-3 flex items-start gap-2">
                    <Shield className="w-4 h-4 text-blue-400 mt-0.5" />
                    <p>
                      You can change this decision later. Every access is logged on the blockchain
                      for full transparency.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={request.status === 'approved' || loadingId === request.id}
                      onClick={() => handleDecision(request, 'approved')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                        request.status === 'approved' || loadingId === request.id
                          ? 'bg-green-700/40 text-green-300 cursor-default'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {loadingId === request.id
                        ? 'Processing...'
                        : request.status === 'approved'
                        ? 'Access Granted'
                        : 'Grant Access'}
                    </button>
                    <button
                      disabled={request.status === 'denied' || loadingId === request.id}
                      onClick={() => handleDecision(request, 'denied')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border transition-colors ${
                        request.status === 'denied' || loadingId === request.id
                          ? 'bg-red-900/40 border-red-700 text-red-200 cursor-default'
                          : 'bg-slate-800 border-slate-600 text-red-300 hover:bg-red-500/10 hover:border-red-500/40'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      {loadingId === request.id
                        ? 'Processing...'
                        : request.status === 'denied'
                        ? 'Denied'
                        : 'Deny'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 bg-slate-900/70 border border-slate-700/70 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-slate-800">
              <History className="w-4 h-4 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">Audit trail & history</p>
              <p className="text-xs text-gray-400 max-w-xl">
                Every time you grant or deny access, a record is stored on-chain by MedBlock. This
                gives you a tamper-proof history of who has seen your data and when.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


