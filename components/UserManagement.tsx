import React, { useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { getAllUsers, updateUserRole } from '../services/userService';
import { Shield, User, ChefHat, Coffee, RefreshCw, Search } from 'lucide-react';
import { isFirebaseInitialized } from '../services/firebase';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao carregar usuários", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    // Otimistic update
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    
    try {
      await updateUserRole(uid, newRole);
    } catch (error) {
      console.error("Erro ao atualizar cargo", error);
      loadUsers(); // Revert on error
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch(role) {
      case 'admin': return <Shield size={16} className="text-red-500" />;
      case 'kitchen': return <ChefHat size={16} className="text-orange-500" />;
      case 'waiter': return <Coffee size={16} className="text-blue-500" />;
      default: return <User size={16} className="text-stone-500" />;
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(filter.toLowerCase()) || 
    u.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-xl mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-display font-bold text-wood-900 uppercase">Gestão de Usuários</h2>
            <p className="text-stone-500 text-sm">Controle de acesso e cargos da equipe</p>
        </div>
        <button 
            onClick={loadUsers} 
            className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors text-stone-600"
            title="Atualizar Lista"
        >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {!isFirebaseInitialized && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 text-sm">
            <p className="font-bold">Modo Local Ativo</p>
            <p>As alterações são salvas apenas neste navegador. Configure o Firebase para persistência real entre dispositivos.</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-stone-400" size={18} />
        <input 
            type="text" 
            placeholder="Buscar por nome ou email..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto border rounded-lg border-stone-200">
        <table className="w-full text-left border-collapse">
            <thead className="bg-stone-100 text-stone-600 text-xs uppercase font-bold">
                <tr>
                    <th className="p-4 border-b border-stone-200">Usuário</th>
                    <th className="p-4 border-b border-stone-200">Email</th>
                    <th className="p-4 border-b border-stone-200">Cargo Atual</th>
                    <th className="p-4 border-b border-stone-200 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <tr key={user.uid} className="hover:bg-stone-50 transition-colors">
                            <td className="p-4">
                                <div className="font-bold text-wood-900">{user.displayName}</div>
                                <div className="text-xs text-stone-400">ID: {user.uid.slice(0, 8)}...</div>
                            </td>
                            <td className="p-4 text-stone-600">{user.email}</td>
                            <td className="p-4">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 w-max text-sm font-medium">
                                    {getRoleIcon(user.role)}
                                    <span className="capitalize">{user.role}</span>
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <select 
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                                    className="bg-white border border-stone-300 text-stone-700 text-sm rounded focus:ring-brand-yellow focus:border-brand-yellow p-1.5"
                                >
                                    <option value="customer">Cliente</option>
                                    <option value="waiter">Garçom</option>
                                    <option value="kitchen">Cozinha</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-stone-500">
                            Nenhum usuário encontrado.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};
