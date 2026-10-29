    import { instalarAmbienteDoCartao } from './ambienteDoCartao'

    // RECRIA O <script> PARA O NAVEGADOR EXECUTAR (SCRIPT VINDO DE innerHTML NÃO RODA)
    // registros (OPCIONAL, VER ambienteDoCartao): LIGA O SCRIPT AO CARTÃO PARA ADIAR O DOMContentLoaded/load E DESFAZER
    // OS HANDLERS DO DOCUMENTO AO SAIR
    export const executarScript = (antigo, registros) => new Promise((resolve) => {

        instalarAmbienteDoCartao()

        const novo = document.createElement('script')

        Array.from(antigo.attributes).forEach((attr) => novo.setAttribute(attr.name, attr.value))

        if (registros) {
            novo.registrosDoCartao = registros
        }

        //window.onload = function(){...} DO CARTÃO: A PÁGINA JÁ CARREGOU E O NAVEGADOR NUNCA O CHAMARIA
        const onloadAnterior = window.onload
        const conferirOnload = () => {
            const onload = window.onload
            if (!registros || onload === onloadAnterior || typeof onload !== 'function') return
            window.onload = onloadAnterior
            registros.aoCarregar.push(() => onload.call(window, new Event('load')))
        }

        if (antigo.src) {
            novo.async = false
            novo.onload = () => { conferirOnload(); resolve() }
            novo.onerror = () => resolve()
            //OS SCRIPTS DE TODOS OS LegacyHtml SÃO UMA FILA SÓ: UM SRC QUE NUNCA RESPONDE NÃO PODE TRAVAR O RESTO
            setTimeout(resolve, 15000)
        } else {
            novo.textContent = antigo.textContent
        }

        antigo.parentNode?.replaceChild(novo, antigo)

        if (!antigo.src) {
            conferirOnload()
            resolve()
        }

    })
