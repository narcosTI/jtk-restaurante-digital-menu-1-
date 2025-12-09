import React, { useState, useEffect } from 'react';
import { MenuData } from '../types';
import { Phone, Share2, Utensils, CheckCircle, CheckSquare, Square, ChefHat, ClipboardList, User } from 'lucide-react';

interface MenuDisplayProps {
  data: MenuData;
  onPlaceOrder: (items: string[], tableName?: string, observation?: string) => void;
  isWaiterMode?: boolean; // Prop para ativar modo garçom
}

export const MenuDisplay: React.FC<MenuDisplayProps> = ({ data, onPlaceOrder, isWaiterMode = false }) => {
  // Local state for the customer's customized order
  const [orderItems, setOrderItems] = useState<string[]>(data.items);
  const [selectedItems, setSelectedItems] = useState<boolean[]>(
    new Array(data.items.length).fill(true)
  );
  
  // New States for Kitchen Details
  const [tableNumber, setTableNumber] = useState('');
  const [observation, setObservation] = useState('');

  // Status animation state: 'idle' -> 'sending' (animation) -> 'success' (feedback) -> 'idle'
  const [orderStatus, setOrderStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // Sync state if the actual menu data changes (from AI or Owner edit)
  useEffect(() => {
    setOrderItems(data.items);
    setSelectedItems(new Array(data.items.length).fill(true));
  }, [data.items]);

  const handleItemChange = (index: number, newValue: string) => {
    const newItems = [...orderItems];
    newItems[index] = newValue;
    setOrderItems(newItems);
  };

  const toggleSelection = (index: number) => {
    const newSelected = [...selectedItems];
    newSelected[index] = !newSelected[index];
    setSelectedItems(newSelected);
  };

  // Format price to BRL
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(data.price);

  const getValidItems = () => {
    return orderItems.filter((item, index) => selectedItems[index] && item.trim().length > 0);
  };

  const handleWhatsAppOrder = () => {
    const cleanPhone = data.phone.replace(/\D/g, '');
    const validItems = getValidItems();

    if (validItems.length === 0) {
        alert("O pedido está vazio! Selecione pelo menos um item.");
        return;
    }

    // Notify the app (kitchen system) as well
    onPlaceOrder(validItems, tableNumber, observation);

    // WhatsApp logic
    let message = `*PEDIDO - ${data.restaurantName}*\n` +
      `*${data.title}*\n\n` +
      (tableNumber ? `*Mesa: ${tableNumber}*\n` : '') +
      `*Itens do Pedido:*\n` +
      validItems.map(item => `✅ ${item}`).join('\n') +
      `\n\n`;

    if (observation) {
        message += `*Obs:* ${observation}\n`;
    }
    
    message += `*Total: ${formattedPrice}*`;
      
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const handleKitchenOrder = () => {
    const validItems = getValidItems();

    if (validItems.length === 0) {
        alert("O pedido está vazio! Selecione pelo menos um item.");
        return;
    }

    if (!tableNumber) {
        if (!confirm("Enviar para a cozinha sem número de mesa?")) return;
    }

    // 1. Start Animation Phase
    setOrderStatus('sending');
    
    // 2. Wait for animation to complete (1.5s), then place order and show success
    setTimeout(() => {
        onPlaceOrder(validItems, tableNumber, observation);
        setOrderStatus('success');
        
        // Reset fields for next order if waiter mode
        if (isWaiterMode) {
            // Keep selected items, just clear table/obs
             setTableNumber('');
             setObservation('');
        } else {
             setTableNumber('');
             setObservation('');
        }
        
        // 3. Reset after success message (2.5s)
        setTimeout(() => setOrderStatus('idle'), 1500); // Faster reset in waiter mode
    }, 1000);
  };

  const handleShareClick = async () => {
    // Share the original menu, not the customized one
    const text = `*${data.restaurantName} - ${data.title}*\n\n` +
      data.items.map(item => `• ${item}`).join('\n') +
      `\n\nValor: ${formattedPrice}\nPeça agora: 62 ${data.phone.slice(2)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cardápio de Hoje',
          text: text,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Cardápio copiado para a área de transferência!');
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto bg-wood-800 rounded-xl overflow-hidden shadow-2xl border-4 border-wood-700 relative mb-6 ${isWaiterMode ? 'ring-4 ring-blue-500/50' : ''}`}>
      <style>{`
        @keyframes fly-to-kitchen {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          20% { transform: translate(-20px, 10px) scale(1.1); }
          100% { transform: translate(200px, -200px) scale(0.5); opacity: 0; }
        }
        .animate-delivery {
          animation: fly-to-kitchen 1.2s ease-in-out forwards;
        }
      `}</style>

      {/* Texture Overlay Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')` }}>
      </div>

      {/* SENDING ANIMATION OVERLAY */}
      {orderStatus === 'sending' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            {/* Target (Kitchen) */}
            <div className="absolute top-10 right-10 text-stone-500 animate-pulse">
                <ChefHat size={48} />
            </div>

            {/* Moving Object (Plate) */}
            <div className="bg-white p-4 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-delivery z-10">
                <Utensils size={40} className="text-wood-900" />
            </div>
            
            <p className="absolute bottom-20 text-white font-bold uppercase tracking-widest animate-pulse">
                Levando para cozinha...
            </p>
        </div>
      )}

      {/* SUCCESS OVERLAY */}
      {orderStatus === 'success' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
            <div className="bg-white rounded-full p-4 mb-4 animate-bounce shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                <CheckCircle size={64} className="text-green-600" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-widest font-display animate-pulse">
                {isWaiterMode ? 'Enviado!' : 'Recebido!'}
            </h3>
            <p className="text-stone-300 mt-2 text-sm">
                 {isWaiterMode ? 'Pronto para o próximo.' : 'O Chef já está preparando.'}
            </p>
        </div>
      )}

      {/* Header */}
      {!isWaiterMode ? (
          <div className="bg-wood-900 p-6 text-center border-b-2 border-wood-700 relative z-10">
            <div className="inline-block border-2 border-brand-yellow rounded-lg px-2 py-1 mb-2 transform -rotate-2">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-brand-yellow to-brand-orange uppercase tracking-wider drop-shadow-sm">
                {data.restaurantName || "JTK Restaurante"}
                </h1>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest mt-2 font-display text-shadow">
              {data.title || "Almoço de Hoje"}
            </h2>
          </div>
      ) : (
          <div className="bg-blue-900 p-3 text-center border-b border-blue-700 relative z-10 flex items-center justify-center gap-2">
             <User size={20} className="text-white" />
             <h2 className="text-xl font-bold text-white uppercase tracking-widest font-display">
                Modo Garçom
             </h2>
          </div>
      )}

      {/* Items List - Now Selectable and Editable */}
      <div className={`relative z-10 ${isWaiterMode ? 'p-4' : 'p-8 pb-4'}`}>
        {!isWaiterMode && (
            <div className="text-center mb-4">
                <span className="text-stone-400 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <CheckSquare size={12} /> Marque os itens desejados
                </span>
            </div>
        )}
        <div className="space-y-3">
          {orderItems.map((item, index) => (
            <div 
                key={index} 
                className={`flex items-center gap-3 group transition-all duration-300 ease-in-out ${
                    selectedItems[index] ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-2'
                }`}
            >
                <button
                    onClick={() => toggleSelection(index)}
                    className={`transition-all duration-300 flex-shrink-0 active:scale-90 ${
                        selectedItems[index] ? 'text-brand-yellow scale-100' : 'text-stone-600 hover:text-stone-500 scale-90'
                    }`}
                >
                    {selectedItems[index] ? <CheckSquare size={24} /> : <Square size={24} />}
                </button>
                <div 
                    onClick={() => toggleSelection(index)}
                    className={`cursor-pointer flex-1 text-lg font-medium uppercase tracking-wide transition-all duration-300 ease-in-out
                        ${selectedItems[index]
                            ? 'text-stone-200'
                            : 'text-stone-600 line-through decoration-stone-600 decoration-2 italic'
                        }
                    `}
                >
                    {item}
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Badge (Hidden in Waiter Mode to save space) */}
      {!isWaiterMode && (
          <div className="relative z-10 flex justify-center -mt-2 mb-6">
            <div className="bg-brand-yellow text-wood-900 px-8 py-4 rounded-full transform rotate-2 shadow-lg border-4 border-white/20">
              <p className="text-sm font-bold uppercase text-center mb-1">Por Apenas</p>
              <p className="text-4xl font-display font-black">{formattedPrice}</p>
            </div>
          </div>
      )}

      {/* Footer Actions */}
      <div className="bg-wood-900 p-4 relative z-10">
        {/* Order Details: Table & Observations */}
        <div className="bg-wood-800 rounded-lg p-3 mb-4 border border-wood-700">
            <div className="flex gap-3 mb-2">
                <div className="w-1/3">
                    <label className="block text-stone-500 text-[10px] uppercase font-bold mb-1 ml-1">Mesa</label>
                    <div className="relative">
                        <select 
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            className="w-full bg-wood-900 text-brand-yellow font-bold text-center border border-wood-600 rounded p-2 focus:border-brand-yellow focus:outline-none appearance-none"
                        >
                            <option value="">--</option>
                            {[...Array(30)].map((_, i) => (
                                <option key={i} value={i+1}>{i+1}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-stone-500 text-xs">▼</div>
                    </div>
                </div>
                <div className="w-2/3">
                    <label className="block text-stone-500 text-[10px] uppercase font-bold mb-1 ml-1">Observações</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            placeholder="Ex: Sem cebola..."
                            className="w-full bg-wood-900 text-white border border-wood-600 rounded p-2 focus:border-brand-yellow focus:outline-none placeholder-stone-600"
                        />
                         <ClipboardList size={14} className="absolute right-2 top-3 text-stone-600 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-3">
            {/* Primary Action: Kitchen (Priority for Waiter) */}
            <button 
                onClick={handleKitchenOrder}
                disabled={orderStatus !== 'idle'}
                className={`w-full py-4 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    ${isWaiterMode ? 'bg-blue-600 hover:bg-blue-500 text-white order-first' : 'bg-brand-orange hover:bg-orange-500 text-wood-900'}
                `}
            >
                <Utensils size={24} />
                {isWaiterMode ? 'Lançar Pedido' : 'Enviar p/ Cozinha'}
            </button>

            {/* Secondary Actions */}
            <div className="flex gap-3">
                <button 
                    onClick={handleWhatsAppOrder}
                    disabled={orderStatus !== 'idle'}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                    <Phone size={18} />
                    WhatsApp
                </button>
                
                {!isWaiterMode && (
                    <button 
                        onClick={handleShareClick}
                        disabled={orderStatus !== 'idle'}
                        className="bg-wood-700 hover:bg-wood-600 text-brand-yellow px-4 rounded-lg font-bold transition-colors shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Compartilhar"
                    >
                        <Share2 size={20} />
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};