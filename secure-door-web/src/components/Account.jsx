import { UserCircle, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Account = ({ user }) => {

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="max-w-md mx-auto mt-10 md:mt-20 text-center bg-white p-10 rounded-[3rem] border border-[#D9CFC7] shadow-xl">
      {user ? (
        // Tampilan Jika Sudah Login
        <>
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <img 
              src={user.user_metadata.avatar_url} 
              className="rounded-full border-4 border-[#EFE9E3]" 
              alt="profile" 
            />
          </div>
          <h3 className="text-xl font-bold text-[#4A443F] mb-1">{user.user_metadata.full_name}</h3>
          <p className="text-slate-500 text-sm mb-8">{user.email}</p>
          
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-100 transition-all border border-red-100"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </>
      ) : (
        // Tampilan Jika Belum Login
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

export default Account;