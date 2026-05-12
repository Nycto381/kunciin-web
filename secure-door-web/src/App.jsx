import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LayoutDashboard, Users, History, LockKeyhole, UserCircle, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import DoorLogs from './components/DoorLogs';

// --- KOMPONEN ACCOUNT (DALAM FILE YANG SAMA) ---
const Account = ({ user }) => {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="max-w-md mx-auto mt-10 md:mt-20 text-center bg-white p-10 rounded-[3rem] border border-[#D9CFC7] shadow-xl">
      {user ? (
        <>
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <img 
              src={user.user_metadata.avatar_url} 
              className="rounded-full border-4 border-[#EFE9E3] shadow-sm" 
              alt="profile" 
            />
          </div>
          <h3 className="text-xl font-bold text-[#4A443F] mb-1">{user.user_metadata.full_name}</h3>
          <p className="text-[#C9B59C] text-sm mb-8">{user.email}</p>
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-100 transition-all border border-red-100"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-[#EFE9E3] rounded-full mx-auto mb-6 flex items-center justify-center text-[#C9B59C]">
            <UserCircle size={48} />
          </div>
          <h3 className="text-xl font-bold text-[#4A443F] mb-2">Otentikasi Gmail</h3>
          <p className="text-[#C9B59C] text-sm mb-8 italic">Silakan hubungkan akun Google Anda untuk akses admin.</p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-[#4A443F] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="google" />
            Sign in with Google
          </button>
        </>
      )}
    </div>
  );
};

// --- KOMPONEN UTAMA APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState('LOCKED');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchInitialData();

    // Realtime Subscriptions
    const remoteSub = supabase.channel('remote-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'remote_control' }, 
          payload => setStatus(payload.new.command)).subscribe();

    const logsSub = supabase.channel('logs-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'door_logs' }, 
          () => fetchInitialData()).subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(remoteSub);
      supabase.removeChannel(logsSub);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: uData } = await supabase.from('user_credentials').select('*');
      const { data: lData } = await supabase.from('door_logs').select('*').order('created_at', { ascending: false }).limit(10);
      
      if (lData) {
        const enriched = lData.map(log => ({
          ...log,
          user_credentials: uData?.find(u => u.fingerprint_id === log.fingerprint_id) ? { name: uData.find(u => u.fingerprint_id === log.fingerprint_id).name } : null
        }));
        setLogs(enriched);
      }
      if (uData) setUsers(uData);
      
      const { data: remote } = await supabase.from('remote_control').select('command').single();
      if (remote) setStatus(remote.command);
    } catch (err) {
      console.error(err);
    }
  };

  const sendCommand = async (cmd) => {
    const { error } = await supabase.from('remote_control').update({ command: cmd }).eq('id', 1);
    if (!error) setStatus(cmd);
  };

  const isAuth = !!session;

  return (
    <div className="flex min-h-screen bg-[#F9F8F6] text-[#4A443F] font-sans selection:bg-[#C9B59C] selection:text-white">
      
      {/* SIDEBAR DYNAMIS & RESPONSIVE */}
      <aside className="fixed bottom-0 left-0 w-full h-20 bg-[#EFE9E3]/90 backdrop-blur-md border-t border-[#D9CFC7] z-[100] 
                        md:top-0 md:left-0 md:h-screen md:w-20 md:hover:w-64 md:border-r md:border-t-0 md:bg-[#EFE9E3] 
                        flex flex-row md:flex-col transition-all duration-500 ease-in-out group shadow-lg md:shadow-none overflow-hidden">
        
        <div className="hidden md:flex h-24 items-center shrink-0 cursor-default relative overflow-hidden">
          <div className="w-20 flex justify-center items-center shrink-0">
            <LockKeyhole size={24} className="group-hover:rotate-[360deg] transition-transform duration-700" />
          </div>
          <span className="text-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500">KUNCIIN</span>
        </div>

        <nav className="flex flex-row md:flex-col flex-1 items-center justify-around md:justify-start md:py-4 md:space-y-6 w-full">
          {isAuth && (
            <>
              <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={22}/>} label="DASHBOARD" />
              <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={22}/>} label="DATABASE" />
              <NavItem active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<History size={22}/>} label="HISTORY" />
            </>
          )}
          <NavItem active={activeTab === 'account'} onClick={() => setActiveTab('account')} icon={<UserCircle size={22}/>} label="ACCOUNT" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 md:ml-20 p-6 md:p-16 pb-32 transition-all duration-500">
        {!isAuth && activeTab !== 'account' ? (
          <div className="flex flex-col items-center justify-center mt-20">
             <LockKeyhole size={64} className="text-[#C9B59C] mb-4 animate-bounce" />
             <h2 className="text-2xl font-light tracking-widest text-[#C9B59C]">RESTRICTED ACCESS</h2>
             <p className="text-sm text-[#D9CFC7] mt-2">Please login to access the dashboard</p>
             <button 
              onClick={() => setActiveTab('account')}
              className="mt-8 px-8 py-3 bg-[#4A443F] text-white rounded-full font-bold hover:scale-105 transition-transform"
             >
               Go to Login
             </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] tracking-[0.4em] text-[#C9B59C] uppercase font-bold">IoT Project</p>
                <h2 className="text-3xl md:text-4xl font-light text-[#4A443F] tracking-tight uppercase leading-none">{activeTab}</h2>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-bold border border-[#D9CFC7] px-4 py-2 rounded-full text-[#4A443F] bg-white/50 backdrop-blur-sm">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isAuth ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {isAuth ? 'SESSION ACTIVE' : 'UNAUTHORIZED'}
              </div>
            </header>

            {activeTab === 'dashboard' && <Dashboard status={status} sendCommand={sendCommand} />}
            {activeTab === 'users' && <UserList users={users} refreshUsers={fetchInitialData} />}
            {activeTab === 'logs' && <DoorLogs logs={logs} />}
            {activeTab === 'account' && <Account user={session?.user} />}
          </div>
        )}
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col md:flex-row items-center justify-center md:justify-start transition-all duration-300 relative w-full h-full md:h-14 ${active ? 'text-[#4A443F]' : 'text-[#C9B59C] hover:text-[#4A443F]'}`}>
    <div className={`relative z-10 md:w-20 flex justify-center items-center shrink-0 transition-transform ${active ? 'scale-110' : ''}`}>
      {icon}
      {active && (
        <>
          <div className="hidden md:block absolute left-0 w-1 h-6 bg-[#4A443F] rounded-r-full" />
          <div className="md:hidden absolute -top-4 w-8 h-1 bg-[#4A443F] rounded-b-full shadow-md" />
        </>
      )}
    </div>
    <span className={`text-[9px] md:text-[11px] tracking-[0.1em] md:opacity-0 md:group-hover:opacity-100 transition-all mt-1 md:mt-0 md:ml-1 ${active ? 'font-black' : 'font-medium'}`}>{label}</span>
  </button>
);

export default App;