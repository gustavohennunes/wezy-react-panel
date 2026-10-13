import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useSettings } from '@/providers/SettingsProvider'
import { AppRouting } from '@/routing'
import { PathnameProvider } from '@/providers'
import { Toaster } from '@/components/ui/sonner'
const { BASE_URL } = import.meta.env
const App = () => {
    const { settings } = useSettings()
    useEffect(() => {

        //TROCA DE TEMA SEM ANIMAÇÃO: COM AS transitions LIGADAS, CADA ELEMENTO QUE MUDA DE COR
        //(inputs, botões, cards...) ANIMA AO MESMO TEMPO E A PÁGINA TRAVA. SÓ A BOLINHA DO SWITCH
        //CONTINUA ANIMANDO. A TRAVA SAI NO PRÓXIMO FRAME, DEPOIS QUE O NOVO TEMA FOI APLICADO.
        const semAnimacao = document.createElement('style')
        semAnimacao.textContent =
            '*,*::before,*::after{transition:none!important}' +
            '.switch input[type=checkbox]::before{transition:transform .15s ease-in-out!important}'
        document.head.appendChild(semAnimacao)

        document.documentElement.classList.remove('dark')
        document.documentElement.classList.remove('light')
        document.documentElement.classList.add(settings.themeMode)

        //FORÇA O RECÁLCULO COM A TRAVA AINDA ATIVA
        window.getComputedStyle(document.body).opacity

        const frame = requestAnimationFrame(() => semAnimacao.remove())

        return () => {
            cancelAnimationFrame(frame)
            semAnimacao.remove()
        }

    }, [settings.themeMode])
    return (
        <BrowserRouter
            basename={BASE_URL}
            future={{
                v7_relativeSplatPath: true,
                v7_startTransition: true,
            }}
        >
            <PathnameProvider>
                <AppRouting />
            </PathnameProvider>
            <Toaster />
        </BrowserRouter>
    )
}
export { App }
