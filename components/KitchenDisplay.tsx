import React from 'react';
import { Order } from '../types';
import { CheckCircle, Clock, ChefHat, Wifi, WifiOff, Flame, ArrowRight, PackageCheck, User, StickyNote } from 'lucide-react';

interface KitchenDisplayProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  isOnline: boolean;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({ orders, onUpdateStatus, isOnline }) => {
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const completedOrders = orders.filter(o => o.status === 'completed');

  // Sort: Oldest first for Pending/Preparing, Newest first for Completed
  pendingOrders.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  preparingOrders.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  completedOrders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Limit completed orders display to prevent clutter
  const recentCompleted = completedOrders.slice(0, 10);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-3">
            <div className="bg-brand-orange p-3 rounded-full text-wood-900 shadow-lg">
                <ChefHat size={32} />
            </div>
            <div>
                <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">Cozinha</h2>
                <p className="text-stone-400 text-sm">Monitor de Pedidos</p>
            </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isOnline ? 'bg-green-900/50 border-green-700 text-green-400' : 'bg-stone-800 border-stone-700 text-stone-500'}`}>
            {isOnline ? <><Wifi size={14} /> ONLINE</> : <><WifiOff size={14} /> LOCAL</>}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        
        {/* Column 1: Pendentes */}
        <OrderColumn 
            title="Na Fila" 
            count={pendingOrders.length}
            color="red"
            icon={<Clock size={20} />}
        >
            {pendingOrders.map(order => (
                <OrderCard 
                    key={order.id} 
                    order={order} 
                    type="pending"
                    onAction={() => onUpdateStatus(order.id, 'preparing')}
                    actionLabel="Cozinhar"
                    actionIcon={<Flame size={18} />}
                    colorClass="border-l-4 border-red-500"
                />
            ))}
            {pendingOrders.length === 0 && <EmptyState message="Sem novos pedidos" />}
        </OrderColumn>

        {/* Column 2: Preparando */}
        <OrderColumn 
            title="Preparando" 
            count={preparingOrders.length}
            color="yellow"
            icon={<Flame size={20} />}
        >
            {preparingOrders.map(order => (
                <OrderCard 
                    key={order.id} 
                    order={order} 
                    type="preparing"
                    onAction={() => onUpdateStatus(order.id, 'completed')}
                    actionLabel="Pronto"
                    actionIcon={<CheckCircle size={18} />}
                    colorClass="border-l-4 border-yellow-500 bg-yellow-900/10"
                />
            ))}
             {preparingOrders.length === 0 && <EmptyState message="Cozinha livre" />}
        </OrderColumn>

        {/* Column 3: Prontos */}
        <OrderColumn 
            title="Prontos / Entregar" 
            count={recentCompleted.length}
            color="green"
            icon={<PackageCheck size={20} />}
        >
            {recentCompleted.map(order => (
                <OrderCard 
                    key={order.id} 
                    order={order} 
                    type="completed"
                    onAction={() => {}} // Could be "Archive" or "Delivered"
                    actionLabel="Concluído"
                    actionIcon={<CheckCircle size={18} />}
                    colorClass="border-l-4 border-green-500 opacity-75"
                    readonly
                />
            ))}
            {recentCompleted.length === 0 && <EmptyState message="Nenhum pedido recente" />}
        </OrderColumn>

      </div>
    </div>
  );
};

// Helper Components

const OrderColumn: React.FC<{ title: string; count: number; children: React.ReactNode; color: 'red' | 'yellow' | 'green'; icon: React.ReactNode }> = ({ title, count, children, color, icon }) => {
    const colorStyles = {
        red: 'text-red-400 border-red-900/50 bg-red-950/20',
        yellow: 'text-yellow-400 border-yellow-900/50 bg-yellow-950/20',
        green: 'text-green-400 border-green-900/50 bg-green-950/20'
    };

    return (
        <div className={`flex-1 flex flex-col min-w-[300px] rounded-xl border ${colorStyles[color]} overflow-hidden`}>
            <div className={`p-4 flex items-center justify-between border-b ${color === 'red' ? 'border-red-900/30' : color === 'yellow' ? 'border-yellow-900/30' : 'border-green-900/30'} bg-black/20`}>
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                    {icon}
                    <span className={color === 'red' ? 'text-red-200' : color === 'yellow' ? 'text-yellow-200' : 'text-green-200'}>{title}</span>
                </div>
                <span className="bg-wood-900 text-white text-xs font-bold px-2 py-1 rounded-full border border-stone-700">
                    {count}
                </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {children}
            </div>
        </div>
    );
};

const OrderCard: React.FC<{ 
    order: Order; 
    type: 'pending' | 'preparing' | 'completed';
    onAction: () => void; 
    actionLabel: string;
    actionIcon: React.ReactNode;
    colorClass: string;
    readonly?: boolean;
}> = ({ order, type, onAction, actionLabel, actionIcon, colorClass, readonly }) => {
    
    // Calcular tempo decorrido
    const timeString = order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`bg-stone-100 rounded-lg shadow-lg overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 ${colorClass}`}>
            {/* Header: Number & Time */}
            <div className="p-3 border-b border-stone-200 flex justify-between items-start bg-white/50">
                <div className="flex items-center gap-2">
                    {order.tableName && (
                        <div className="bg-wood-800 text-brand-yellow px-2 py-1 rounded font-bold text-sm shadow-sm border border-wood-600">
                            MESA {order.tableName}
                        </div>
                    )}
                    {!order.tableName && (
                         <span className="text-lg font-bold text-stone-800">#{order.id.slice(-4)}</span>
                    )}
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-xs font-mono text-stone-600 bg-stone-200 px-2 py-1 rounded">
                        <Clock size={12} />
                        {timeString}
                    </div>
                </div>
            </div>
            
            <div className="p-4 flex-1">
                 {/* Customer Name */}
                 {order.customerName && (
                    <div className="mb-2 text-xs font-bold text-stone-500 uppercase flex items-center gap-1">
                        <User size={12} /> {order.customerName}
                    </div>
                )}
                
                {/* Items List */}
                <ul className="space-y-2 mb-3">
                    {order.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-stone-800 leading-tight">
                             <span className="mt-1.5 w-1.5 h-1.5 bg-stone-400 rounded-full shrink-0" />
                             <span className="font-semibold">{item}</span>
                        </li>
                    ))}
                </ul>

                {/* Observation Box */}
                {order.observation && (
                    <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs text-stone-700 mt-2 flex gap-2 items-start">
                        <StickyNote size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                        <span className="font-medium italic">"{order.observation}"</span>
                    </div>
                )}
            </div>

            {!readonly ? (
                <button 
                    onClick={onAction}
                    className={`w-full py-3 font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors
                        ${type === 'pending' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                        ${type === 'preparing' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                    `}
                >
                    {actionLabel} {actionIcon}
                </button>
            ) : (
                <div className="bg-green-100 text-green-800 py-2 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Entregue
                </div>
            )}
        </div>
    );
}

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="h-32 flex flex-col items-center justify-center text-stone-500 border-2 border-dashed border-stone-700/30 rounded-lg">
        <p className="text-sm font-medium uppercase">{message}</p>
    </div>
);