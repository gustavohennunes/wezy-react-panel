    import { useEffect } from 'react'

    // PORTA DO abreCampos() DO CARD DE CLIENTES (wezy-panel/arquivos/modulos/1/clientes-main.php),
    // QUE A API DESCARTA JUNTO COM O <script> DO CARD. NO ?pag=clientes&acao=Inserir O RADIO
    // "Modo de criação" (.rdo-modo-criacao) DECIDE QUAIS LINHAS [data-modo-abertura] APARECEM:
    //   1 Manualmente          → SERVIDOR ATIVO (host, banco, ftp...)
    //   2 Automaticamente      → DADOS DE CRIAÇÃO + pasta e banco automáticos
    //   4 Plataforma Wezy      → banco automático (PADRÃO, VEM checked)
    //   5 Portal de privacidade → subdomínio do portal + banco automático
    // O SELETOR É POR IGUALDADE EXATA COMO NO jQuery ORIGINAL: "2|4" (Nome do projeto) NUNCA É ESCONDIDO.

    const MODOS = ['1', '2', '4', '5']

    const linhas = (modo) => document.querySelectorAll(`[data-modo-abertura="${modo}"]`)

    //LINHA ESCONDIDA NÃO PODE TER CAMPO required — O NAVEGADOR BLOQUEARIA O SUBMIT
    //(EQUIVALE AO obg → obgOld DO CARD)
    const mostra = (modo, visivel) => {

        linhas(modo).forEach((linha) => {

            linha.style.display = visivel ? '' : 'none'

            linha.querySelectorAll('input, select, textarea').forEach((campo) => {
                if (!visivel && campo.required) {
                    campo.required = false
                    campo.dataset.obgOld = '1'
                } else if (visivel && campo.dataset.obgOld) {
                    campo.required = true
                    delete campo.dataset.obgOld
                }
            })

        })

    }

    //<b>texto</b> DENTRO DO #pasta-automatico / #banco-automatico. SÓ ESCREVE SE MUDOU: A ESCRITA É UMA
    //MUTAÇÃO DO DOM E O MutationObserver ABAIXO CHAMARIA O abreCampos DE NOVO A CADA FRAME
    const escreveNegrito = (el, texto) => {

        if (!el) return

        //LINHA "Banco/Pasta | Automático": VALOR CENTRALIZADO NA ALTURA DO LABEL (style NÃO É OBSERVADO)
        const linha = el.closest('[data-modo-abertura]')
        if (linha && linha.style.alignItems !== 'center') linha.style.alignItems = 'center'

        if (el.firstElementChild?.tagName === 'B' && el.textContent === texto) return

        const b = document.createElement('b')
        b.textContent = texto
        el.replaceChildren(b)

    }

    const linhaDoSubmit = () =>
        document.querySelector('form button[type="submit"]')?.closest('.flex')

    const abreCampos = () => {

        const modo = document.querySelector('.rdo-modo-criacao:checked')?.value

        if (modo === undefined) {
            mostra('1', true)
            mostra('2', true)
            return
        }

        MODOS.forEach((m) => mostra(m, false))

        if (modo === '1') {

            mostra('1', true)
            const submit = linhaDoSubmit()
            if (submit) submit.style.display = ''
            return

        }

        const nomeProjeto = document.querySelector('[name="FrmNome_projeto"]')?.value || ''
        const pasta       = document.getElementById('pasta-automatico')
        const banco       = document.getElementById('banco-automatico')
        const submit      = linhaDoSubmit()

        if (nomeProjeto.length < 3) {

            if (submit) submit.style.display = 'none'
            escreveNegrito(pasta, 'Preencha o cliente com pelo menos 3 dígitos')
            escreveNegrito(banco, 'Preencha o cliente com pelo menos 3 dígitos')

        } else {

            const cliente = nomeProjeto
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/[^\w\s]/gi, '')
                .split(' ')
                .join('')
                .toLowerCase()

            if (submit) submit.style.display = ''
            escreveNegrito(pasta, `public_html/prod/${cliente}`)
            escreveNegrito(banco, `wezy_prod_${cliente}`)

        }

        if (modo === '4') {
            mostra('4', true)
        } else if (modo === '5') {
            mostra('5', true)
            mostra('4', true)
        } else {
            mostra('2', true)
            mostra('4', true)
        }

    }

    const useLegacyModoCriacao = (data) => {

        useEffect(() => {

            //OS CAMPOS RENDERIZAM DEPOIS (sections VIA useEffect) — REAPLICA QUANDO O FORM MUDA DE ESTRUTURA
            let agendado = null
            const agenda = () => {
                if (agendado) return
                agendado = requestAnimationFrame(() => {
                    agendado = null
                    if (document.querySelector('.rdo-modo-criacao')) abreCampos()
                })
            }

            const onEvento = (e) => {
                if (e.target.matches?.('.rdo-modo-criacao, [name="FrmNome_projeto"]')) {
                    abreCampos()
                }
            }

            document.addEventListener('change', onEvento)
            document.addEventListener('input', onEvento)

            const observer = new MutationObserver(agenda)
            observer.observe(document.body, { childList: true, subtree: true })
            agenda()

            return () => {
                document.removeEventListener('change', onEvento)
                document.removeEventListener('input', onEvento)
                observer.disconnect()
                if (agendado) cancelAnimationFrame(agendado)
            }

        }, [data])

    }

    export { useLegacyModoCriacao }
