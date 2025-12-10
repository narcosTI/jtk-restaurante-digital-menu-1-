
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

// --- CONFIGURAÇÃO FORÇADA (PRODUÇÃO) ---
// Removemos a leitura de localStorage para evitar que dispositivos fiquem "presos" em configurações antigas ou locais.
const firebaseConfig = {
  apiKey: "AIzaSyCunzsjy4mJDLXweUBPlKlZabq6g_2N9DA",
  authDomain: "jtk-restaurante-digital-menu-1.firebaseapp.com",
  projectId: "jtk-restaurante-digital-menu-1",
  storageBucket: "jtk-restaurante-digital-menu-1.firebasestorage.app",
  messagingSenderId: "589206142134",
  appId: "1:589206142134:web:87af7e2ef447f34b107a17",
  measurementId: "G-CH4D8C9NRG"
};

let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let isFirebaseInitialized = false;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  isFirebaseInitialized = true;
  console.log("🔥 Firebase conectado! Sincronização Ativa.");
} catch (error) {
  console.error("Erro CRÍTICO ao conectar no Firebase:", error);
}

// Função placeholder para manter compatibilidade, mas agora ela apenas recarrega a página
// pois não permitimos mais sobrescrever a config via UI para evitar erros de sync.
export const updateFirebaseConfig = (config: any) => {
    localStorage.removeItem('jtk_firebase_config'); // Limpa qualquer lixo antigo
    window.location.reload();
};

export { db, auth, googleProvider, isFirebaseInitialized };
