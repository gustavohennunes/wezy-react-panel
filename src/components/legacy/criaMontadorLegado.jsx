    import { useEffect } from 'react'
    import { createRoot } from 'react-dom/client'

    // MONTA UM COMPONENTE REACT EM CADA ELEMENTO DO HTML DOS CARTÕES (QUE CHEGA VIA dangerouslySetInnerHTML) QUE BATE COM O
    // seletor — ex.: input[data-sugestoes], [data-versoes-section]. O Componente RECEBE { elemento } E A RAIZ VAI NUM
    // CONTAINER LOGO DEPOIS DO ELEMENTO (display: contents, SEM OCUPAR ESPAÇO); COM substituir: true O CONTEÚDO DO
    // ELEMENTO SAI E A RAIZ FICA DENTRO DELE. ELEMENTO REMOVIDO DO DOM DESMONTA A RAIZ

    const criaMontadorLegado = ({ seletor, marcador, Componente, substituir = false }) => {

        const montados = new Map()

        const aprimora = (elemento) => {

            elemento.setAttribute(marcador, '')

            const container = document.createElement('div')
            container.style.display = 'contents'

            if (substituir) {
                elemento.replaceChildren(container)
            } else {
                elemento.insertAdjacentElement('afterend', container)
            }

            const root = createRoot(container)
            root.render(<Componente elemento={elemento} />)

            montados.set(elemento, { root, container })

        }

        const limpaRemovidos = () => {

            montados.forEach(({ root, container }, elemento) => {

                if (!elemento.isConnected) {
                    montados.delete(elemento)
                    //DESMONTA FORA DO CICLO ATUAL — O REACT NÃO ACEITA unmount DURANTE OUTRO RENDER
                    setTimeout(() => {
                        root.unmount()
                        container.remove()
                    })
                }

            })

        }

        const varre = () => {
            document.querySelectorAll(`${seletor}:not([${marcador}])`).forEach(aprimora)
            limpaRemovidos()
        }

        const MontadorLegado = () => {

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

        return MontadorLegado

    }

    export { criaMontadorLegado }
