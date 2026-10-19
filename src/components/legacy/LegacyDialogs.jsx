    import { useEffect, useRef } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { useConfirm } from '@/components/ui/confirm-dialog'
    import { applyLegacyRedirect } from '@/utils/legacyRedirect'
    import { limparGlobal } from '@/utils/limparGlobal'
    import { avisoErro, avisoSucesso } from '@/utils/avisos'

    // CONFIRMAÇÕES E AVISOS QUE O JS DOS CARTÕES CHAMA (painel.js / SweetAlert v1 DO PAINEL ANTIGO), ABERTOS NO DIALOG DO
    // REACT. O legacy-runtime.js DA API TAMBÉM DEFINE confirmar/confirmFunction COM O confirm() DO NAVEGADOR, MAS SÓ
    // QUANDO A FUNÇÃO AINDA NÃO EXISTE — COMO ESTE COMPONENTE MONTA COM O LAYOUT, ANTES DO JS DO MÓDULO, VALEM ESTAS:
    //   swal({ title, text, type, showCancelButton, confirmButtonText, cancelButtonText, html }, function (isConfirm) {})
    //   swal(title, text, type)
    //   confirmar(str, link, novoTitle) / confirmFunction(str, runFunction, novoTitle)

    //DOMParser E NÃO innerHTML: NUM DOCUMENTO À PARTE NADA EXECUTA (ex.: <img onerror>); <br> VIRA QUEBRA DE LINHA
    const semTags = (texto) => {
        const html = String(texto ?? '').replace(/<br\s*\/?>/gi, '\n')
        return new DOMParser().parseFromString(html, 'text/html').body.textContent || ''
    }

    const LegacyDialogs = () => {

        const [confirm, confirmDialog] = useConfirm()
        const navigate = useNavigate()

        //AS FUNÇÕES GLOBAIS FICAM FIXAS; O QUE MUDA ENTRE RENDERS ENTRA PELA REF
        const atual = useRef({ confirm, navigate })
        atual.current = { confirm, navigate }

        useEffect(() => {

            const perguntar = (titulo, texto, opcoes = {}) =>
                atual.current.confirm({
                    title: titulo || 'Você tem certeza?',
                    description: texto || '',
                    confirmText: 'Sim, tenho certeza',
                    cancelText: 'Não',
                    confirmClass: 'btn-primary',
                    ...opcoes,
                })

            const swal = (primeiro, segundo, terceiro) => {

                const opcoes   = primeiro && typeof primeiro === 'object' ? primeiro : { title: primeiro, text: segundo, type: terceiro }
                const callback = typeof segundo === 'function' ? segundo : null
                const comCancelar = Boolean(opcoes.showCancelButton)

                const texto = opcoes.html ? semTags(opcoes.text) : opcoes.text

                perguntar(semTags(opcoes.title), texto, {
                    confirmText: opcoes.confirmButtonText || (comCancelar ? 'Sim, tenho certeza' : 'OK'),
                    cancelText: opcoes.cancelButtonText || 'Não',
                    confirmClass: opcoes.type === 'error' ? 'btn-danger' : 'btn-primary',
                    hideCancel: !comCancelar,
                }).then((confirmou) => callback?.(confirmou))

            }
            //O SweetAlert v1 TEM swal.close() (CARTÕES COM closeOnConfirm:false FECHAM NA MÃO): AQUI O DIALOG JÁ FECHOU
            swal.close = () => {}

            const confirmar = (texto, link, novoTitle) => {
                perguntar(novoTitle, texto).then((confirmou) => {
                    if (confirmou && link) applyLegacyRedirect(String(link), atual.current.navigate)
                })
            }

            //MESMA CHAMADA DO LEGADO (setTimeout(runFunction, 1)): ACEITA A FUNÇÃO OU O TEXTO QUE O CARTÃO PASSAR
            const confirmFunction = (texto, runFunction, novoTitle) => {
                perguntar(novoTitle, texto).then((confirmou) => {
                    if (confirmou && runFunction) setTimeout(runFunction, 1)
                })
            }

            //criaMsg(msg, tipo) DO painel.js: A FAIXA VERDE/VERMELHA DO LEGADO VIRA TOAST (tipo 1 = SUCESSO, 2 = ERRO).
            //EX.: Ctrl+S DAS ABAS CSS/JS DE SECTION RESPONDE { type, message } E CHAMA criaMsg — SEM ELA NADA APARECIA
            const criaMsg = (mensagem, tipo) => {
                const texto = semTags(mensagem)
                if (String(tipo) === '1') {
                    avisoSucesso(texto || 'Salvo com sucesso.')
                } else {
                    avisoErro(texto || 'Não foi possível concluir.')
                }
            }

            window.swal            = swal
            window.confirmar       = confirmar
            window.confirmFunction = confirmFunction
            window.criaMsg         = criaMsg

            return () => {
                limparGlobal('swal', swal)
                limparGlobal('confirmar', confirmar)
                limparGlobal('confirmFunction', confirmFunction)
                limparGlobal('criaMsg', criaMsg)
            }

        }, [])

        return confirmDialog

    }

    export { LegacyDialogs }
