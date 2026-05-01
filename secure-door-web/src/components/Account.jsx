import { UserCircle } from 'lucide-react';

const Account = () => (
  <div className="max-w-md mx-auto mt-20 text-center bg-[#161b2c] p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
    <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-6 flex items-center justify-center text-slate-500">
      <UserCircle size={48} />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">Otentikasi Gmail</h3>
    <p className="text-slate-500 text-sm mb-8 italic">Silakan hubungkan akun Google Anda untuk akses admin.</p>
    <button className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-lg">
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="google" />
      Sign in with Google
    </button>
  </div>
);

export default Account;