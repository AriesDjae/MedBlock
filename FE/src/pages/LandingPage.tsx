import { Link } from 'react-router-dom';
import { Shield, Lock, Users, TrendingUp, ChevronRight, Zap, Database, Eye } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function LandingPage() {
  const { userRole } = useWallet();
  const features = [
    {
      icon: Shield,
      title: 'Military-Grade Security',
      description: 'End-to-end encryption with blockchain verification for ultimate data protection',
    },
    {
      icon: Lock,
      title: 'Immutable Records',
      description: 'Medical data secured on blockchain, ensuring permanence and non-repudiation',
    },
    {
      icon: Users,
      title: 'Patient Control',
      description: 'Grant or revoke access permissions with complete transparency',
    },
    {
      icon: Eye,
      title: 'Full Transparency',
      description: 'Explore blockchain transactions and audit trails in real-time',
    },
  ];

  const stats = [
    { label: 'Records Secured', value: '10K+' },
    { label: 'Active Doctors', value: '500+' },
    { label: 'Verified Patients', value: '25K+' },
  ];

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-pulse">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Blockchain Healthcare Revolution</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight">
            Your Health Data,
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {' '}Secured Forever
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            MedBlock combines the power of blockchain technology with modern healthcare management.
            Immutable records, transparent access control, and complete patient autonomy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            
            {/* BUTTON 1: Doctor Logic */}
            {userRole === 'doctor' ? (
                <Link
                  to="/patient-records"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30"
                >
                  <span>Doctor Dashboard</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
            ) : userRole === 'patient' ? (
                /* Patient doesn't need to see Doctor button */
                null 
            ) : (
                /* Guest sees Login */
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30"
                >
                    <span>Doctor Login</span>
                    <ChevronRight className="w-5 h-5" />
                </Link>
            )}

            {/* BUTTON 2: Patient Logic */}
            {userRole === 'patient' ? (
                <Link
                  to="/explorer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-200 border border-slate-600"
                >
                  <span>My Records</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
            ) : userRole === 'doctor' ? (
                 null
            ) : (
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-200 border border-slate-600"
                >
                    <span>Patient Login</span>
                    <ChevronRight className="w-5 h-5" />
                </Link>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-gray-400 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Why MedBlock?
            </h2>
            <p className="text-lg text-gray-300">
              Secure, transparent, and patient-centric healthcare management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-3 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 w-fit mb-4 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <Database className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Decentralized</h3>
              <p className="text-gray-400">Data secured across distributed nodes</p>
            </div>
            <div className="p-8 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20">
              <Lock className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Encrypted</h3>
              <p className="text-gray-400">End-to-end encryption for all data</p>
            </div>
            <div className="p-8 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-600/10 border border-teal-500/20">
              <TrendingUp className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Scalable</h3>
              <p className="text-gray-400">Handles millions of medical records</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border-y border-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Healthcare?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of healthcare professionals using MedBlock
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/patient-records"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              Get Started
            </Link>
            <button className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors duration-200 border border-slate-600">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
