import React, { useState } from 'react';
import { Order } from '../types';
import { Clock, CheckCircle, XCircle, Search, DollarSign, Calendar, Filter, Trash2 } from 'lucide-react';

interface AdminDisplayProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export const AdminDisplay: React.FC<AdminDisplayProps> = ({ orders, onUpdateStatus }) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'preparing' | 'completed'>('all');

  // Ordenar: Mais recentes primeiro
  const sortedOrders = [...orders].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const filteredOrders = sortedOrders.filter(order => {
    const matchesText = 
        order.customerName.toLowerCase().includes(filter.toLowerCase()) ||
        (order.tableName && order.tableName.includes(filter)) ||
        order.id.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesText && matchesStatus;
  });

  // Cálculo simples de métricas (baseado na quantidade de itens, já que o preço não é salvo no pedido individualmente nesta versão)
  // Numa versão futura, o preço deveria ser salvo no objeto Order
  const totalOrders = filteredOrders.length;
  const completedCount = filteredOrders.filter(o => o.status === 'completed').length;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white min-h-[calc(100vh-100px)] rounded-xl shadow-xl mt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-stone-200">
        <div>
            <h2 className="text-3xl font-display font-bold text-wood-900 uppercase">Gestão & Caixa</h2>
            <p className="text-stone-500 text-sm">Visão geral de todos os pedidos do restaurante</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
            <div className="bg-green-100 p-4 rounded-lg border border-green-200 text-center min-w-[120px]">
                <span className="block text-2xl font-bold text-green-700">{totalOrders}</span>
                <span className="text-xs uppercase font-bold text-green-600">Pedidos Hoje</span>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg border border-blue-200 text-center min-w-[120px]">
                <span className="block text-2xl font-bold text-blue-700">{completedCount}</span>
                <span className="text-xs uppercase font-bold text-blue-600">Concluídos</span>
            </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-stone-400" size={18} />
            <input 
                type="text" 
                placeholder="Buscar por Mesa, Cliente ou ID..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
            />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter size={18} className="text-stone-400" />
            {(['all', 'pending', 'preparing', 'completed'] as const).map(status => (
                <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
                        statusFilter === status 
                        ? 'bg-wood-800 text-brand-yellow shadow-md' 
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                >
                    {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'preparing' ? 'Na Cozinha' : 'Prontos'}
                </button>
            ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg border-stone-200 shadow-sm">
        <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase font-bold tracking-wider">
                <tr>
                    <th className="p-4 border-b border-stone-200">Hora</th>
                    <th className="p-4 border-b border-stone-200">Mesa / Cliente</th>
                    <th className="p-4 border-b border-stone-200">Itens</th>
                    <th className="p-4 border-b border-stone-200">Obs</th>
                    <th className="p-4 border-b border-stone-200 text-center">Status</th>
                    <th className="p-4 border-b border-stone-200 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50 transition-colors group">
                            <td className="p-4 whitespace-nowrap text-stone-500 font-mono">
                                {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-4">
                                <div className="font-bold text-wood-900">
                                    {order.tableName ? `MESA ${order.tableName}` : 'BALCÃO'}
                                </div>
                                <div className="text-xs text-stone-400 flex items-center gap-1">
                                    {order.customerName} <span className="text-stone-300">|</span> #{order.id.slice(-4)}
                                </div>
                            </td>
                            <td className="p-4 max-w-xs">
                                <div className="flex flex-wrap gap-1">
                                    {order.items.map((item, idx) => (
                                        <span key={idx} className="bg-stone-100 border border-stone-200 px-2 py-0.5 rounded text-xs text-stone-700">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="p-4 text-stone-500 italic max-w-[150px] truncate">
                                {order.observation || '-'}
                            </td>
                            <td className="p-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                    order.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                    'bg-red-100 text-red-700 border-red-200'
                                }`}>
                                    {order.status === 'completed' && <CheckCircle size={10} />}
                                    {order.status === 'preparing' && <Clock size={10} />}
                                    {order.status === 'pending' && <XCircle size={10} />}
                                    {order.status === 'completed' ? 'Concluído' : order.status === 'preparing' ? 'Preparando' : 'Pendente'}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                {order.status !== 'completed' && (
                                    <button 
                                        onClick={() => onUpdateStatus(order.id, 'completed')}
                                        className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded font-bold transition-colors"
                                    >
                                        Concluir
                                    </button>
                                )}
                                {order.status === 'completed' && (
                                    <button 
                                        onClick={() => { if(confirm('Reabrir pedido?')) onUpdateStatus(order.id, 'preparing') }}
                                        className="text-xs text-stone-400 hover:text-wood-900 underline decoration-dotted"
                                    >
                                        Reabrir
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="p-12 text-center text-stone-400">
                            <div className="flex flex-col items-center gap-2">
                                <Search size={32} className="opacity-20" />
                                <p>Nenhum pedido encontrado com os filtros atuais.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};