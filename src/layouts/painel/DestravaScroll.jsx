import { useEffect } from 'react'

// TRAVA DE SEGURANÇA DO SCROLL. DIALOG, SELECT E DROPDOWN DO RADIX, QUANDO ABERTOS, MARCAM O body COM data-scroll-locked
// (overflow:hidden) E pointer-events:none. SE UM DELES FECHA "TORTO" (ex.: DOIS ABERTOS AO MESMO TEMPO, OU A TELA TROCA COM
// UM ABERTO), A MARCA PODE FICAR NO body E A PÁGINA/SIDEBAR PARAM DE ROLAR E DE RECEBER CLIQUE. AQUI: SEMPRE QUE O body
// MUDA, SE NÃO HÁ NENHUMA CAMADA DO RADIX ABERTA, TIRA A MARCA QUE SOBROU
const camadaAberta = () =>
    document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [role="menu"][data-state="open"], [role="listbox"][data-state="open"]'
    )

const DestravaScroll = () => {

    useEffect(() => {

        let agendado = null

        const conferir = () => {
            agendado = null
            const body = document.body
            const travado = body.hasAttribute('data-scroll-locked') || body.style.pointerEvents === 'none'
            if (!travado || camadaAberta()) return
            body.removeAttribute('data-scroll-locked')
            if (body.style.pointerEvents === 'none') body.style.pointerEvents = ''
        }

        //ESPERA A ANIMAÇÃO DE FECHAR DO RADIX TERMINAR ANTES DE CONFERIR
        const agendar = () => {
            clearTimeout(agendado)
            agendado = setTimeout(conferir, 400)
        }

        const observador = new MutationObserver(agendar)
        observador.observe(document.body, { attributes: true, attributeFilter: ['style', 'data-scroll-locked'], childList: true })

        return () => {
            observador.disconnect()
            clearTimeout(agendado)
        }

    }, [])

    return null

}

export { DestravaScroll }
