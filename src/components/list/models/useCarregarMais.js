    import { useEffect, useRef, useState } from 'react'
    import { api } from '@/services/api'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { avisoErro } from '@/utils/avisos'
    import { devePaginaSerRestaurada, lerPaginasCarregadas, gravarPaginasCarregadas, inicioCarregamentoExtra, fimCarregamentoExtra } from '@/utils/restauraPagina'

    const paginaDaUrl = () => {
        const pagina = parseInt(new URLSearchParams(window.location.search).get('pagina') || '1', 10)
        return isNaN(pagina) ? 1 : pagina
    }

    // MODO "CARREGAR MAIS": em vez de trocar de página, os registros vão se acumulando na
    // MESMA tabela. É o que permite ao drag-and-drop mover um item para uma posição que
    // antes estaria em outra página (a reordenação envia a lista inteira em tela).
    const useCarregarMais = (model, setModels) => {

        //REF: A PÁGINA CARREGADA SÓ É LIDA NO CLIQUE DO "Carregar mais", NÃO APARECE NA TELA
        const paginaCarregada                       = useRef(1)
        const emAndamento                           = useRef(false)
        const [ carregandoMais, setCarregandoMais ] = useState(false)

        // BUSCA A PRÓXIMA PÁGINA E CONCATENA NO QUE JÁ ESTÁ NA TELA. continuar() FALSO (OUTRO MÓDULO/BUSCA NO MEIO
        // DO CAMINHO) DESCARTA A RESPOSTA, QUE É DA LISTAGEM ANTERIOR
        const carregarMais = async (continuar = () => true) => {

            if (emAndamento.current) return false

            emAndamento.current = true
            setCarregandoMais(true)

            try {

                const url = new URL(window.location.href)
                url.searchParams.set('pagina', String(paginaCarregada.current + 1))

                const response = await api.get(buildApiUrl(url.searchParams.toString()))
                const novos    = response?.data?.success?.response?.data?.params?.list?.rows || []

                if (!continuar() || novos.length === 0) return false

                //EVITA DUPLICAR SE A MESMA PÁGINA FOR CARREGADA DUAS VEZES
                setModels((prev) => {
                    const existentes = new Set(prev.map((linha) => linha['row-id']))
                    return [...prev, ...novos.filter((linha) => !existentes.has(linha['row-id']))]
                })

                paginaCarregada.current += 1
                gravarPaginasCarregadas(paginaCarregada.current)

                return true

            } catch {

                if (continuar()) avisoErro('Não foi possível carregar mais conteúdo')
                return false

            } finally {
                emAndamento.current = false
                setCarregandoMais(false)
            }

        }

        //A FUNÇÃO ATUAL FICA NA REF: O EFFECT ABAIXO SÓ RODA QUANDO O MODELO MUDA
        const carregarMaisRef = useRef(carregarMais)
        useEffect(() => {
            carregarMaisRef.current = carregarMais
        })

        useEffect(() => {

            //TROCA DE MÓDULO/BUSCA REINICIA O ACUMULADO
            paginaCarregada.current = paginaDaUrl()

            //F5 / ABA RECARREGADA PELO NAVEGADOR: REABRE AS PÁGINAS DO "Carregar mais conteúdo" QUE ESTAVAM NA TELA, PARA A
            //ROLAGEM (Main.jsx) CONSEGUIR VOLTAR AO MESMO PONTO. FORA DISSO, A LISTAGEM RECOMEÇA E O CONTADOR TAMBÉM
            if (!devePaginaSerRestaurada()) {
                gravarPaginasCarregadas(paginaCarregada.current)
                return
            }

            const paginasAntes = lerPaginasCarregadas()
            if (paginasAntes <= paginaCarregada.current) return

            let cancelado = false
            const continuar = () => !cancelado

            inicioCarregamentoExtra()

            ;(async () => {
                while (continuar() && paginaCarregada.current < paginasAntes) {
                    if (!(await carregarMaisRef.current(continuar))) break
                }
            })().finally(fimCarregamentoExtra)

            return () => {
                cancelado = true
            }

        }, [ model ])

        return { carregarMais: () => carregarMais(), carregandoMais }

    }

    export { useCarregarMais }
