import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

// Chave para armazenar a configuração no LocalStorage
const LOCAL_CONFIG_KEY = 'jtk_firebase_config';

// Configuração padrão (Placeholder)
const defaultFirebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Tenta carregar a configuração salva no dispositivo
const getStoredConfig = () => {
    try {
        const stored = localStorage.getItem(LOCAL_CONFIG_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error("Erro ao ler configuração local:", e);
    }
    return defaultFirebaseConfig;
};

const firebaseConfig = getStoredConfig();

let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let isFirebaseInitialized = false;

try {
  // Verifica se a configuração é válida (se a API Key foi alterada do padrão)
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY_AQUI") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    isFirebaseInitialized = true;
    console.log("🔥 Firebase conectado! Modo Online ativado.");
  } else {
    console.warn("⚠️ Firebase não configurado. O app rodará em Modo Local (Offline).");
    console.warn("Para conectar dispositivos, configure as chaves no painel de Configurações do App.");
  }
} catch (error) {
  console.error("Erro ao conectar no Firebase. Verifique sua configuração:", error);
  // Se a configuração for inválida, reseta para evitar crash eterno
  if (confirm("A configuração do Firebase parece inválida. Deseja resetar para o modo Local?")) {
      localStorage.removeItem(LOCAL_CONFIG_KEY);
      window.location.reload();
  }
}

/**
 * Salva a configuração do Firebase e recarrega a página para aplicar
 */
export const updateFirebaseConfig = (config: any) => {
    if (!config) {
        localStorage.removeItem(LOCAL_CONFIG_KEY);
    } else {
        localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config));
    }
    window.location.reload();
};

export { db, auth, googleProvider, isFirebaseInitialized };