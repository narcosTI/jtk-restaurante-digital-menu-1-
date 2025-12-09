import { db, isFirebaseInitialized } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';

const USERS_COLLECTION = 'users';
const LOCAL_USERS_KEY = 'jtk_local_users';

/**
 * Cria ou atualiza o perfil de um usuário no banco de dados.
 */
export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const profileData: UserProfile = {
    uid,
    email: data.email || '',
    displayName: data.displayName || 'Usuário',
    role: data.role || 'customer',
    createdAt: data.createdAt || new Date()
  };

  if (isFirebaseInitialized && db) {
    // --- MODO ONLINE ---
    await setDoc(doc(db, USERS_COLLECTION, uid), {
      ...profileData,
      createdAt: Timestamp.fromDate(profileData.createdAt)
    }, { merge: true });
  } else {
    // --- MODO LOCAL ---
    const users = getLocalUsers();
    // Verifica se já existe, se não, adiciona
    const index = users.findIndex(u => u.uid === uid);
    if (index >= 0) {
      users[index] = { ...users[index], ...profileData };
    } else {
      users.push(profileData);
    }
    saveLocalUsers(users);
  }
  return profileData;
};

/**
 * Busca o perfil de um usuário específico.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (isFirebaseInitialized && db) {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        uid: docSnap.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
      } as UserProfile;
    }
    return null;
  } else {
    const users = getLocalUsers();
    return users.find(u => u.uid === uid) || null;
  }
};

/**
 * Retorna todos os usuários cadastrados (para painel admin).
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (isFirebaseInitialized && db) {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
      } as UserProfile;
    });
  } else {
    return getLocalUsers();
  }
};

/**
 * Atualiza o cargo de um usuário.
 */
export const updateUserRole = async (uid: string, newRole: UserRole) => {
  if (isFirebaseInitialized && db) {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, { role: newRole });
  } else {
    const users = getLocalUsers();
    const updatedUsers = users.map(u => u.uid === uid ? { ...u, role: newRole } : u);
    saveLocalUsers(updatedUsers);
  }
};

// --- Helpers para Modo Local ---

const getLocalUsers = (): UserProfile[] => {
  try {
    const saved = localStorage.getItem(LOCAL_USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalUsers = (users: UserProfile[]) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};
