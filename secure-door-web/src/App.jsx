import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LayoutDashboard, Users, History, LockKeyhole, UserCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import DoorLogs from './components/DoorLogs';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState('LOCKED');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchInitialData();

    // Listener 1: Memantau perubahan status remote_control
    const remoteSubscription = supabase
      .channel('remote-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'remote_control' }, 
          payload => setStatus(payload.new.command))
      .subscribe();

    // Listener 2: Memantau data baru di door_logs secara Real-time
    const logsSubscription = supabase
      .channel('logs-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'door_logs' }, 
          () => {
            // Panggil ulang fetchInitialData agar data baru langsung digabung dengan nama user
            fetchInitialData(); 
          })
      .subscribe();

    // Listener 3: Memantau perubahan pada tabel User agar tabel DATABASE Real-time
    const userSubscription = supabase
      .channel('user-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_credentials' }, 
          () => {
            fetchUsersOnly(); 
          })
      .subscribe();

    return () => {
      supabase.removeChannel(remoteSubscription);
      supabase.removeChannel(logsSubscription);
      supabase.removeChannel(userSubscription);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Ambil data user credentials
      const { data: usersData } = await supabase
        .from('user_credentials')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Ambil data logs secara sederhana
      const { data: logsData, error: logsError } = await supabase
        .from('door_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

      // 3. PROSES PENGGABUNGAN DATA (Manual Join)
      // Ini memastikan data tidak kosong meskipun relasi di Supabase belum diatur
      const enrichedLogs = logsData.map(log => {
        const userData = usersData?.find(u => u.fingerprint_id === log.fingerprint_id);
        return {
          ...log,
          user_credentials: userData ? { name: userData.name } : null
        };
      });

      if (usersData) setUsers(usersData);
      if (enrichedLogs) setLogs(enrichedLogs);
      
      const { data: remote } = await supabase.from('remote_control').select('command').single();
      if (remote) setStatus(remote.command);

    } catch (err) {
      console.error("Error fetching initial data:", err.message);
    }
  };

  const fetchUsersOnly = async () => {
    const { data } = await supabase.from('user_credentials').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const sendCommand = async (cmd) => {
    const { error } = await supabase
      .from('remote_control')
      .update({ command: cmd })
      .eq('id', 1);

    if (error) {
      console.error("Error sending command:", error.message);
    } else {
      setStatus(cmd);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9F8F6] text-[#4A443F] font-sans selection:bg-[#C9B59C] selection:text-white">
      
      {/* SIDEBAR DYNAMIS */}
      <aside className="fixed left-0 top-0 h-screen bg-[#EFE9E3] border-r border-[#D9CFC7] z-50 transition-all duration-500 ease-in-out w-20 hover:w-64 group shadow-sm flex flex-col overflow-hidden">
        <div className="h-24 flex items-center shrink-0 cursor-default relative overflow-hidden">
          <div className="w-20 flex justify-center items-center shrink-0">
            <div className="transition-all duration-700 ease-in-out group-hover:rotate-[360deg] group-hover:scale-125">
              <LockKeyhole size={24} className="text-[#4A443F]" strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-xl tracking-[0.1em] group-hover:tracking-[0.25em] text-[#4A443F] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out whitespace-nowrap ml-1 font-medium group-hover:font-black">
            KUNCIIN
          </span>
          <div className="absolute bottom-6 left-20 right-10 h-[2px] bg-[#4A443F] scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left opacity-20" />
        </div>

        <nav className="flex-1 space-y-6 py-4">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={22}/>} label="DASHBOARD" />
          <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={22}/>} label="DATABASE" />
          <NavItem active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<History size={22}/>} label="HISTORY" />
        </nav>

        <div className="pb-8 border-t border-[#D9CFC7]">
          <NavItem active={activeTab === 'account'} onClick={() => setActiveTab('account')} icon={<UserCircle size={22}/>} label="ACCOUNT" />
        </div>
      </aside>

      <main className="flex-1 ml-20 p-16 transition-all duration-500">
        <header className="flex justify-between items-end mb-16">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-[#C9B59C] uppercase mb-2 font-bold">IoT Project</p>
            <h2 className="text-4xl font-light text-[#4A443F] tracking-tight uppercase leading-none">
              {activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold border border-[#D9CFC7] px-5 py-2 rounded-full text-[#4A443F] bg-white/50">
            <span className="w-2 h-2 bg-[#C9B59C] rounded-full animate-pulse"></span>
            NETWORK SECURED
          </div>
        </header>

        <div className="max-w-6xl">
          {activeTab === 'dashboard' && <Dashboard status={status} sendCommand={sendCommand} />}
          {activeTab === 'users' && <UserList users={users} refreshUsers={fetchInitialData} />}
          {activeTab === 'logs' && <DoorLogs logs={logs} />}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center transition-all duration-300 group/item relative h-14 overflow-hidden ${
      active ? 'text-[#4A443F]' : 'text-[#C9B59C] hover:text-[#4A443F]'
    }`}
  >
    <div className={`relative z-10 w-20 flex justify-center items-center shrink-0 transition-transform duration-300 ${active ? 'scale-115' : 'group-hover/item:scale-110'}`}>
      {icon}
      {active && <div className="absolute left-0 w-1 h-6 bg-[#4A443F] rounded-r-full" />}
    </div>
    <span className={`relative z-10 text-[11px] tracking-[0.2em] whitespace-nowrap transition-all duration-300 ml-1 opacity-0 group-hover:opacity-100 ${
      active ? 'font-black scale-105' : 'font-medium group-hover/item:font-bold'
    }`}>
      {label}
    </span>
  </button>
);

export default App;