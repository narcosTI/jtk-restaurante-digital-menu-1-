
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

// Chaves de configuração do Projeto JTK Restaurante
const firebaseConfig = {
  apiKey: "AIzaSyCunzsjy4mJDLXweUBPlKlZabq6g_2N9DA",
  authDomain: "jtk-restaurante-digital-menu-1.firebaseapp.com",
  projectId: "jtk-restaurante-digital-menu-1",
  storageBucket: "jtk-restaurante-digital-menu-1.firebasestorage.app",
  messagingSenderId: "589206142134",
  appId: "1:589206142134:web:ada00eaa16f9dff1107a17",
  measurementId: "G-8VGTJLVN8E"
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
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Função para atualizar config (mantida para compatibilidade, mas sem uso prático no modo hardcoded)
export const updateFirebaseConfig = (config: any) => {
    console.warn("Configuração dinâmica desativada. Usando chaves fixas.");
};

export { db, auth, googleProvider, isFirebaseInitialized };
