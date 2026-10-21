    import { useEffect, useMemo, useState } from 'react'
    import { useLocation, useNavigate } from 'react-router-dom'
    import { contemTodasAsPalavras, textoDoHtml } from '@/utils/textSearch'

    const textoDaLinha = (linha) =>
        (linha.columns || [])
            .map((coluna) => (typeof coluna?.content === 'string' ? textoDoHtml(coluna.content) : ''))
            .join(' ')

    // BUSCA DA LISTAGEM: ENTER/LUPA BUSCA NO SERVIDOR (?busca=) E, COM TODAS AS LINHAS NA TELA, FILTRA AO DIGITAR
    const useBuscaDaListagem = ({ search, models, visibleModels, totalRegistros, localOnly = false }) => {

        const navigate = useNavigate()
        const location = useLocation()
        const instantanea = new URLSearchParams(location.search).get('pag') === 'user-admin-restrito'
        const buscaAplicada = search?.value || ''
        const [ searchInput, setSearchInput ] = useState(buscaAplicada)

        //A BUSCA DO SERVIDOR MUDOU (NOVA RESPOSTA DA PONTE) — O CAMPO ACOMPANHA
        const [ buscaAnterior, setBuscaAnterior ] = useState(search?.value)
        if (search?.value !== buscaAnterior) {
            setBuscaAnterior(search?.value)
            if (!location.state?.buscaInstantanea) setSearchInput(buscaAplicada)
        }

        //FILTRO AO DIGITAR: ATUA SÓ NAS LINHAS JÁ CARREGADAS, SEM CHAMAR A API — POR ISSO SÓ LIGA QUANDO TODOS OS
        //REGISTROS JÁ ESTÃO NA TELA. COM MAIS RESULTADOS NO SERVIDOR (ex.: "Mostrando 100 de 48340" DOS PROSPECTS DO
        //360) ELE ESCONDIA O QUE NÃO TINHA CARREGADO, E A BUSCA SÓ VALE NO ENTER/LUPA (?busca= NO SERVIDOR).
        //ENQUANTO O TEXTO FOR IGUAL AO ?busca= JÁ APLICADO, NÃO FILTRA — O SERVIDOR PODE TER ACHADO O TERMO EM CAMPOS
        //QUE NÃO APARECEM NA TABELA, E ESSAS LINHAS SUMIRIAM
        const todosCarregados = totalRegistros <= visibleModels.length
        const digitado        = searchInput.trim()
        const filtroLocal     = todosCarregados && digitado !== buscaAplicada.trim() ? digitado : ''

        // Com paginação, consulta o servidor sem desmontar o campo nem perder o foco.
        // Uma busca já aplicada também precisa consultar novamente ao ampliar/limpar o termo.
        useEffect(() => {
            if (!instantanea || search === false || (todosCarregados && !buscaAplicada)) return
            const params = new URLSearchParams(location.search)
            if ((params.get('busca') || '') === digitado) return
            const timer = setTimeout(() => {
                if (digitado) params.set('busca', digitado)
                else params.delete('busca')
                params.delete('pagina')
                navigate({ search: '?' + params.toString() }, { replace: true, state: { buscaInstantanea: true } })
            }, 300)
            return () => clearTimeout(timer)
        }, [instantanea, search, todosCarregados, buscaAplicada, digitado, location.search, navigate])

        const textoDasLinhas = useMemo(() => new Map(models.map((linha) => [linha, textoDaLinha(linha)])), [models])

        const linhasFiltradas = useMemo(
            () => (filtroLocal === '' ? visibleModels : visibleModels.filter((linha) => contemTodasAsPalavras(textoDasLinhas.get(linha), filtroLocal))),
            [visibleModels, filtroLocal, textoDasLinhas]
        )

        //BUSCA SEM RECARREGAR A PÁGINA: SÓ TROCA O ?busca= NA URL. O PageDataContext ESCUTA OS
        //searchParams E REFAZ A CHAMADA DA LISTAGEM. PARTE DA URL ATUAL (E NÃO DO search.action
        //DA PONTE) PARA NÃO PERDER PARÂMETROS DE CONTEXTO COMO O cliente
        const aplicaBusca = (termo) => {
            if (localOnly) { setSearchInput(termo); return }
            const params = new URLSearchParams(window.location.search)
            if (termo) {
                params.set('busca', termo)
            } else {
                params.delete('busca')
            }
            params.delete('pagina')
            navigate({ search: '?' + params.toString() })
        }

        // LIMPA A BUSCA — MESMO COMPORTAMENTO DO LINK "LIMPAR" DO PAINEL-PHP
        const limparBusca = () => {
            setSearchInput('')
            if (buscaAplicada !== '') aplicaBusca('')
        }

        const destaque = instantanea || localOnly ? digitado : ''
        return { searchInput, setSearchInput, filtroLocal, linhasFiltradas, aplicaBusca, limparBusca, destaque }

    }

    export { useBuscaDaListagem }
