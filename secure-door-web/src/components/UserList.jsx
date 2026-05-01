import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { UserPlus, X, Save } from 'lucide-react';

const UserList = ({ users, refreshUsers }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', fingerprint_id: '', rfid_uid: '' });

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    const { error: dbError } = await supabase
      .from('user_credentials')
      .insert([
        { 
          name: newUser.name, 
          fingerprint_id: parseInt(newUser.fingerprint_id), 
          rfid_uid: "WAITING..." 
        }
      ]);

    if (!dbError) {
      await supabase
        .from('remote_control')
        .update({ command: 'ENROLL' })
        .eq('id', 1);

      alert("System Ready. Please proceed with physical sensor enrollment.");
      
      setNewUser({ name: '', fingerprint_id: '', rfid_uid: '' });
      setIsAdding(false);
      refreshUsers();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER ACTIONS */}
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

      {/* FORM ENROLLMENT */}
      {isAdding && (
        <div className="bg-[#EFE9E3] p-12 border border-[#D9CFC7] shadow-sm relative overflow-hidden">
          <h4 className="text-[10px] font-black text-[#C9B59C] tracking-[0.4em] mb-10 uppercase">Identity Enrollment Form</h4>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#4A443F] uppercase tracking-widest">Full Name</label>
              <input 
                required
                className="w-full bg-transparent border-b border-[#C9B59C] py-2 focus:border-[#4A443F] outline-none transition-colors text-[#4A443F] text-sm placeholder:text-[#C9B59C]/50"
                placeholder="Ex: Niken"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#4A443F] uppercase tracking-widest">Fingerprint ID</label>
              <input 
                required
                type="number"
                className="w-full bg-transparent border-b border-[#C9B59C] py-2 focus:border-[#4A443F] outline-none transition-colors text-[#4A443F] text-sm placeholder:text-[#C9B59C]/50"
                placeholder="Range 1-127"
                value={newUser.fingerprint_id}
                onChange={(e) => setNewUser({...newUser, fingerprint_id: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full bg-white border border-[#D9CFC7] text-[#4A443F] py-3.5 font-black text-[10px] tracking-[0.2em] hover:bg-[#4A443F] hover:text-white transition-all uppercase shadow-sm"
              >
                Start Enrollment Process
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE DATA */}
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
            {users.map((user, i) => (
              <tr key={i} className="hover:bg-[#F9F8F6] transition-colors group">
                <td className="px-10 py-6 text-sm font-bold text-[#4A443F] tracking-tight">
                  {user.name}
                </td>
                <td className="px-10 py-6 text-xs font-mono text-center text-[#8B5E3C]">
                  ID_{user.fingerprint_id.toString().padStart(3, '0')}
                </td>
                <td className="px-10 py-6 text-right font-mono text-[15px] text-[#8B5E3C] opacity-60">
                  {user.rfid_uid}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;