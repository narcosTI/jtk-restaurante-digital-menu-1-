import React, { useState, useEffect } from 'react';
import { DessertCategory } from '../types';
import { Phone, Utensils, Edit3, Check, Circle, CheckCircle } from 'lucide-react';

interface DessertDisplayProps {
  categories: DessertCategory[];
  phone: string;
  onPlaceOrder: (items: string[], tableName?: string, observation?: string) => void;
}

export const DessertDisplay: React.FC<DessertDisplayProps> = ({ categories, phone, onPlaceOrder }) => {
  const [localCategories, setLocalCategories] = useState<DessertCategory[]>(categories);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLocalCategories(JSON.parse(JSON.stringify(categories)));
  }, [categories]);

  const handleItemEdit = (catIndex: number, itemIndex: number, newValue: string) => {
    const newCats = [...localCategories];
    newCats[catIndex].items[itemIndex] = newValue;
    setLocalCategories(newCats);
  };

  const toggleSelection = (catIndex: number, itemIndex: number) => {
    const key = `${catIndex}-${itemIndex}`;
    const newSet = new Set(selectedKeys);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedKeys(newSet);
  };

  const getSelectedItemsForOrder = () => {
    const items: string[] = [];
    localCategories.forEach((cat, catIndex) => {
      cat.items.forEach((item, itemIndex) => {
        if (selectedKeys.has(`${catIndex}-${itemIndex}`) && item.trim() !== "") {
          items.push(`${cat.title}: ${item}`);
        }
      });
    });
    return items;
  };

  const handleWhatsAppOrder = () => {
    const items = getSelectedItemsForOrder();
    if (items.length === 0) {
      alert("Selecione pelo menos um item para pedir.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `*PEDIDO DE SOBREMESA*\n\n` + items.map(i => `🍰 ${i}`).join('\n');
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleKitchenOrder = () => {
    const items = getSelectedItemsForOrder();
    if (items.length === 0) {
      alert("Selecione pelo menos um item para enviar para a cozinha.");
      return;
    }
    onPlaceOrder(items, undefined, "Sobremesa");
    setSelectedKeys(new Set()); // Reset selection
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  // Sample images for the right side column to match the design
  const sideImages = [
    "https://images.unsplash.com/photo-1576618148400-f54bed99fcf8?auto=format&fit=crop&w=300&q=80", // Geladinho/Popsicle
    "https://images.unsplash.com/photo-1563729768601-d6fa487550e3?auto=format&fit=crop&w=300&q=80", // Cake in jar
    "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=300&q=80", // Dessert cup
    "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=300&q=80"  // Chocolate/Brigadeiro
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-[#ffeef6] shadow-2xl overflow-hidden relative min-h-[800px] font-sans flex flex-col">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(#db2777 1px, transparent 1px), linear-gradient(90deg, #db2777 1px, transparent 1px)`, 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
            <div className="bg-white rounded-full p-4 mb-4 animate-bounce shadow-[0_0_30px_rgba(219,39,119,0.6)]">
                <CheckCircle size={64} className="text-[#db2777]" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-cursive font-bold text-white tracking-wider animate-pulse">Pedido Enviado!</h3>
            <p className="text-pink-100 mt-2 text-sm font-sans">Adoçando seu dia...</p>
        </div>
      )}

      {/* Top Brown Wave Header */}
      <div className="relative h-32 bg-[#4a0404] shrink-0">
        <div className="absolute -bottom-10 left-0 right-0 h-20 bg-[#4a0404]" style={{ borderRadius: '0 0 50% 50%' }}></div>
      </div>

      {/* Main Title Badge */}
      <div className="relative z-10 -mt-16 text-center mb-8 shrink-0">
        <div className="inline-block relative p-6">
          {/* Scalloped BG approximation using dashed border */}
          <div className="absolute inset-0 bg-[#ffcdd2] rounded-full border-2 border-[#4a0404] border-dashed shadow-md transform rotate-3"></div>
          <div className="relative z-10">
            <h1 className="font-cursive text-5xl text-[#4a0404] leading-tight">
              Menu de<br/>
              <span className="text-[#db2777]">Sobremesas</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 px-6 flex flex-grow">
        
        {/* Left Column: Menu Items */}
        <div className="w-2/3 pr-2">
            <div className="text-xs text-[#4a0404]/50 mb-4 flex items-center gap-1">
                <Edit3 size={12} /> Toque para editar ou selecionar
            </div>

            {localCategories.map((category, catIdx) => (
            <div key={catIdx} className="mb-6">
                <h3 className="font-cursive text-3xl text-[#4a0404] flex items-center gap-2 mb-1">
                <span className="text-[#db2777]">♥</span> {category.title}
                </h3>
                
                <ul className="pl-2 space-y-1">
                {category.items.map((item, itemIdx) => {
                    const isSelected = selectedKeys.has(`${catIdx}-${itemIdx}`);
                    return (
                        <li key={itemIdx} className="flex items-start gap-2 group">
                            {/* Bullet/Checkbox */}
                            <button 
                                onClick={() => toggleSelection(catIdx, itemIdx)}
                                className="mt-1.5 focus:outline-none"
                            >
                                {isSelected ? (
                                    <Check size={14} className="text-green-600 stroke-[4]" />
                                ) : (
                                    <Circle size={8} className="text-[#4a0404] fill-[#4a0404]" />
                                )}
                            </button>

                            {/* Editable Text */}
                            <input 
                                type="text"
                                value={item}
                                onChange={(e) => handleItemEdit(catIdx, itemIdx, e.target.value)}
                                className={`w-full bg-transparent text-[#4a0404] text-sm md:text-base border-none p-0 focus:ring-0 leading-tight ${isSelected ? 'font-bold' : ''}`}
                            />
                        </li>
                    );
                })}
                </ul>
            </div>
            ))}
        </div>

        {/* Right Column: Images Stack */}
        <div className="w-1/3 flex flex-col items-center gap-4 pt-10">
            {sideImages.map((img, idx) => (
                <div 
                    key={idx}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${img})` }}
                />
            ))}
        </div>

      </div>

      {/* Footer Info Badge - Now Relative (In Flow) */}
      <div className="relative z-20 w-full flex justify-center mt-8 mb-24 shrink-0">
        <div className="bg-[#4a0404] text-pink-100 rounded-full py-3 px-6 flex items-center justify-center gap-3 shadow-lg border-2 border-white transform hover:scale-105 transition-transform">
            <div className="bg-white/10 p-2 rounded-full">
                <Phone size={20} className="text-white" />
            </div>
            <div className="text-left leading-none">
                <p className="font-cursive text-xl">Faça sua encomenda!</p>
                <p className="font-sans font-bold text-sm">({phone.substring(0,2)}) {phone.substring(2)}</p>
            </div>
        </div>
      </div>

      {/* Action Buttons (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-pink-200 z-50 flex gap-3 max-w-md mx-auto">
        <button 
            onClick={handleWhatsAppOrder}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold uppercase text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
        >
            <Phone size={16} /> WhatsApp
        </button>
        <button 
            onClick={handleKitchenOrder}
            className="flex-1 bg-brand-orange text-wood-900 py-3 rounded-lg font-bold uppercase text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
        >
            <Utensils size={16} /> Cozinha
        </button>
      </div>

    </div>
  );
};