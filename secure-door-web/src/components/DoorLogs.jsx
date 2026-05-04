import React from 'react';
import { Clock, ShieldCheck, ShieldAlert, User } from 'lucide-react';

const DoorLogs = ({ logs }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER INFORMASI */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#C9B59C] rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-[#4A443F] uppercase tracking-[0.3em]">
            System Access History
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#EFE9E3] border border-[#D9CFC7] rounded-full">
          <Clock size={12} className="text-[#C9B59C]" />
          <span className="text-[9px] font-bold text-[#4A443F] uppercase tracking-tighter">
            Real-time Monitoring Active
          </span>
        </div>
      </div>

      {/* TABEL LOGS CERAH */}
      <div className="bg-white border border-[#D9CFC7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#EFE9E3] border-b border-[#D9CFC7] text-[#C9B59C]">
              <tr>
                {/* TAMBAHAN KOLOM NAMA */}
                <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase">User Name</th>
                <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase">Finger Print ID</th>
                <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase">RFID UID</th>
                <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9E3]">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F9F8F6] transition-colors group">
                    {/* DATA NAMA USER */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#F9F8F6] rounded-lg border border-[#EFE9E3]">
                          <User size={14} className="text-[#C9B59C]" />
                        </div>
                        <span className="font-black text-[#4A443F] text-[11px] uppercase tracking-wider">
                          {/* Menampilkan nama dari relasi user_credentials, jika tidak ada tampilkan 'Unknown' */}
                          {log.user_credentials?.name || (log.fingerprint_id === 0 ? "REMOTE/SYSTEM" : "UNKNOWN USER")}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-mono text-[#8B5E3C]">
                          #{log.fingerprint_id.toString().padStart(2, '0')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-mono text-[13px] text-[#8B5E3C] opacity-70 italic">
                      {log.rfid_uid}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center">
                        <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.1em] uppercase border transition-all shadow-sm ${
                          log.access_granted 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                            : 'bg-rose-50 border-rose-200 text-rose-600'
                        }`}>
                          {log.access_granted ? (
                            <><ShieldCheck size={12} /> GRANTED</>
                          ) : (
                            <><ShieldAlert size={12} /> DENIED</>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right text-[10px] font-bold text-[#4A443F] uppercase tracking-tighter">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <p className="text-[10px] font-black text-[#C9B59C] tracking-[0.4em] uppercase">
                      Waiting for authentication events...
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoorLogs;