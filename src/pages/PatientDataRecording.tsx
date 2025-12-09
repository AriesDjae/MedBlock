import { useState } from 'react';
import { FileUp, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react';

type RecordType = 'consultation' | 'diagnosis' | 'prescription' | 'lab_result';

interface FormData {
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  recordType: RecordType;
  diagnosis: string;
  treatment: string;
  prescriptions: string;
  notes: string;
}

interface SubmissionStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  txHash?: string;
}

export default function PatientDataRecording() {
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    patientName: '',
    dateOfBirth: '',
    recordType: 'consultation',
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    notes: '',
  });

  const [status, setStatus] = useState<SubmissionStatus>({ type: 'idle' });
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => file.name);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.patientId || !formData.patientName || !formData.recordType) {
      setStatus({
        type: 'error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    setStatus({ type: 'loading', message: 'Processing and securing your record...' });

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockTxHash = `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`;

      setStatus({
        type: 'success',
        message: 'Medical record securely recorded on blockchain!',
        txHash: mockTxHash,
      });

      setTimeout(() => {
        setFormData({
          patientId: '',
          patientName: '',
          dateOfBirth: '',
          recordType: 'consultation',
          diagnosis: '',
          treatment: '',
          prescriptions: '',
          notes: '',
        });
        setUploadedFiles([]);
        setStatus({ type: 'idle' });
      }, 3000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to record data. Please try again.',
      });
    }
  };

  const recordTypeOptions: { value: RecordType; label: string; icon: string }[] = [
    { value: 'consultation', label: 'Consultation', icon: '👨‍⚕️' },
    { value: 'diagnosis', label: 'Diagnosis', icon: '🔍' },
    { value: 'prescription', label: 'Prescription', icon: '💊' },
    { value: 'lab_result', label: 'Lab Result', icon: '🧪' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Patient Data Recording</h1>
          <p className="text-gray-400">Create and validate medical records securely on blockchain</p>
        </div>

        {status.type !== 'idle' && (
          <div
            className={`mb-8 p-4 rounded-lg border flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${
              status.type === 'success'
                ? 'bg-green-500/10 border-green-500/30'
                : status.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
            }`}
          >
            {status.type === 'loading' && <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />}
            {status.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />}
            {status.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
            <div>
              <p
                className={`font-semibold ${
                  status.type === 'success'
                    ? 'text-green-300'
                    : status.type === 'error'
                      ? 'text-red-300'
                      : 'text-blue-300'
                }`}
              >
                {status.message}
              </p>
              {status.txHash && (
                <p className="text-sm text-gray-400 mt-2 break-all">
                  <span className="font-mono">TX: {status.txHash}</span>
                </p>
              )}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl p-8 space-y-8"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Patient ID *</label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                placeholder="Enter patient ID or wallet address"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Patient Name *</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                placeholder="Full name"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Record Type *</label>
              <select
                name="recordType"
                value={formData.recordType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              >
                {recordTypeOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Diagnosis</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="Enter diagnosis details..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Treatment Plan</label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleInputChange}
                placeholder="Enter treatment plan..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Prescriptions</label>
              <textarea
                name="prescriptions"
                value={formData.prescriptions}
                onChange={handleInputChange}
                placeholder="Enter prescriptions..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes..."
                rows={2}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer group">
            <input
              type="file"
              onChange={handleFileUpload}
              multiple
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileUp className="w-12 h-12 text-gray-500 group-hover:text-blue-400 transition-colors mx-auto mb-2" />
              <p className="text-white font-semibold mb-1">Upload medical documents</p>
              <p className="text-sm text-gray-400">Lab results, imaging, prescriptions, etc.</p>
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm font-semibold text-white mb-3">Uploaded Files ({uploadedFiles.length})</p>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    {file}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={status.type === 'loading'}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30"
            >
              <Send className="w-5 h-5" />
              {status.type === 'loading' ? 'Processing...' : 'Submit Record'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  patientId: '',
                  patientName: '',
                  dateOfBirth: '',
                  recordType: 'consultation',
                  diagnosis: '',
                  treatment: '',
                  prescriptions: '',
                  notes: '',
                });
                setUploadedFiles([]);
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
