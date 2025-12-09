import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do diretório atual
  // O terceiro argumento '' garante que carregue todas as vars, não apenas as com prefixo VITE_
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Define 'process.env' globalmente no navegador para evitar "ReferenceError: process is not defined"
      // Isso permite usar process.env.API_KEY no código do front-end
      'process.env': env
    }
  }
})