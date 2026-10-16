
// CSS base do Ionic antes dos estilos do app, para o Tailwind/Metronic
// vencerem qualquer conflito
import '@ionic/react/css/core.css'
import '@/components/keenicons/assets/styles.css'
import './styles/globals.css'
import axios from 'axios'
import ReactDOM from 'react-dom/client'
import { setupIonicReact } from '@ionic/react'
import { App } from './App'
import { setupAxios } from './auth'
import { ProvidersWrapper } from './providers'
import React from 'react'
import { recarregarSeVersaoNova } from './utils/versaoNova'

setupIonicReact()

/**
 * Inject interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
setupAxios(axios)

//import() COM DEPENDÊNCIAS QUE FALHOU (CHUNK DE UM BUILD ANTERIOR JÁ APAGADO): RECARREGA COM A VERSÃO NOVA
window.addEventListener('vite:preloadError', (event) => {
    if (recarregarSeVersaoNova(event.payload)) {
        event.preventDefault()
    }
})

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
    <React.StrictMode>
        <ProvidersWrapper>
            <App />
        </ProvidersWrapper>
    </React.StrictMode>
)
