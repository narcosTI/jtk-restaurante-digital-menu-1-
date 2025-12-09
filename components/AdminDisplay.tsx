import React, { useState } from 'react';
import { Order } from '../types';
import { Clock, CheckCircle, XCircle, Search, Filter, Flame, ChevronRight, AlertCircle } from 'lucide-react';

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

  const totalOrders = filteredOrders.length;
  const completedCount = filteredOrders.filter(o => o.status === 'completed').length;
  const pendingCount = filteredOrders.filter(o => o.status === 'pending').length;

  return (
    <div className="w-full max-w-[98%] mx-auto p-2 md:p-6 bg-white min-h-[calc(100vh-100px)] rounded-3xl shadow-xl mt-4 relative overflow-hidden">
      <style>{`
        /* Remove Scrollbars visuais mas mantém funcionalidade */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 pb-6 border-b border-stone-100 gap-6">
        <div>
            <h2 className="text-4xl font-display font-bold text-wood-900 uppercase tracking-tight">Gestão & Caixa</h2>
            <p className="text-stone-400 text-sm mt-1">Visão panorâmica do restaurante</p>
        </div>
        
        <div className="flex gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar pb-2 xl:pb-0">
            <div className="bg-stone-50 px-6 py-3 rounded-2xl border border-stone-100 min-w-[140px] flex flex-col justify-center">
                <span className="text-xs uppercase font-bold text-stone-400 mb-1">Total Pedidos</span>
                <span className="text-3xl font-bold text-wood-900 leading-none">{totalOrders}</span>
            </div>
            <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100 min-w-[140px] flex flex-col justify-center">
                <span className="text-xs uppercase font-bold text-red-400 mb-1">Pendentes</span>
                <span className="text-3xl font-bold text-red-600 leading-none">{pendingCount}</span>
            </div>
            <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100 min-w-[140px] flex flex-col justify-center">
                <span className="text-xs uppercase font-bold text-green-400 mb-1">Concluídos</span>
                <span className="text-3xl font-bold text-green-600 leading-none">{completedCount}</span>
            </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center bg-stone-50/50 p-2 rounded-2xl border border-stone-100">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 text-stone-400" size={20} />
            <input 
                type="text" 
                placeholder="Buscar Mesa, Cliente, ID..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-white pl-12 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-brand-yellow/50 text-stone-700 placeholder-stone-400 transition-all"
            />
        </div>
        
        <div className="flex items-center gap-1 w-full lg:w-auto overflow-x-auto no-scrollbar px-1">
            <Filter size={18} className="text-stone-400 mr-2 hidden md:block" />
            {(['all', 'pending', 'preparing', 'completed'] as const).map(status => (
                <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                        statusFilter === status 
                        ? 'bg-wood-900 text-white shadow-lg shadow-wood-900/20 transform scale-105' 
                        : 'text-stone-500 hover:bg-stone-200/50'
                    }`}
                >
                    {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'preparing' ? 'Cozinha' : 'Prontos'}
                </button>
            ))}
        </div>
      </div>

      {/* Table Container - Clean & Wide */}
      <div className="w-full overflow-x-auto no-scrollbar min-h-[400px]">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-stone-100">
                    <th className="py-4 pl-4 pr-6 text-stone-400 text-[10px] uppercase font-bold tracking-widest w-24">Hora</th>
                    <th className="py-4 px-6 text-stone-400 text-[10px] uppercase font-bold tracking-widest w-48">Local / Cliente</th>
                    <th className="py-4 px-6 text-stone-400 text-[10px] uppercase font-bold tracking-widest">Itens do Pedido</th>
                    <th className="py-4 px-6 text-stone-400 text-[10px] uppercase font-bold tracking-widest w-32 text-center">Status</th>
                    <th className="py-4 px-6 text-stone-400 text-[10px] uppercase font-bold tracking-widest w-32 text-right">Ação</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50/80 transition-all duration-200 group">
                            {/* TIME */}
                            <td className="py-6 pl-4 pr-6 align-top">
                                <div className="font-mono text-stone-500 text-sm font-medium">
                                    {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-[10px] text-stone-300 mt-1">
                                    #{order.id.slice(-4)}
                                </div>
                            </td>

                            {/* TABLE / CUSTOMER */}
                            <td className="py-6 px-6 align-top">
                                {order.tableName ? (
                                    <div className="inline-flex items-center justify-center bg-wood-900 text-brand-yellow px-3 py-1 rounded-lg font-bold text-sm shadow-sm mb-1">
                                        MESA {order.tableName}
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center justify-center bg-stone-200 text-stone-600 px-3 py-1 rounded-lg font-bold text-xs shadow-sm mb-1">
                                        BALCÃO / ONLINE
                                    </div>
                                )}
                                <div className="text-xs font-medium text-stone-500 truncate max-w-[150px]">
                                    {order.customerName}
                                </div>
                            </td>

                            {/* ITEMS & OBS */}
                            <td className="py-6 px-6 align-top">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {order.items.map((item, idx) => (
                                        <span key={idx} className="bg-white border border-stone-200 text-stone-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                {order.observation && (
                                    <div className="flex items-start gap-1.5 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg max-w-md">
                                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                                        <span className="italic font-medium">{order.observation}</span>
                                    </div>
                                )}
                            </td>

                            {/* STATUS */}
                            <td className="py-6 px-6 align-top text-center">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                    order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                    order.status === 'preparing' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        order.status === 'completed' ? 'bg-green-500' :
                                        order.status === 'preparing' ? 'bg-yellow-500 animate-pulse' :
                                        'bg-red-500'
                                    }`}></div>
                                    {order.status === 'completed' ? 'Pronto' : order.status === 'preparing' ? 'Fazendo' : 'Fila'}
                                </div>
                            </td>

                            {/* ACTIONS */}
                            <td className="py-6 px-6 align-top text-right">
                                {order.status === 'pending' && (
                                    <button 
                                        onClick={() => onUpdateStatus(order.id, 'preparing')}
                                        className="bg-brand-orange hover:bg-orange-500 text-wood-900 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors shadow-sm flex items-center gap-1 ml-auto"
                                    >
                                        <Flame size={14} /> Preparar
                                    </button>
                                )}
                                {order.status === 'preparing' && (
                                    <button 
                                        onClick={() => onUpdateStatus(order.id, 'completed')}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors shadow-sm flex items-center gap-1 ml-auto"
                                    >
                                        <CheckCircle size={14} /> Concluir
                                    </button>
                                )}
                                {order.status === 'completed' && (
                                    <button 
                                        onClick={() => { if(confirm('Reabrir pedido?')) onUpdateStatus(order.id, 'preparing') }}
                                        className="text-stone-400 hover:text-wood-900 text-xs font-bold uppercase flex items-center gap-1 ml-auto group-hover:underline"
                                    >
                                        Reabrir <ChevronRight size={12} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="py-20 text-center text-stone-400">
                            <div className="flex flex-col items-center gap-3">
                                <div className="bg-stone-100 p-4 rounded-full">
                                    <Search size={32} className="opacity-30" />
                                </div>
                                <p className="font-medium">Nenhum pedido encontrado.</p>
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