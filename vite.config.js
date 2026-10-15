import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    css: {
        postcss: {
            plugins: [tailwindcss()],
        },
    },
    base: '/',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        chunkSizeWarningLimit: 3000,
        //O CÁLCULO DO gzip DE CADA ARQUIVO (SÓ PARA O LOG) PESA NOS CHUNKS GRANDES
        reportCompressedSize: false,
        //npm run build:watch (vite build --watch --mode watch): REBUILD MAIS LEVE PARA O vite preview.
        //SEM MINIFICAR E SEM APAGAR/RECOPIAR O dist (public/ TEM ~21 MB). ARQUIVO NOVO EM public/
        //SÓ CHEGA AO dist COM UM npm run build NORMAL. O BUILD DE PRODUÇÃO NÃO MUDA
        ...(mode === 'watch' && {
            minify: false,
            emptyOutDir: false,
            copyPublicDir: false,
        }),
    },
}))
