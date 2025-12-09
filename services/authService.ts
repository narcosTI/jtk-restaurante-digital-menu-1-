import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { auth, googleProvider, isFirebaseInitialized } from "./firebase";
import { createUserProfile, getUserProfile } from "./userService";

export const loginWithGoogle = async () => {
  if (!isFirebaseInitialized || !auth || !googleProvider) {
    throw new Error("Firebase não está configurado.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Verificar se o perfil existe, se não, criar
    const existingProfile = await getUserProfile(result.user.uid);
    if (!existingProfile) {
        await createUserProfile(result.user.uid, {
            email: result.user.email || '',
            displayName: result.user.displayName || 'Google User',
            role: 'customer' // Padrão
        });
    }
    return result.user;
  } catch (error) {
    console.error("Erro ao logar com Google", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  if (!isFirebaseInitialized || !auth) {
    throw new Error("Firebase não está configurado.");
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error("Erro ao logar com Email", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  if (!isFirebaseInitialized || !auth) {
    throw new Error("Firebase não está configurado.");
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) {
      await updateProfile(result.user, { displayName: name });
    }
    
    // CRIAR PERFIL NO FIRESTORE (USER CONTROLLER)
    await createUserProfile(result.user.uid, {
        email: email,
        displayName: name,
        role: 'customer' // Padrão para novos registros
    });

    return result.user;
  } catch (error) {
    console.error("Erro ao registrar", error);
    throw error;
  }
};

export const logout = async () => {
  if (!isFirebaseInitialized || !auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao sair", error);
  }
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (!isFirebaseInitialized || !auth) {
    // Se Firebase não estiver configurado, não faz nada ou retorna null
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
