import { useEffect } from 'react'
import {
    devePaginaSerRestaurada,
    encerrarRestauracao,
    lerRolagem,
    gravarRolagem,
    carregamentoExtraPendente,
} from '@/utils/restauraPagina'

// ROLAGEM DA TELA GUARDADA POR URL E DEVOLVIDA QUANDO A PÁGINA É RECARREGADA (VER utils/restauraPagina.js).
// NO DESKTOP QUEM ROLA É A <div> DO CONTEÚDO (lg:scrollable-y-auto); NO CELULAR É A JANELA — GUARDA AS DUAS
const useRestauraRolagem = (rolagemRef, carregando, pageData) => {

    //GRAVA ENQUANTO O USUÁRIO ROLA (UMA VEZ POR FRAME). DURANTE A RESTAURAÇÃO NÃO GRAVA: O TOPO 0 DO INÍCIO DO FETCH
    //APAGARIA A POSIÇÃO QUE ESTÁ SENDO RESTAURADA
    useEffect(() => {

        let quadro = null

        const gravar = () => {
            quadro = null
            if (devePaginaSerRestaurada()) return
            gravarRolagem({ div: rolagemRef.current?.scrollTop || 0, janela: window.scrollY || 0 })
        }

        const aoRolar = () => {
            if (quadro === null) quadro = requestAnimationFrame(gravar)
        }

        const div = rolagemRef.current
        div?.addEventListener('scroll', aoRolar, { passive: true })
        window.addEventListener('scroll', aoRolar, { passive: true })

        return () => {
            if (quadro !== null) cancelAnimationFrame(quadro)
            div?.removeEventListener('scroll', aoRolar)
            window.removeEventListener('scroll', aoRolar)
        }

    }, [rolagemRef])

    //DEPOIS DO FETCH DA TELA: TENTA CHEGAR NA POSIÇÃO GUARDADA ENQUANTO O CONTEÚDO CRESCE (SCRIPTS DOS CARTÕES, PÁGINAS DO
    //"Carregar mais conteúdo" SENDO REABERTAS). PARA QUANDO CHEGA E A ALTURA ESTABILIZA, QUANDO O USUÁRIO MEXE NA TELA
    //OU APÓS 10s
    useEffect(() => {

        if (carregando || !pageData || !devePaginaSerRestaurada()) return

        const salvo = lerRolagem()
        if (!salvo || (!salvo.div && !salvo.janela)) {
            encerrarRestauracao()
            return
        }

        const inicio       = Date.now()
        let temporizador   = null
        let acertosSeguidos = 0
        let encerrado      = false

        const EVENTOS_DO_USUARIO = ['wheel', 'touchstart', 'keydown', 'mousedown']

        const encerrar = () => {
            if (encerrado) return
            encerrado = true
            clearTimeout(temporizador)
            EVENTOS_DO_USUARIO.forEach((evento) => window.removeEventListener(evento, encerrar, true))
            encerrarRestauracao()
        }

        const tentar = () => {

            const div = rolagemRef.current

            if (div && salvo.div) div.scrollTop = salvo.div
            if (salvo.janela) window.scrollTo(0, salvo.janela)

            const chegouNaDiv    = !salvo.div || !div || Math.abs(div.scrollTop - salvo.div) < 2
            const chegouNaJanela = !salvo.janela || Math.abs(window.scrollY - salvo.janela) < 2

            acertosSeguidos = chegouNaDiv && chegouNaJanela && !carregamentoExtraPendente() ? acertosSeguidos + 1 : 0

            if (acertosSeguidos >= 3 || Date.now() - inicio > 10000) {
                encerrar()
                return
            }

            temporizador = setTimeout(tentar, 150)

        }

        EVENTOS_DO_USUARIO.forEach((evento) => window.addEventListener(evento, encerrar, { capture: true, passive: true }))

        tentar()

        return encerrar

    }, [carregando, pageData, rolagemRef])

}

export { useRestauraRolagem }
