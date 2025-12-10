import React, { useState, useEffect } from 'react';
import { MenuDisplay } from './components/MenuDisplay';
import { EditPanel } from './components/EditPanel';
import { KitchenDisplay } from './components/KitchenDisplay';
import { DessertDisplay } from './components/DessertDisplay';
import { UserManagement } from './components/UserManagement';
import { AdminDisplay } from './components/AdminDisplay';
import { MenuData, Order, DessertCategory } from './types';
import { Settings, ChefHat, ArrowLeft, Utensils, IceCream, LogOut, Users, Link2, Monitor, Smartphone, ClipboardCheck } from 'lucide-react';
import { subscribeToOrders, addOrder, updateOrderStatus } from './services/orderService';
import { isFirebaseInitialized } from './services/firebase';
import { subscribeToAuth, logout } from './services/authService';
import { User } from 'firebase/auth';

// Initial state derived from the provided image
const INITIAL_DATA: MenuData = {
  restaurantName: "JTK Restaurante",
  title: "Almoço de Hoje",
  items: [
    "Arroz",
    "Feijão",
    "Macarrão",
    "Bife ao Molho Madeira",
    "Filé de Frango",
    "Batata Palha",
    "Purê de Batata",
    "Cenoura Cozida",
    "Salada de Repolho, Tomate e Couve"
  ],
  price: 20.00,
  phone: "62981025023"
};

const DESSERT_DATA: DessertCategory[] = [
  {
    title: "Geladinhos gourmet",
    items: [
      "Prestígio",
      "Ninho c/ morango",
      "Ninho c/ abacaxi",
      "Ninho c/ nutella",
      "Maracuja trufado",
      "Ovomaltine"
    ]
  },
  {
    title: "Bolos",
    items: [
      "Ninho c/ brigadeiro",
      "Brigadeiro",
      "Maracujá"
    ]
  },
  {
    title: "Marido gelado",
    items: []
  },
  {
    title: "Pudim",
    items: []
  },
  {
    title: "Doce de festa",
    items: [
      "Brigadeiro",
      "Leite ninho"
    ]
  }
];

function App() {
  // Initialize state from localStorage if available, otherwise use INITIAL_DATA
  const [menuData, setMenuData] = useState<MenuData>(() => {
    try {
      const saved = localStorage.getItem('jtk_menu_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load menu data from local storage", e);
    }
    return INITIAL_DATA;
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  
  // VIEW MODE STATE (Routing)
  const [viewMode, setViewMode] = useState<'menu' | 'dessert' | 'kitchen' | 'users' | 'admin'>('menu');
  const [isWaiterMode, setIsWaiterMode] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  // Default isLocalAuth to TRUE to bypass login screen initially
  const [isLocalAuth, setIsLocalAuth] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // ROUTING: Listen to URL Hash changes to switch views automatically (e.g., #kitchen, #waiter)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#kitchen') {
        setViewMode('kitchen');
        setIsWaiterMode(false);
      } else if (hash === '#admin') {
        setViewMode('admin');
        setIsWaiterMode(false);
      } else if (hash === '#waiter') {
        setViewMode('menu');
        setIsWaiterMode(true);
      } else if (hash === '#dessert') {
        setViewMode('dessert');
        setIsWaiterMode(false);
      } else {
        setViewMode('menu');
        setIsWaiterMode(false);
      }
    };

    // Run on mount
    handleHashChange();

    // Listen for changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Persist menuData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('jtk_menu_data', JSON.stringify(menuData));
  }, [menuData]);

  // Subscribe to Auth
  useEffect(() => {
    if (isFirebaseInitialized) {
        const unsubscribe = subscribeToAuth((currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    } else {
        setAuthLoading(false);
    }
  }, []);

  // Subscribe to real-time orders
  useEffect(() => {
    // Allows subscription if user is logged in OR if in local/bypass mode
    if (!user && !isLocalAuth) return;

    const unsubscribe = subscribeToOrders((updatedOrders) => {
        setOrders(updatedOrders);
    });
    return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user, isLocalAuth]);

  const handlePlaceOrder = (items: string[], tableName?: string, observation?: string) => {
    const newOrder = {
      customerName: user?.displayName || (isWaiterMode ? "Garçom" : "Cliente"), 
      tableName: tableName || '',
      observation: observation || '',
      items: items,
      timestamp: new Date(),
      status: 'pending' as const
    };
    
    addOrder(newOrder).catch(err => console.error("Error adding order", err));
  };

  const handleUpdateStatus = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status).catch(err => console.error("Error updating order", err));
  };

  const handleLogout = () => {
    if (isFirebaseInitialized && user) {
        logout();
    } else {
        // In "No Login Screen" mode, logging out just refreshes or stays in guest mode
        setIsLocalAuth(true); 
        alert("Modo Local reiniciado.");
    }
  };

  const copyLink = (hash: string) => {
    const url = `${window.location.origin}/${hash}`;
    navigator.clipboard.writeText(url);
    alert(`Link copiado: ${url}`);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-wood-900 flex items-center justify-center text-white">Carregando...</div>;
  }

  // Calculate active orders
  const activeOrderCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

  return (
    <div className="min-h-screen bg-wood-900 pb-20 relative">
      {/* Background Texture */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none z-0" 
        style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} 
      />

      <nav className="p-4 flex justify-between items-center relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
            {(viewMode === 'kitchen' || viewMode === 'users' || viewMode === 'admin') && (
                <button 
                    onClick={() => { window.location.hash = ''; }}
                    className="text-stone-400 hover:text-white flex items-center gap-1 bg-stone-800 px-3 py-1 rounded-full text-sm"
                >
                    <ArrowLeft size={16} /> Voltar
                </button>
            )}
            
            {/* Menu Type Switcher */}
            {(viewMode === 'menu' || viewMode === 'dessert') && !isWaiterMode && (
              <div className="flex bg-wood-800 rounded-full p-1 border border-wood-700">
                <button
                  onClick={() => setViewMode('menu')}
                  className={`px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'menu' ? 'bg-brand-yellow text-wood-900 shadow-md' : 'text-stone-400 hover:text-stone-200'}`}
                >
                  <Utensils size={14} /> Almoço
                </button>
                <button
                  onClick={() => setViewMode('dessert')}
                  className={`px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'dessert' ? 'bg-pink-500 text-white shadow-md' : 'text-stone-400 hover:text-stone-200'}`}
                >
                  <IceCream size={14} /> Sobremesa
                </button>
              </div>
            )}
        </div>

        <div className="flex gap-2">
            {/* Links / Connection Button */}
            <button 
                onClick={() => setShowLinksModal(true)}
                className="text-stone-400 hover:text-green-400 transition-colors p-2 rounded-full hover:bg-stone-800"
                title="Conectar Dispositivos"
            >
                <Link2 size={20} />
            </button>

            {/* Admin/Restaurant Button */}
            <button 
                onClick={() => { window.location.hash = '#admin'; }}
                className={`transition-colors p-2 rounded-full ${viewMode === 'admin' ? 'bg-stone-200 text-wood-900' : 'text-stone-400 hover:text-brand-yellow hover:bg-stone-800'}`}
                title="Gestão do Restaurante (Caixa)"
            >
                <ClipboardCheck size={20} />
            </button>

            {/* Kitchen Button */}
            <button 
                onClick={() => { window.location.hash = viewMode === 'kitchen' ? '' : '#kitchen'; }}
                className={`transition-colors p-2 rounded-full relative ${viewMode === 'kitchen' ? 'bg-brand-orange text-wood-900' : 'text-stone-400 hover:text-brand-yellow hover:bg-stone-800'}`}
                title="Tela da Cozinha"
            >
                <ChefHat size={20} />
                {activeOrderCount > 0 && viewMode !== 'kitchen' && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                        {activeOrderCount}
                    </span>
                )}
            </button>
            
            {/* Users Button (Admin) */}
            <button 
                onClick={() => setViewMode('users')}
                className={`transition-colors p-2 rounded-full ${viewMode === 'users' ? 'bg-stone-200 text-wood-900' : 'text-stone-400 hover:text-brand-yellow hover:bg-stone-800'}`}
                title="Gerenciar Usuários"
            >
                <Users size={20} />
            </button>

            {/* Config Button */}
            {viewMode === 'menu' && !isWaiterMode && (
              <button 
                  onClick={() => setIsEditOpen(true)}
                  className="text-stone-400 hover:text-brand-yellow transition-colors p-2 rounded-full hover:bg-stone-800"
                  title="Editar Cardápio"
              >
                  <Settings size={20} />
              </button>
            )}

            <button 
                onClick={handleLogout}
                className="text-stone-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-stone-800"
                title={user ? "Sair (Logout)" : "Modo Local"}
            >
                <LogOut size={20} />
            </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-4 relative z-10">
        {!isFirebaseInitialized && (
            <div className="bg-red-900/80 border border-red-500 text-white text-center p-2 mb-4 rounded mx-auto max-w-md text-xs">
                ⚠️ <b>Modo Offline.</b> Dispositivos não sincronizarão.
                <br/>Configure o Firebase no ícone de Engrenagem {'>'} Nuvem.
            </div>
        )}

        {viewMode === 'menu' && (
            <MenuDisplay data={menuData} onPlaceOrder={handlePlaceOrder} isWaiterMode={isWaiterMode} />
        )}
        {viewMode === 'dessert' && (
            <DessertDisplay 
                categories={DESSERT_DATA} 
                phone={menuData.phone} 
                onPlaceOrder={handlePlaceOrder}
            />
        )}
        {viewMode === 'kitchen' && (
            <KitchenDisplay 
                orders={orders} 
                onUpdateStatus={handleUpdateStatus} 
                isOnline={isFirebaseInitialized} 
            />
        )}
        {viewMode === 'admin' && (
            <AdminDisplay 
                orders={orders} 
                onUpdateStatus={handleUpdateStatus} 
            />
        )}
        {viewMode === 'users' && (
            <UserManagement />
        )}
      </main>

      <EditPanel 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        currentData={menuData} 
        onUpdate={setMenuData} 
      />

      {/* LINKS MODAL */}
      {showLinksModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-wood-900 mb-2">Conectar Dispositivos</h3>
                <p className="text-stone-500 text-sm mb-6">Envie estes links para outros dispositivos para acessar as funções específicas.</p>
                
                <div className="space-y-4">
                    <button onClick={() => copyLink('#waiter')} className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500 text-white p-2 rounded-full"><Smartphone size={20} /></div>
                            <div className="text-left">
                                <p className="font-bold text-blue-900">Modo Garçom</p>
                                <p className="text-xs text-blue-700">Tela rápida p/ pedidos</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold uppercase text-blue-500">Copiar Link</span>
                    </button>

                    <button onClick={() => copyLink('#kitchen')} className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500 text-white p-2 rounded-full"><ChefHat size={20} /></div>
                            <div className="text-left">
                                <p className="font-bold text-orange-900">Tela da Cozinha</p>
                                <p className="text-xs text-orange-700">Monitor de preparo</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold uppercase text-orange-500">Copiar Link</span>
                    </button>

                    <button onClick={() => copyLink('#admin')} className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-stone-700 text-white p-2 rounded-full"><Monitor size={20} /></div>
                            <div className="text-left">
                                <p className="font-bold text-stone-900">Gestão / Caixa</p>
                                <p className="text-xs text-stone-600">Admin Geral</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold uppercase text-stone-500">Copiar Link</span>
                    </button>
                </div>

                <button 
                    onClick={() => setShowLinksModal(false)}
                    className="w-full mt-6 bg-wood-900 text-white py-3 rounded-lg font-bold"
                >
                    Fechar
                </button>
            </div>
        </div>
      )}

      {viewMode === 'menu' && !isWaiterMode && (
        <footer className="text-center py-8 text-stone-600 text-sm relative z-10">
            <p>© {new Date().getFullYear()} JTK Restaurante</p>
            <p className="text-xs mt-1">
                {user ? `Logado como: ${user.email || user.displayName}` : 'Modo Público/Local'}
            </p>
        </footer>
      )}
    </div>
  );
}

export default App;