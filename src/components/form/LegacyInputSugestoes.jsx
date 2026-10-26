    import { useEffect, useReducer, useRef } from 'react'
    import { createRoot } from 'react-dom/client'
    import { SugestoesDoInput } from './CampoComSugestoes'

    // DROPDOWN DE SUGESTÕES NOS <input> CRUS DOS CARTÕES (HTML DO aut, ex.: Src DO IMAGE DENTRO DE UMA LISTA NO BACK-END DAS
    // SECTIONS): data-sugestoes='[{"value":"...","description":"..."}]'. O INPUT ORIGINAL CONTINUA VISÍVEL E DIGITÁVEL — A
    // LISTA SÓ ESCREVE NELE (E DISPARA input/change PARA O CÓDIGO DO CARTÃO)

    const MARCADOR = 'data-legacy-sugestoes'

    const lerSugestoes = (input) => {
        try {
            const sugestoes = JSON.parse(input.getAttribute('data-sugestoes') || '[]')
            return Array.isArray(sugestoes) ? sugestoes : []
        } catch {
            return []
        }
    }

    const LegacySugestoes = ({ input, sugestoes }) => {

        const inputRef     = useRef(input)
        const [, atualiza] = useReducer((n) => n + 1, 0)

        //VALOR DIGITADO OU TROCADO POR OUTRO CÓDIGO DO CARTÃO → MARCA A SUGESTÃO CERTA
        useEffect(() => {
            input.addEventListener('input', atualiza)
            input.addEventListener('change', atualiza)
            return () => {
                input.removeEventListener('input', atualiza)
                input.removeEventListener('change', atualiza)
            }
        }, [input])

        const escolhe = (valor) => {
            input.value = valor
            input.dispatchEvent(new Event('input', { bubbles: true }))
            input.dispatchEvent(new Event('change', { bubbles: true }))
        }

        return <SugestoesDoInput inputRef={inputRef} sugestoes={sugestoes} valor={input.value} onEscolher={escolhe} />

    }

    const montados = new Map()

    const aprimora = (input) => {

        input.setAttribute(MARCADOR, '')

        const sugestoes = lerSugestoes(input)
        if (sugestoes.length === 0) return

        //O POPOVER VAI POR PORTAL: O CONTAINER SÓ HOSPEDA A RAIZ DO REACT, SEM OCUPAR ESPAÇO NA LINHA
        const container = document.createElement('div')
        container.style.display = 'contents'
        input.insertAdjacentElement('afterend', container)

        const root = createRoot(container)
        root.render(<LegacySugestoes input={input} sugestoes={sugestoes} />)

        montados.set(input, { root, container })

    }

    const limpaRemovidos = () => {

        montados.forEach(({ root, container }, input) => {

            if (!input.isConnected) {
                montados.delete(input)
                //DESMONTA FORA DO CICLO ATUAL — O REACT NÃO ACEITA unmount DURANTE OUTRO RENDER
                setTimeout(() => {
                    root.unmount()
                    container.remove()
                })
            }

        })

    }

    const varre = () => {
        document.querySelectorAll(`input[data-sugestoes]:not([${MARCADOR}])`).forEach(aprimora)
        limpaRemovidos()
    }

    const LegacyInputSugestoes = () => {

        useEffect(() => {

            varre()

            //VÁRIAS MUTAÇÕES NO MESMO FRAME VIRAM UMA VARREDURA SÓ
            let agendado = null
            const observer = new MutationObserver(() => {
                if (agendado) return
                agendado = requestAnimationFrame(() => {
                    agendado = null
                    varre()
                })
            })
            observer.observe(document.body, { childList: true, subtree: true })

            return () => {
                observer.disconnect()
                if (agendado) cancelAnimationFrame(agendado)
            }

        }, [])

        return null

    }

    export { LegacyInputSugestoes }
