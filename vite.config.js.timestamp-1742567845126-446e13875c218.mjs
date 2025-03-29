// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import react from 'file:///C:/Users/cayma/OneDrive/Documentos/projetos/wezy-panel/node_modules/@vitejs/plugin-react/dist/index.mjs'
import { defineConfig } from 'file:///C:/Users/cayma/OneDrive/Documentos/projetos/wezy-panel/node_modules/vite/dist/node/index.js'
import tailwindcss from 'file:///C:/Users/cayma/OneDrive/Documentos/projetos/wezy-panel/node_modules/tailwindcss/lib/index.js'
var __vite_injected_original_import_meta_url =
    'file:///C:/Users/cayma/OneDrive/Documentos/projetos/wezy-panel/vite.config.js'
var vite_config_default = defineConfig({
    plugins: [react()],
    css: {
        postcss: {
            plugins: [tailwindcss()],
        },
    },
    base: '/',
    resolve: {
        alias: {
            '@': fileURLToPath(
                new URL('./src', __vite_injected_original_import_meta_url)
            ),
        },
    },
    build: {
        chunkSizeWarningLimit: 3e3,
    },
})
export { vite_config_default as default }
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjYXltYVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudG9zXFxcXHByb2pldG9zXFxcXHdlenktcGFuZWxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGNheW1hXFxcXE9uZURyaXZlXFxcXERvY3VtZW50b3NcXFxccHJvamV0b3NcXFxcd2V6eS1wYW5lbFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvY2F5bWEvT25lRHJpdmUvRG9jdW1lbnRvcy9wcm9qZXRvcy93ZXp5LXBhbmVsL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ3RhaWx3aW5kY3NzJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgICBjc3M6IHtcbiAgICAgICAgcG9zdGNzczoge1xuICAgICAgICAgICAgcGx1Z2luczogW3RhaWx3aW5kY3NzKCldLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgYmFzZTogJy9tb2R1bG9zJyxcbiAgICByZXNvbHZlOiB7XG4gICAgICAgIGFsaWFzOiB7XG4gICAgICAgICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMzAwMCxcbiAgICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1csU0FBUyxlQUFlLFdBQVc7QUFDclksT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8saUJBQWlCO0FBSHlNLElBQU0sMkNBQTJDO0FBS2xSLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixLQUFLO0FBQUEsSUFDRCxTQUFTO0FBQUEsTUFDTCxTQUFTLENBQUMsWUFBWSxDQUFDO0FBQUEsSUFDM0I7QUFBQSxFQUNKO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3hEO0FBQUEsRUFDSjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsdUJBQXVCO0FBQUEsRUFDM0I7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
