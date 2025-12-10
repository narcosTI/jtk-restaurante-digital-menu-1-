
import React, { useState } from 'react';
import { MenuData, LoadingState } from '../types';
import { Camera, Edit3, X, Save, Trash2, Cloud, AlertTriangle, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { extractMenuFromImage } from '../services/geminiService';
import { updateFirebaseConfig, isFirebaseInitialized } from '../services/firebase';

interface EditPanelProps {
  currentData: MenuData;
  onUpdate: (newData: MenuData) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const EditPanel: React.FC<EditPanelProps> = ({ currentData, onUpdate, isOpen, setIsOpen }) => {
  const [formData, setFormData] = useState<MenuData>(currentData);
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle', message: '' });
  
  // Cloud Config State (Simplified)
  const [showCloudConfig, setShowCloudConfig] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, 'Novo Item'] }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const clearItems = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os itens do menu?')) {
      setFormData(prev => ({ ...prev, items: [] }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!process.env.API_KEY) {
        alert("API Key is missing. Cannot use AI features.");
        return;
    }

    setLoading({ status: 'uploading', message: 'Lendo imagem...' });

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        setLoading({ status: 'processing', message: 'Gemini AI analisando cardápio...' });
        
        const extractedData = await extractMenuFromImage(base64String);
        
        setFormData(prev => ({
            ...prev,
            ...extractedData,
            // Keep existing phone/name if AI misses them, or prefer AI if present
            restaurantName: extractedData.restaurantName || prev.restaurantName,
            phone: extractedData.phone || prev.phone
        }));
        
        setLoading({ status: 'success', message: 'Cardápio atualizado!' });
        setTimeout(() => setLoading({ status: 'idle', message: '' }), 2000);
      } catch (error) {
        console.error(error);
        setLoading({ status: 'error', message: 'Falha ao processar imagem.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const saveChanges = () => {
    onUpdate(formData);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end transition-opacity">
      <div className="bg-stone-900 w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl border-l border-stone-700 custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit3 className="text-brand-yellow" /> Editor
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* AI Upload Section */}
        <div className="mb-8 bg-wood-800 p-4 rounded-lg border border-dashed border-stone-500">
            <h4 className="text-stone-300 font-semibold mb-2 text-sm uppercase tracking-wide">Atualizar via IA</h4>
            <p className="text-xs text-stone-400 mb-3">Tire uma foto do menu impresso e deixe o Gemini atualizar os itens.</p>
            <label className="flex items-center justify-center w-full py-3 bg-stone-700 hover:bg-stone-600 rounded cursor-pointer transition-colors group">
                {loading.status !== 'idle' ? (
                    <span className={`text-sm font-medium ${loading.status === 'error' ? 'text-red-400' : 'text-brand-yellow'} animate-pulse`}>
                        {loading.message}
                    </span>
                ) : (
                    <>
                        <Camera className="mr-2 text-stone-300 group-hover:text-white" size={20} />
                        <span className="text-stone-300 group-hover:text-white font-medium">Tirar Foto / Upload</span>
                    </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={loading.status !== 'idle'} />
            </label>
        </div>

        <div className="space-y-4 mb-8">
            <div>
                <label className="block text-stone-400 text-xs uppercase mb-1">Nome do Restaurante</label>
                <input 
                    type="text" 
                    name="restaurantName" 
                    value={formData.restaurantName} 
                    onChange={handleInputChange} 
                    className="w-full bg-stone-800 border border-stone-700 rounded p-2 text-white focus:border-brand-yellow outline-none"
                />
            </div>
            <div>
                <label className="block text-stone-400 text-xs uppercase mb-1">Título</label>
                <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    className="w-full bg-stone-800 border border-stone-700 rounded p-2 text-white focus:border-brand-yellow outline-none"
                />
            </div>
            <div>
                <label className="block text-stone-400 text-xs uppercase mb-1">Preço (R$)</label>
                <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handlePriceChange} 
                    className="w-full bg-stone-800 border border-stone-700 rounded p-2 text-white focus:border-brand-yellow outline-none"
                />
            </div>

            <div>
                <label className="block text-stone-400 text-xs uppercase mb-1">Itens do Menu</label>
                <div className="space-y-2">
                    {formData.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input 
                                type="text" 
                                value={item} 
                                onChange={(e) => handleItemChange(idx, e.target.value)} 
                                className="flex-1 bg-stone-800 border border-stone-700 rounded p-2 text-white text-sm focus:border-brand-yellow outline-none"
                            />
                            <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 px-1">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-stone-700">
                        <button onClick={addItem} className="text-xs text-brand-yellow hover:underline flex items-center gap-1 font-medium">
                            + Adicionar Item
                        </button>
                        
                        {formData.items.length > 0 && (
                            <button onClick={clearItems} className="text-xs text-red-500 hover:text-red-400 hover:underline