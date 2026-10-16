    import { useEffect, useReducer } from 'react'
    import { createRoot } from 'react-dom/client'
    import { Combobox } from './FormCombobox'

    // select2 NOS <select> CRUS DOS CARDS (HTML QUE CHEGA VIA dangerouslySetInnerHTML, ex.: #SelSetor
    // DO ?pag=modulos). O <select> ORIGINAL FICA NO DOM, ESCONDIDO: O FormData CONTINUA LENDO DELE E
    // QUALQUER CÓDIGO QUE ESCUTE 'change' NELE SEGUE FUNCIONANDO. O COMBOBOX SÓ ESPELHA E ESCREVE NELE.
    //
    // SÓ ENTRAM SELECTS QUE O REACT NÃO CRIOU (NÓ SEM __reactFiber$) — OS DO PRÓPRIO SPA FICAM DE FORA.
    // PARA EXCLUIR UM SELECT DO CARD: class="no-combobox" (equivalente a não chamar o .select2()).

    const MARCADOR = 'data-legacy-combobox'

    const criadoPeloReact = (el) => Object.keys(el).some((key) => key.startsWith('__reactFiber$'))

    //select-tag (TAGS LIVRES): AS OPÇÕES SÃO OS VALORES DO PRÓPRIO REGISTRO (SALVOS OU CRIADOS AGORA), NÃO UMA LISTA FIXA
    //DO CARTÃO — TODAS GANHAM O X NA LISTA
    const lerOpcoes = (select) => {
        const tags = select.classList.contains('select-tag')
        return Array.from(select.options).map((option) => ({ label: option.text, value: option.value, removable: tags }))
    }

    const LegacySelectCombobox = ({ select }) => {

        const [, atualiza] = useReducer((n) => n + 1, 0)

        //OPÇÕES OU VALOR ALTERADOS POR OUTRO CÓDIGO DO CARD → REDESENHA
        useEffect(() => {

            const observer = new MutationObserver(atualiza)
            observer.observe(select, { childList: true, subtree: true, attributes: true })
            select.addEventListener('change', atualiza)

            return () => {
                observer.disconnect()
                select.removeEventListener('change', atualiza)
            }

        }, [select])

        const multiple  = select.multiple
        const creatable = select.classList.contains('select-tag')
        const options   = lerOpcoes(select)

        const value = multiple
            ? Array.from(select.selectedOptions).map((option) => option.value)
            : select.value

        const garanteOpcao = (valor) => {
            if (!Array.from(select.options).some((option) => option.value === valor)) {
                select.add(new Option(valor, valor))
            }
        }

        //X NA LISTA: A TAG SAI DO <select> ORIGINAL (E DA SELEÇÃO); O CARTÃO RECEBE O change COMO NO select2
        const removeOpcao = (option) => {
            if (!creatable) return
            const alvo = Array.from(select.options).find((item) => item.value === String(option.value))
            if (!alvo) return
            alvo.remove()
            select.dispatchEvent(new Event('input', { bubbles: true }))
            select.dispatchEvent(new Event('change', { bubbles: true }))
            atualiza()
        }

        const onChange = (novo) => {

            if (multiple) {

                novo.forEach(garanteOpcao)
                Array.from(select.options).forEach((option) => {
                    option.selected = novo.includes(option.value)
                })

            } else {

                garanteOpcao(String(novo))
                select.value = String(novo)

            }

            select.dispatchEvent(new Event('input', { bubbles: true }))
            select.dispatchEvent(new Event('change', { bubbles: true }))
            atualiza()

        }

        return (
            <Combobox
                options={options}
                value={value}
                onChange={onChange}
                multiple={multiple}
                creatable={creatable}
                onRemoveOption={removeOpcao}
                disabled={select.disabled}
                placeholder={options[0]?.label || 'Selecione uma opção'}
            />
        )

    }

    const montados = new Map()

    const aprimora = (select) => {

        //SELECTS QUE BIBLIOTECAS CRIAM SEM REACT (ex.: painel de configurações do ACE) TAMBÉM FICAM DE FORA
        if (select.hasAttribute(MARCADOR) || select.classList.contains('no-combobox') || criadoPeloReact(select) || select.closest('[class*="ace_"]')) {
            return
        }

        select.setAttribute(MARCADOR, '')

        const container = document.createElement('div')
        container.className = 'legacy-combobox'
        container.style.width = select.style.width || '100%'

        select.style.display = 'none'
        select.insertAdjacentElement('afterend', container)

        const root = createRoot(container)
        root.render(<LegacySelectCombobox select={select} />)

        montados.set(select, { root, container })

    }

    const limpaRemovidos = () => {

        montados.forEach(({ root, container }, select) => {

            if (!select.isConnected) {
                montados.delete(select)
                //DESMONTA FORA DO CICLO ATUAL — O REACT NÃO ACEITA unmount DURANTE OUTRO RENDER
                setTimeout(() => {
                    root.unmount()
                    container.remove()
                })
            }

        })

    }

    const varre = () => {
        document.querySelectorAll(`select:not([${MARCADOR}])`).forEach(aprimora)
        limpaRemovidos()
    }

    const LegacySelectEnhancer = () => {

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

    export { LegacySelectEnhancer }
