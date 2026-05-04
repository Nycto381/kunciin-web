import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserPlus, X } from 'lucide-react';

const UserList = ({ users, refreshUsers }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', fingerprint_id: '', rfid_uid: '' });
  const [currentRegId, setCurrentRegId] = useState(null); 

  useEffect(() => {
    if (!isAdding) return;

    const channel = supabase
      .channel('realtime-enroll')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_credentials' }, 
        async (payload) => {
          // LOGIKA PERBAIKAN:
          // Kita menangkap INSERT yang dilakukan oleh ESP32 (saveNewUserToDB)
          // Data dari ESP32 biasanya datang dengan rfid_uid dan fingerprint_id tapi Nama kosong
          if (!payload.new.name && payload.new.rfid_uid) {
            
            // 1. Update baris yang baru saja dibuat ESP32 dengan Nama dari State Web
            const { error: updateErr } = await supabase
              .from('user_credentials')
              .update({ name: newUser.name }) // Mengambil nama dari input form
              .eq('id', payload.new.id);

            if (!updateErr) {
              // 2. NETRALKAN STATUS (CRITICAL)
              // Kembalikan ke IDLE agar ESP32 berhenti mode ENROLL dan tidak crash
              await supabase
                .from('remote_control')
                .update({ command: 'IDLE' }) 
                .eq('id', 1);

              alert(`Enrollment Success! User: ${newUser.name}`);
              setIsAdding(false);
              setNewUser({ name: '', fingerprint_id: '', rfid_uid: '' });
              refreshUsers();
            }
          }
        }
      ).subscribe();

    return () => supabase.removeChannel(channel);
  }, [isAdding, newUser.name, refreshUsers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // PERBAIKAN: Jangan Insert baris di sini. 
    // Biarkan ESP32 yang melakukan Insert melalui fungsi saveNewUserToDB() miliknya.
    // Web hanya bertugas memberikan perintah ENROLL.
    const { error: cmdError } = await supabase
      .from('remote_control')
      .update({ command: 'ENROLL' })
      .eq('id', 1);

    if (!cmdError) {
      alert("Sistem Siap. Silakan scan Sidik Jari, lalu Kartu RFID pada alat.");
      // Kita tidak mengosongkan newUser.name di sini agar bisa digunakan saat Update nanti
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-3 px-6 py-3 transition-all text-[11px] font-black tracking-[0.2em] uppercase border shadow-sm ${
            isAdding 
              ? 'bg-white border-[#D9CFC7] text-[#4A443F]' 
              : 'bg-[#4A443F] border-[#4A443F] text-[#F9F8F6] hover:bg-[#3d3834]'
          }`}
        >
          {isAdding ? <X size={16} /> : <UserPlus size={16} />}
          {isAdding ? 'Cancel Registration' : 'Register New Member'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#EFE9E3] p-12 border border-[#D9CFC7] shadow-sm relative overflow-hidden">
          <h4 className="text-[10px] font-black text-[#C9B59C] tracking-[0.4em] mb-10 uppercase">Identity Enrollment Form</h4>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#4A443F] uppercase tracking-widest">Full Name</label>
              <input 
                required
                className="w-full bg-transparent border-b border-[#C9B59C] py-2 focus:border-[#4A443F] outline-none transition-colors text-[#4A443F] text-sm"
                placeholder="Ex: Niken"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full bg-white border border-[#D9CFC7] py-3.5 font-black text-[10px] tracking-[0.2em] transition-all uppercase hover:bg-[#4A443F] hover:text-white"
              >
                Start Enrollment Process
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel tetap dipertahankan sesuai kode asli kamu */}
      <div className="bg-white border border-[#D9CFC7] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#EFE9E3] border-b border-[#D9CFC7] text-[#C9B59C]">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black tracking-[0.3em] uppercase">Name</th>
              <th className="px-10 py-6 text-[10px] font-black tracking-[0.3em] uppercase text-center">Finger Print ID</th>
              <th className="px-10 py-6 text-[10px] font-black tracking-[0.3em] uppercase text-right">RFID UID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE9E3]">
            {users.filter(user => user.name).map((user, i) => (
              <tr key={i} className="hover:bg-[#F9F8F6] transition-colors group">
                <td className="px-10 py-6 text-sm font-bold text-[#4A443F] tracking-tight">{user.name}</td>
                <td className="px-10 py-6 text-xs font-mono text-center text-[#8B5E3C]">
                  ID_{user.fingerprint_id?.toString().padStart(3, '0')}
                </td>
                <td className="px-10 py-6 text-right font-mono text-[15px] text-[#8B5E3C] opacity-60">{user.rfid_uid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;