import React from 'react';
import { Lock, Unlock, Zap, Activity, Fingerprint, Shield } from 'lucide-react';

const Dashboard = ({ status, sendCommand }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatusCard 
          icon={<Activity size={20} />} 
          label="Solenoid State" 
          value={status === 'UNLOCK' ? 'ACTIVE / OPEN' : 'STANDBY / LOCKED'}
          active={status === 'UNLOCK'}
        />
        <StatusCard 
          icon={<Zap size={20} />} 
          label="Power Mode" 
          value="LOW CONSUMPTION" 
        />
        <StatusCard 
          icon={<Fingerprint size={20} />} 
          label="Auth Method" 
          value="DUAL-FACTOR" 
        />
      </div>

      {/* CONTROL PANEL */}
      <div className="bg-[#EFE9E3] border border-[#D9CFC7] p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Shield size={200} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-[10px] font-black tracking-[0.4em] text-[#C9B59C] uppercase mb-4">
              Hardware Override
            </h3>
            <p className="text-2xl font-light text-[#4A443F] max-w-md leading-relaxed">
              Kendalikan kunci pintu secara manual untuk pengujian sistem atau akses darurat.
            </p>
          </div>

          <div className="flex gap-6">
            <button
              onClick={() => sendCommand('UNLOCK')}
              className={`group flex flex-col items-center gap-4 px-10 py-8 border transition-all duration-500 ${
                status === 'UNLOCK'
                  ? 'bg-[#4A443F] border-[#4A443F] text-[#F9F8F6]'
                  : 'bg-white border-[#D9CFC7] text-[#4A443F] hover:border-[#4A443F]'
              }`}
            >
              <Unlock size={24} className={status === 'UNLOCK' ? 'animate-bounce' : ''} />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">Open Door</span>
            </button>

            <button
              onClick={() => sendCommand('LOCK')}
              className={`group flex flex-col items-center gap-4 px-10 py-8 border transition-all duration-500 ${
                status === 'LOCK' || status === 'LOCKED' || status === 'IDLE'
                  ? 'bg-[#4A443F] border-[#4A443F] text-[#F9F8F6]'
                  : 'bg-white border-[#D9CFC7] text-[#4A443F] hover:border-[#4A443F]'
              }`}
            >
              <Lock size={24} />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">Lock Door</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ icon, label, value, active }) => (
  <div className="bg-white border border-[#D9CFC7] p-8 transition-all hover:shadow-md group">
    <div className={`mb-6 p-3 w-fit rounded-sm transition-colors ${active ? 'bg-[#4A443F] text-white' : 'bg-[#F9F8F6] text-[#C9B59C]'}`}>
      {icon}
    </div>
    <p className="text-[9px] font-black tracking-[0.3em] text-[#C9B59C] uppercase mb-1">{label}</p>
    <p className="text-sm font-bold text-[#4A443F] tracking-tight">{value}</p>
  </div>
);

export default Dashboard;