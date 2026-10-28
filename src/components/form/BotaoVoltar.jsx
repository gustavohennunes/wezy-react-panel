    import { useHref, useNavigate } from 'react-router-dom'
    import { KeenIcon } from '@/components/keenicons'
    import { urlAnterior } from '@/utils/urlAnterior'

    // "Voltar" COMO LINK: CLIQUE NORMAL VOLTA NO HISTÓRICO (navigate(-1), COMO ANTES); BOTÃO DO MEIO E CTRL/SHIFT+CLIQUE
    // ABREM A PÁGINA ANTERIOR NUMA ABA NOVA (href = URL ANTERIOR, VER utils/urlAnterior). SEM PÁGINA ANTERIOR NA ABA
    // (ABRIU DIRETO PELO LINK), VAI PARA reserva — O navigate(-1) SAÍA DO PAINEL

    //SÓ O CLIQUE ESQUERDO SEM TECLA É NOSSO; O RESTO O NAVEGADOR RESOLVE PELO href
    const cliqueSimples = (e) => e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey

    const BotaoVoltar = ({ reserva = '/', className = 'btn btn-sm btn-light text-sm gap-1.5' }) => {

        const navigate     = useNavigate()
        const anterior     = urlAnterior()
        //A URL ANTERIOR JÁ VEM COM O basename DO ROUTER (window.location); A reserva É ROTA DO ROUTER E PRECISA DELE
        const hrefReserva  = useHref(reserva)

        const aoClicar = (e) => {
            if (!cliqueSimples(e)) return
            e.preventDefault()
            if (anterior) {
                navigate(-1)
            } else {
                navigate(reserva)
            }
        }

        return (
            <a href={anterior || hrefReserva} onClick={aoClicar} className={className}>
                <KeenIcon icon="arrow-left" className="text-base" />
                Voltar
            </a>
        )

    }

    export { BotaoVoltar }
