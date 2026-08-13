import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Search, Filter } from 'lucide-react';
import { AuditLog } from '../../types/index.js';
import { api } from '../../services/api.js';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    api.getAuditLogs().then(setLogs);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Security & Compliance</span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">Immutable Audit Trail Logs</h1>
          <p className="text-xs text-slate-500">Every salary modification, attendance override, biometric key mapping and payroll lock event.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Admin User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Action Target</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{log.userName}</td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-600">{log.action}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
