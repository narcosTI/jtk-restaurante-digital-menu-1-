import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

// Chave para armazenar a configuração no LocalStorage (caso o usuário queira sobrescrever)
const LOCAL_CONFIG_KEY = 'jtk_firebase_config';

// Configuração padrão com as chaves do projeto JTK Restaurante
const defaultFirebaseConfig = {
  apiKey: "AIzaSyCunzsjy4mJDLXweUBPlKlZabq6g_2N9DA",
  authDomain: "jtk-restaurante-digital-menu-1.firebaseapp.com",
  projectId: "jtk-restaurante-digital-menu-1",
  storageBucket: "jtk-restaurante-digital-menu-1.firebasestorage.app",
  messagingSenderId: "589206142134",
  appId: "1:589206142134:web:87af7e2ef447f34b107a17",
  measurementId: "G-CH4D8C9NRG"
};

// Tenta carregar a configuração salva no dispositivo, senão usa a padrão
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
  // Inicializa o Firebase se a configuração existir
  if (firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    isFirebaseInitialized = true;
    console.log("🔥 Firebase conectado! Modo Online ativado.");
  } else {
    console.warn("⚠️ Firebase não configurado corretamente.");
  }
} catch (error) {
  console.error("Erro ao conectar no Firebase. Verifique sua configuração:", error);
  // Se a configuração carregada do localStorage estiver corrompida, oferece reset
  const hasLocalConfig = localStorage.getItem(LOCAL_CONFIG_KEY);
  if (hasLocalConfig) {
      if (confirm("A configuração salva do Firebase parece inválida. Deseja resetar para a configuração padrão?")) {
          localStorage.removeItem(LOCAL_CONFIG_KEY);
          window.location.reload();
      }
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