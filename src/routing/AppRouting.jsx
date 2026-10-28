import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useAuthContext } from '@/auth'
import { useLoaders } from '@/providers'
import { AppRoutingSetup } from '.'
import { registraUrlDoHistorico } from '@/utils/urlAnterior'
const AppRouting = () => {
    const { setProgressBarLoader } = useLoaders()
    const { verify, setLoading } = useAuthContext()
    const [previousLocation, setPreviousLocation] = useState('')
    //REF E NÃO STATE: SÓ OS EFFECTS LEEM, NADA NA TELA DEPENDE DELE
    const firstLoad = useRef(true)
    const location = useLocation()
    const path = location.pathname.trim()
    //VERIFICAÇÃO INICIAL UMA VEZ SÓ. ANTES O EFFECT NÃO TINHA LISTA DE DEPENDÊNCIAS E RODAVA A CADA
    //RENDER ENQUANTO A PRIMEIRA VERIFICAÇÃO NÃO TERMINAVA — VÁRIAS CHAMADAS DE verify() NO BOOT
    useEffect(() => {
        verify().finally(() => {
            setLoading(false)
            firstLoad.current = false
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    //URL DESTA POSIÇÃO DO HISTÓRICO, PARA O href DO "Voltar" (BotaoVoltar)
    useEffect(() => {
        registraUrlDoHistorico()
    }, [location])
    useEffect(() => {
        if (!firstLoad.current) {
            setProgressBarLoader(true)
            verify()
                .catch(() => {
                    throw new Error('User verify request failed!')
                })
                .finally(() => {
                    setPreviousLocation(path)
                    setProgressBarLoader(false)
                    if (path === previousLocation) {
                        setPreviousLocation('')
                    }
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location])
    useEffect(() => {
        if (!CSS.escape(window.location.hash)) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            })
        }
    }, [previousLocation])
    return <AppRoutingSetup />
}
export { AppRouting }
