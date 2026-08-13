import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Fingerprint,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Employee, BiometricDevice } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface BiometricPunchSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onPunchSuccess?: () => void;
}

export const BiometricPunchSimulator: React.FC<BiometricPunchSimulatorProps> = ({
  isOpen,
  onClose,
  onPunchSuccess,
}) => {
  const { showToast } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [punchType, setPunchType] = useState<'clock_in' | 'clock_out' | 'break_start' | 'break_end'>('clock_in');
  const [verificationMode, setVerificationMode] = useState<'facial' | 'fingerprint' | 'rfid'>('facial');

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSuccessResult, setScanSuccessResult] = useState<any | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      stopWebcam();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const emps = await api.getEmployees();
      const devs = await api.getBiometricDevices();
      setEmployees(emps);
      setDevices(devs);
      if (emps.length > 0) setSelectedEmpId(emps[0].id);
      if (devs.length > 0) setSelectedDeviceId(devs[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setWebcamActive(true);
      }
    } catch (err) {
      console.warn('Webcam permission denied or unavailable, using fallback facial scanner animation');
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  useEffect(() => {
    if (verificationMode === 'facial' && isOpen) {
      startWebcam();
    } else {
      stopWebcam();
    }
  }, [verificationMode, isOpen]);

  if (!isOpen) return null;

  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
  const selectedDev = devices.find(d => d.id === selectedDeviceId) || devices[0];

  const handleSimulateVerification = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanSuccessResult(null);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(async () => {
      try {
        const res = await api.triggerBiometricPunch({
          biometricId: selectedEmp?.biometricId || 'BIO-FAC-1001',
          deviceId: selectedDev?.id || 'dev-1',
          punchType,
          verificationMode,
          snapshotUrl: selectedEmp?.profilePhoto,
        });

        setScanSuccessResult(res);
        showToast(res.message, 'success');
        if (onPunchSuccess) onPunchSuccess();
      } catch (err: any) {
        showToast(err.message || 'Verification Failed', 'error');
      } finally {
        setIsScanning(false);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/30">
              <Fingerprint className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Biometric Hardware Verification Simulator</h3>
              <p className="text-[11px] text-slate-400">Generates immutable biometric event logs & live attendance punches</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Scan Mode Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-800/80">
            <button
              onClick={() => setVerificationMode('facial')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                verificationMode === 'facial' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Facial AI Scan</span>
            </button>
            <button
              onClick={() => setVerificationMode('fingerprint')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                verificationMode === 'fingerprint' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Fingerprint className="h-4 w-4" />
              <span>Fingerprint</span>
            </button>
            <button
              onClick={() => setVerificationMode('rfid')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                verificationMode === 'rfid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>RFID / Card</span>
            </button>
          </div>

          {/* Interactive Hardware Visual Scanner Viewfinder */}
          <div className="relative h-48 w-full rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
            {verificationMode === 'facial' && (
              <>
                {webcamActive ? (
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <img
                      src={selectedEmp?.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                      alt="Facial target"
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-indigo-500/40"
                    />
                    <span className="mt-2 text-xs font-bold text-slate-200">{selectedEmp?.fullName}</span>
                    <span className="text-[10px] text-indigo-400">Key: {selectedEmp?.biometricId}</span>
                  </div>
                )}
                {/* Facial Mesh Scanning Overlay */}
                <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className={`h-28 w-28 rounded-full border-2 border-dashed ${isScanning ? 'border-emerald-400 animate-spin' : 'border-indigo-400/60'}`} />
                </div>
              </>
            )}

            {verificationMode === 'fingerprint' && (
              <div className="flex flex-col items-center justify-center text-center">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-indigo-950/60 border ${isScanning ? 'border-emerald-400 bg-emerald-950/50 scale-105' : 'border-indigo-500/30'} transition-all duration-300`}>
                  <Fingerprint className={`h-12 w-12 ${isScanning ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`} />
                </div>
                <span className="mt-3 text-xs font-semibold text-slate-300">Touch Fingerprint Sensor Plate</span>
              </div>
            )}

            {verificationMode === 'rfid' && (
              <div className="flex flex-col items-center justify-center text-center">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-violet-950/60 border ${isScanning ? 'border-emerald-400 bg-emerald-950/50 scale-105' : 'border-violet-500/30'} transition-all duration-300`}>
                  <CreditCard className={`h-10 w-10 ${isScanning ? 'text-emerald-400 animate-bounce' : 'text-violet-400'}`} />
                </div>
                <span className="mt-3 text-xs font-semibold text-slate-300">NFC / Proximity Card Scanner</span>
              </div>
            )}

            {/* Scanning Progress Bar */}
            {isScanning && (
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-150" style={{ width: `${scanProgress}%` }} />
              </div>
            )}
          </div>

          {/* Form Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Select Employee Profile</label>
              <select
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Biometric Terminal</label>
              <select
                value={selectedDeviceId}
                onChange={e => setSelectedDeviceId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                {devices.map(dev => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name} ({dev.vendor})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Punch Event Action</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'clock_in', label: 'Clock In' },
                { type: 'clock_out', label: 'Clock Out' },
                { type: 'break_start', label: 'Break Start' },
                { type: 'break_end', label: 'Break End' },
              ].map(p => (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => setPunchType(p.type as any)}
                  className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                    punchType === p.type
                      ? 'border-indigo-500 bg-indigo-600/30 text-indigo-200'
                      : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Success Result Box */}
          {scanSuccessResult && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Verified Biometric Event Processed</span>
              </div>
              <p className="text-[11px] text-emerald-300">
                Employee: {scanSuccessResult.event?.employeeName} • Punch: {scanSuccessResult.event?.punchType.toUpperCase()}
              </p>
              <p className="text-[10px] text-emerald-400/80">
                Device: {scanSuccessResult.event?.deviceName} • Status: {scanSuccessResult.attendance?.status.toUpperCase()}
              </p>
            </div>
          )}

          {/* Verification Action Button */}
          <button
            onClick={handleSimulateVerification}
            disabled={isScanning}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all"
          >
            {isScanning ? (
              <>
                <Zap className="h-4 w-4 animate-spin text-amber-300" />
                <span>Running Neural Biometric Matching...</span>
              </>
            ) : (
              <>
                <Fingerprint className="h-4 w-4" />
                <span>Trigger Biometric Verification Punch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
