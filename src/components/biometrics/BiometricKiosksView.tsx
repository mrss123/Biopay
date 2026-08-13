import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wifi,
  WifiOff,
  Activity,
  RefreshCw,
  Plus,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Key,
  Database,
  Radio,
  Sliders,
} from 'lucide-react';
import { BiometricDevice, BiometricPunchLog } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const BiometricKiosksView: React.FC = () => {
  const { showToast } = useAuth();
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [punches, setPunches] = useState<BiometricPunchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);

  useEffect(() => {
    loadDevicesAndLogs();
  }, []);

  const loadDevicesAndLogs = async () => {
    try {
      setLoading(true);
      const devList = await api.getBiometricDevices();
      const logs = await api.getBiometricLogs();
      setDevices(devList);
      setPunches(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDevice = async (device: BiometricDevice) => {
    try {
      setSyncingDeviceId(device.id);
      showToast(`Initiating WebSocket hardware handshake with ${device.deviceName} (${device.ipAddress})...`, 'info');
      await new Promise(r => setTimeout(r, 1200));
      const updated = await api.syncDevice(device.id);
      setDevices(devices.map(d => (d.id === device.id ? updated : d)));
      showToast(`Successfully synced 18 new biometric punches from ${device.deviceName}!`, 'success');
    } catch (e: any) {
      showToast('Device sync failed', 'error');
    } finally {
      setSyncingDeviceId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hardware Integration Layer</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <Radio className="h-3 w-3 animate-pulse" /> Live Terminal Pulse
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">Biometric Kiosks & Hardware Pulse</h1>
          <p className="text-xs text-slate-500">ZKTeco, Suprema & Hikvision Facial / Fingerprint / RFID Access Controllers.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDevicesAndLogs}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Bento Grid Kiosks & Hardware Terminals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map(device => {
          const isOnline = device.status === 'Online';
          const isSyncing = syncingDeviceId === device.id;

          return (
            <div
              key={device.id}
              className={`rounded-2xl border p-5 shadow-sm transition-all ${
                isOnline ? 'border-slate-200 bg-white' : 'border-red-200 bg-red-50/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isOnline ? 'bg-indigo-50 text-indigo-600' : 'bg-red-100 text-red-600'}`}>
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{device.deviceName}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{device.ipAddress} • Port {device.port}</p>
                    <span className="text-[10px] font-semibold text-indigo-600">{device.locationName}</span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {device.status}
                </span>
              </div>

              {/* Hardware Specs & Metrics */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100 py-3">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Device Protocol</span>
                  <span className="font-mono text-slate-800 font-bold">{device.protocol}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Device Sn</span>
                  <span className="font-mono text-slate-800 text-[11px] font-bold">{device.serialNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Verification</span>
                  <span className="text-slate-700 font-semibold">{device.biometricType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Last Network Ping</span>
                  <span className="text-slate-700 font-medium">{device.lastPing ? new Date(device.lastPing).toLocaleTimeString() : 'N/A'}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  {device.unprocessedCount} un-ingested logs
                </span>

                <button
                  onClick={() => handleSyncDevice(device)}
                  disabled={!isOnline || isSyncing}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    isSyncing
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                  }`}
                >
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Handshaking...' : 'Poll Terminal'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dark Accent Bento Card - Live Biometric Hardware Terminal Feed */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">WebSocket Push Channel</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <h2 className="text-base font-bold tracking-tight text-white mt-1">Recent Hardware Biometric Ingestion Stream</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Total Streamed Today: {punches.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-2.5">Punch Timestamp</th>
                <th className="px-4 py-2.5">Device Source</th>
                <th className="px-4 py-2.5">Biometric Code</th>
                <th className="px-4 py-2.5">Verification Mode</th>
                <th className="px-4 py-2.5">Punch Type</th>
                <th className="px-4 py-2.5">Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
              {punches.slice(0, 8).map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3">{new Date(p.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-slate-300">{p.deviceName}</td>
                  <td className="px-4 py-3 text-indigo-400 font-bold">{p.biometricId}</td>
                  <td className="px-4 py-3 font-sans text-slate-300">{p.verificationType}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.punchType === 'IN'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      CLOCK {p.punchType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Processed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
