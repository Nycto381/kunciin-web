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
      const { data: usersData } = await supabase
        .from('user_credentials')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: logsData, error: logsError } = await supabase
        .from('door_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

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
      
      {/* SIDEBAR: Desktop (Kiri) & Mobile (Bawah) */}
      <aside className="fixed bottom-0 left-0 w-full h-20 bg-[#EFE9E3]/90 backdrop-blur-md border-t border-[#D9CFC7] z-[100] 
                        md:top-0 md:left-0 md:h-screen md:w-20 md:hover:w-64 md:border-r md:border-t-0 md:bg-[#EFE9E3] 
                        flex flex-row md:flex-col transition-all duration-500 ease-in-out shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none overflow-hidden">
        
        {/* Logo Section - Hanya muncul di Desktop */}
        <div className="hidden md:flex h-24 items-center shrink-0 cursor-default relative overflow-hidden">
          <div className="w-20 flex justify-center items-center shrink-0">
            <div className="transition-all duration-700 ease-in-out group-hover:rotate-[360deg] group-hover:scale-125">
              <LockKeyhole size={24} className="text-[#4A443F]" strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-xl tracking-[0.1em] font-medium ml-1">KUNCIIN</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-row md:flex-col flex-1 items-center justify-around md:justify-start md:py-4 md:space-y-6 w-full">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={22}/>} label="DASHBOARD" />
          <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={22}/>} label="DATABASE" />
          <NavItem active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<History size={22}/>} label="HISTORY" />
          {/* Mobile version of Account */}
          <div className="md:hidden">
            <NavItem active={activeTab === 'account'} onClick={() => setActiveTab('account')} icon={<UserCircle size={22}/>} label="ACCOUNT" />
          </div>
        </nav>

        {/* Account Section - Hanya muncul di Desktop */}
        <div className="hidden md:block pb-8 border-t border-[#D9CFC7]">
          <NavItem active={activeTab === 'account'} onClick={() => setActiveTab('account')} icon={<UserCircle size={22}/>} label="ACCOUNT" />
        </div>
      </aside>

      {/* MAIN CONTENT Area */}
      <main className="flex-1 transition-all duration-500 
                       ml-0 md:ml-20 
                       p-6 md:p-16 
                       pb-32 md:pb-16"> 
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] tracking-[0.4em] text-[#C9B59C] uppercase font-bold">IoT Project</p>
            <h2 className="text-3xl md:text-4xl font-light text-[#4A443F] tracking-tight uppercase leading-none">
              {activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-bold border border-[#D9CFC7] px-4 py-2 rounded-full text-[#4A443F] bg-white/50 backdrop-blur-sm self-end md:self-auto">
            <span className="w-2 h-2 bg-[#C9B59C] rounded-full animate-pulse"></span>
            NETWORK SECURED
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
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
    className={`flex flex-col md:flex-row items-center justify-center md:justify-start transition-all duration-300 relative 
                w-full h-full md:h-14 
                ${active ? 'text-[#4A443F]' : 'text-[#C9B59C] hover:text-[#4A443F]'}`}
  >
    {/* Icon Container */}
    <div className={`relative z-10 md:w-20 flex justify-center items-center shrink-0 transition-transform duration-300 
                    ${active ? 'scale-110 md:scale-115' : 'hover:scale-110'}`}>
      {icon}
      {/* Active Indicator: Desktop (Side), Mobile (Top) */}
      {active && (
        <>
          <div className="hidden md:block absolute left-0 w-1 h-6 bg-[#4A443F] rounded-r-full" />
          <div className="md:hidden absolute -top-4 w-8 h-1 bg-[#4A443F] rounded-b-full shadow-[0_2px_10px_rgba(74,68,63,0.3)]" />
        </>
      )}
    </div>

    {/* Label */}
    <span className={`text-[9px] md:text-[11px] tracking-[0.1em] md:tracking-[0.2em] whitespace-nowrap transition-all duration-300 
                      mt-1 md:mt-0 md:ml-1 md:opacity-0 md:group-hover:opacity-100 
                      ${active ? 'font-black' : 'font-medium'}`}>
      {label}
    </span>
  </button>
);

export default App;