import React, { useState } from 'react';
import { LogIn, User, Lock, AlertCircle, ChefHat, Mail, UserPlus, ArrowRight } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, registerWithEmail } from '../services/authService';
import { isFirebaseInitialized } from '../services/firebase';

interface LoginProps {
  onLoginSuccess?: () => void;
  onBypass?: () => void; // For local mode
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBypass }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // PRE-FILLED CREDENTIALS AS REQUESTED
  const [email, setEmail] = useState('marc536322@gmail.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('Admin JTK');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      if (!isFirebaseInitialized) {
        // Se realmente não tiver chaves do Firebase configuradas, usa o modo local
        await new Promise(resolve => setTimeout(resolve, 800));
        if (onBypass) onBypass();
      } else {
        // --- FLUXO REAL DE SINCRONIZAÇÃO (FIREBASE) ---
        // Removemos o bypass manual. Agora tentamos autenticar de verdade.
        
        if (isRegistering) {
            await registerWithEmail(email, password, name);
        } else {
            try {
                // 1. Tenta fazer Login
                await loginWithEmail(email, password);
            } catch (loginError: any) {
                // 2. Lógica de Auto-Correção para conta nova
                console.log("Login falhou, analisando motivo...", loginError.code);
                
                // Se o usuário não existe, CRIAMOS ele automaticamente para que a sincronização funcione
                if (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/invalid-credential') {
                     try {
                        console.log("Tentando auto-cadastro para habilitar sincronização...");
                        await registerWithEmail(email, password, "Admin JTK");
                     } catch (regError: any) {
                        // Se der erro no cadastro também, relançamos o erro original
                        throw regError;
                     }
                } else {
                    throw loginError;
                }
            }
        }
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "Senha incorreta.") {
         setError('A senha está incorreta para este e-mail.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
         setError('Email ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
         setError('Este email já existe. Tente logar ou use outra senha.');
      } else if (err.code === 'auth/weak-password') {
         setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
         setError('⚠️ AÇÃO NECESSÁRIA: Ative "Email/Senha" no Firebase Console > Authentication.');
      } else {
         setError('Erro ao conectar: ' + (err.message || 'Verifique sua conexão.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isFirebaseInitialized) {
        setError('Login com Google indisponível no Modo Local.');
        return;
    }
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError('Erro ao conectar com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wood-900 relative overflow-hidden px-4">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')` }}>
      </div>

      <div className="w-full max-w-md bg-wood-800 rounded-2xl shadow-2xl border-4 border-wood-700 relative z-10 overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="bg-wood-900 p-8 text-center border-b border-wood-700 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-yellow to-brand-orange"></div>
            <div className="inline-block p-3 rounded-full bg-wood-800 border-2 border-brand-yellow shadow-lg mb-3">
                <ChefHat size={32} className="text-brand-orange" />
            </div>
            <h1 className="text-3xl font-display text-white tracking-wider uppercase mb-1">
                JTK Restaurante
            </h1>
            <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">
                {!isFirebaseInitialized ? 'Acesso Local (Demo)' : (isRegistering ? 'Criar Nova Conta' : 'Acesso ao Sistema')}
            </p>
        </div>

        {/* Auth Body */}
        <div className="p-8">
            {/* Error Banner */}
            {error && (
                <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span className="leading-tight">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                    <div className="relative animate-in fade-in slide-in-from-left-2 duration-300">
                        <User className="absolute left-3 top-3.5 text-stone-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Seu Nome Completo" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-wood-900/50 border border-wood-600 rounded-lg py-3 pl-10 text-white placeholder-stone-500 focus:outline-none focus:border-brand-yellow focus:bg-wood-900 transition-all"
                        />
                    </div>
                )}

                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-stone-500" size={18} />
                    <input 
                        type="email" 
                        placeholder="Seu Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-wood-900/50 border border-wood-600 rounded-lg py-3 pl-10 text-white placeholder-stone-500 focus:outline-none focus:border-brand-yellow focus:bg-wood-900 transition-all"
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-stone-500" size={18} />
                    <input 
                        type="password" 
                        placeholder="Sua Senha" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-wood-900/50 border border-wood-600 rounded-lg py-3 pl-10 text-white placeholder-stone-500 focus:outline-none focus:border-brand-yellow focus:bg-wood-900 transition-all"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3.5 rounded-lg uppercase tracking-wide transition-all shadow-lg hover:shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>
                            {isRegistering ? 'Cadastrar' : 'Entrar e Sincronizar'} 
                            {!isRegistering && <ArrowRight size={18} />}
                        </>
                    )}
                </button>
            </form>

            <div className="flex items-center gap-3 my-6">
                <div className="h-px bg-wood-600 flex-1"></div>
                <span className="text-stone-500 text-xs uppercase font-bold">Ou</span>
                <div className="h-px bg-wood-600 flex-1"></div>
            </div>

            <button 
                onClick={handleGoogleLogin}
                disabled={loading || !isFirebaseInitialized}
                className={`w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6 ${!isFirebaseInitialized ? 'opacity-50' : ''}`}
                title={!isFirebaseInitialized ? "Disponível apenas Online" : "Entrar com Google"}
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isFirebaseInitialized ? 'Continuar com Google' : 'Google (Apenas Online)'}
            </button>

            {/* Toggle Login/Register */}
            {isFirebaseInitialized && (
                <div className="text-center pt-2">
                    <button 
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError('');
                        }}
                        className="text-brand-yellow hover:text-yellow-300 text-sm font-medium transition-colors flex items-center justify-center gap-1 mx-auto hover:underline"
                    >
                        {isRegistering ? (
                            <>Já tem uma conta? <span className="font-bold">Faça Login</span></>
                        ) : (
                            <>Não tem conta? <span className="font-bold">Cadastre-se</span></>
                        )}
                    </button>
                </div>
            )}
            
            {!isFirebaseInitialized && (
                 <p className="text-center text-xs text-stone-500 mt-2">
                    * Modo Offline Ativo. Entre com qualquer email/senha.
                 </p>
            )}
        </div>
      </div>
      
      <p className="absolute bottom-4 text-stone-600 text-xs">© JTK Restaurante System</p>
    </div>
  );
};