import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // IMPORTANTE: JSON.stringify é necessário para que o objeto seja inserido como código válido
      'process.env': JSON.stringify(env)
    }
  }
})