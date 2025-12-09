import { db, isFirebaseInitialized } from './firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { Order } from '../types';

// Store local para fallback quando o Firebase não estiver configurado
let localOrders: Order[] = [];
let listeners: ((orders: Order[]) => void)[] = [];

// Helper para notificar listeners locais
const notifyLocalListeners = () => {
  listeners.forEach(callback => callback([...localOrders]));
};

/**
 * Inscreve-se para receber atualizações de pedidos em tempo real.
 * Se o Firebase estiver ativo, usa Firestore. Senão, usa LocalStorage.
 */
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  if (isFirebaseInitialized && db) {
    // --- MODO ONLINE (FIREBASE) ---
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    
    // Retorna a função de unsubscribe do Firestore
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Converte Timestamp do Firestore de volta para Date do JS
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp)
        } as Order;
      });
      callback(orders);
    }, (error) => {
      console.error("Erro na sincronização do Firebase:", error);
      // Fallback silencioso ou tratamento de erro
    });

  } else {
    // --- MODO LOCAL (OFFLINE) ---
    listeners.push(callback);
    
    // Carrega dados salvos anteriormente no dispositivo
    try {
      const saved = localStorage.getItem('jtk_local_orders');
      if (saved) {
        localOrders = JSON.parse(saved, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
      }
    } catch (e) {
      console.error("Erro ao ler localStorage", e);
    }
    
    // Dispara callback inicial
    callback([...localOrders]);

    // Retorna função de limpeza
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  }
};

/**
 * Adiciona um novo pedido.
 */
export const addOrder = async (order: Omit<Order, 'id'>) => {
  if (isFirebaseInitialized && db) {
    // --- MODO ONLINE ---
    await addDoc(collection(db, "orders"), {
      ...order,
      timestamp: Timestamp.fromDate(order.timestamp)
    });
  } else {
    // --- MODO LOCAL ---
    const newOrder = {
      ...order,
      id: Date.now().toString()
    } as Order;
    
    localOrders = [newOrder, ...localOrders];
    localStorage.setItem('jtk_local_orders', JSON.stringify(localOrders));
    notifyLocalListeners();
  }
};

/**
 * Atualiza o status de um pedido (pendente -> preparing -> completed).
 */
export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  if (isFirebaseInitialized && db) {
    // --- MODO ONLINE ---
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status });
  } else {
    // --- MODO LOCAL ---
    localOrders = localOrders.map(o => o.id === orderId ? { ...o, status } : o);
    localStorage.setItem('jtk_local_orders', JSON.stringify(localOrders));
    notifyLocalListeners();
  }
};

/**
 * Remove um pedido (usado para arquivar pedidos concluídos)
 */
export const deleteOrder = async (orderId: string) => {
    // Opcional: Implementar se quisermos limpar o histórico visualmente
    // Por enquanto, vamos apenas filtrar visualmente na tela da cozinha
    // Mas se quiser apagar:
    /*
    if (isFirebaseInitialized && db) {
        await deleteDoc(doc(db, "orders", orderId));
    } else {
        localOrders = localOrders.filter(o => o.id !== orderId);
        localStorage.setItem('jtk_local_orders', JSON.stringify(localOrders));
        notifyLocalListeners();
    }
    */
};