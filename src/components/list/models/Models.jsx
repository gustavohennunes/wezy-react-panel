    import qs from 'qs'
    import { useMemo, useState, useEffect } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { DataGrid, KeenIcon, DataGridColumnHeader, DataGridRowSelectAll, DataRowContext } from '@/components'
    import { toast } from 'sonner'
    import { Input } from '@/components/ui/input'
    import { buildApiUrl, buildRemoveItemsUrl, cleanUrl } from '@/utils/urlHelper'
    import { api } from '@/services/api'
    import { Tabs } from '@/components/custom/tabs/tabs'
    import { usePageData } from '@/context/PageDataContext'
    import { LegacyList } from './LegacyList'
    import { useConfirm } from '@/components/ui/confirm-dialog'
    import { contemTodasAsPalavras, textoDoHtml } from '@/utils/textSearch'

    //ESPAÇAMENTO VERTICAL DAS LINHAS POR MÓDULO (?pag=). O PADRÃO (md) É COMPACTO
    const ESPACAMENTO_POR_PAGINA = {
        clientes: 'xl',
    }

    const espacamentoDaListagem = () => {
        const params = new URLSearchParams(window.location.search)
        return ESPACAMENTO_POR_PAGINA[params.get('pag') ?? params.get('slug')] || 'md'
    }

    const Models = ({ model, columnHeader, btnAdd, search, btnExcluir, pagination, tabs, content }) => {

        const { callApi }                           = usePageData()
        const [ confirm, confirmDialog ]            = useConfirm()
        const [ models, setModels ]                 = useState(model || [])
        const [ footer, setFooter ]                 = useState('')
        //TAMANHO GIGANTE DESDE O PRIMEIRO RENDER: O DataGridProvider CAPTURA O pageSize
        //NA MONTAGEM, E COM O VALOR ANTIGO (20) A TABELA CORTAVA A EXIBIÇÃO EM 20 LINHAS —
        //O "Carregar mais" ACUMULAVA REGISTROS QUE NUNCA APARECIAM
        const [ gridPagination, setGridPagination ] = useState({ size: 1000000 })
        const [ selectedRows, setSelectedRows ]     = useState([])
        const [activeTab, setActiveTab]             = useState('')
        const [ searchInput, setSearchInput ]       = useState(search?.value || '')
        const navigate                              = useNavigate()

        //A BUSCA DO SERVIDOR MUDOU (NOVA RESPOSTA DA PONTE) — O CAMPO ACOMPANHA
        useEffect(() => {
            setSearchInput(search?.value || '')
        }, [search?.value])

        //FILTRO AO DIGITAR: ATUA SÓ NAS LINHAS JÁ CARREGADAS, SEM CHAMAR A API. ENQUANTO O TEXTO FOR
        //IGUAL AO ?busca= JÁ APLICADO, NÃO FILTRA — O SERVIDOR PODE TER ACHADO O TERMO EM CAMPOS QUE
        //NÃO APARECEM NA TABELA, E ESSAS LINHAS SUMIRIAM
        const filtroLocal = searchInput.trim() !== (search?.value || '').trim() ? searchInput.trim() : ''

        const textoDasLinhas = useMemo(() => {
            const textos = new Map()
            models.forEach((linha) => {
                textos.set(
                    linha,
                    (linha.columns || [])
                        .map((coluna) => (typeof coluna?.content === 'string' ? textoDoHtml(coluna.content) : ''))
                        .join(' ')
                )
            })
            return textos
        }, [models])

        const data = useMemo(
            () => (filtroLocal === '' ? models : models.filter((linha) => contemTodasAsPalavras(textoDasLinhas.get(linha), filtroLocal))),
            [models, filtroLocal, textoDasLinhas]
        )

        // MODO "CARREGAR MAIS": em vez de trocar de página, os registros vão se acumulando na
        // MESMA tabela. É o que permite ao drag-and-drop mover um item para uma posição que
        // antes estaria em outra página (a reordenação envia a lista inteira em tela).
        const [ paginaCarregada, setPaginaCarregada ] = useState(1)
        const [ carregandoMais, setCarregandoMais ]   = useState(false)
        const [ totalRegistros, setTotalRegistros ]   = useState(0)

        // ATUALIZA O ESTADO QUANDO O MODELO É ALTERADO
        useEffect(() => {

            if (model && Array.isArray(model) && model.length > 0) {
                setModels(model)
            } else {
                setModels([])
            }

            //TROCA DE MÓDULO/BUSCA REINICIA O ACUMULADO
            const paginaUrl = parseInt(new URLSearchParams(window.location.search).get('pagina') || '1', 10)
            setPaginaCarregada(isNaN(paginaUrl) ? 1 : paginaUrl)

        }, [ model ])

        // BUSCA A PRÓXIMA PÁGINA E CONCATENA NO QUE JÁ ESTÁ NA TELA
        const carregarMais = async () => {

            if (carregandoMais) return

            setCarregandoMais(true)

            try {

                const url = new URL(window.location.href)
                url.searchParams.set('pagina', String(paginaCarregada + 1))

                const response = await api.get(buildApiUrl(url.searchParams.toString()))
                const novos    = response?.data?.success?.response?.data?.params?.list?.rows || []

                if (novos.length > 0) {

                    //EVITA DUPLICAR SE A MESMA PÁGINA FOR CARREGADA DUAS VEZES
                    setModels((prev) => {

                        const existentes = new Set(prev.map((linha) => linha['row-id']))

                        return [...prev, ...novos.filter((linha) => !existentes.has(linha['row-id']))]

                    })

                    setPaginaCarregada((pagina) => pagina + 1)

                }

            } catch (err) {

                toast(`❌ Erro`, {
                    description: <span style={{ 'color': 'white' }}>{'Não foi possível carregar mais conteúdo'}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-danger)',
                        fontWeight: 'bold'
                    }
                })

            } finally {
                setCarregandoMais(false)
            }

        }

        // ATUALIZA A PAGINAÇÃO DO GRID
        useEffect(() => {

            const info = pagination?.information

            // QUANDO O CARD ESCONDE O "Exibindo de X até Y" ($bloqExibindo), A PONTE NÃO ENVIA
            // pagination.information — E O RODAPÉ MOSTRAVA "1 - 0 de 0" MESMO COM REGISTROS NA
            // TELA. NESSE CASO CONSIDERAMOS QUE TUDO QUE FOI CARREGADO ESTÁ NA PÁGINA ATUAL.
            const total = typeof info?.total === 'number' ? info.total : (model?.length || 0)

            setTotalRegistros(total)

            //TUDO QUE FOI CARREGADO FICA EM UMA ÚNICA "PÁGINA" — QUEM CONTROLA O
            //CARREGAMENTO É O BOTÃO "Carregar mais conteúdo" DO RODAPÉ
            setGridPagination({
                size: 1000000,
                rowCount: total,
                pageCount: 1,
            })

        }, [pagination, model])

        // HANDLER PARA EXCLUIR ITENS SELECIONADOS
        const handleExcluir = async () => {

            const quantidade = selectedRows.length
            const confirmado = await confirm({
                title: quantidade === 1 ? 'Excluir item?' : `Excluir ${quantidade} itens?`,
                description: quantidade === 1
                    ? 'Tem certeza que deseja excluir o item selecionado? Essa ação não pode ser desfeita.'
                    : `Tem certeza que deseja excluir os ${quantidade} itens selecionados? Essa ação não pode ser desfeita.`,
            })

            if (!confirmado) return

            try {

                const data = {
                    items: selectedRows,
                }

                const response = await api.post(
                    buildRemoveItemsUrl(),
                    qs.stringify(data),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                )

                //SEM success O CARD NÃO EXCLUIU (ex.: RESPONDEU COM <script>window.location=...?erro=...);
                //status false É RECUSA DO PRÓPRIO BACKEND (ex.: SEM PERMISSÃO) E TRAZ A MENSAGEM
                const resultado = response.data?.success?.response
                if (!resultado || resultado.status === false || resultado.data?.status === false) {
                    throw new Error(resultado?.message || resultado?.data?.message || '')
                }

                const urlRefresh = buildApiUrl(
                    new URLSearchParams(window.location.search)
                )

                if (urlRefresh === false) {
                    return
                }

                callApi(urlRefresh)

                toast(`✅ Sucesso!`, {
                    description: <span style={{ 'color': 'white' }}>{response.data?.success?.response?.data?.message}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-success',
                        fontWeight: 'bold'
                    }
                });

            } catch (err) {

                toast(`❌ Erro`, {
                    description: <span style={{ 'color': 'white' }}>{err?.message || 'Não foi possível excluir o item selecionado'}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-danger)',
                        fontWeight: 'bold'
                    }
                });

            }

        }

        // HANDLER PARA ATUALIZAR STATUS DO ITEM
        // RECEBE A PRÓPRIA CÉLULA (cell) DO GRID — FUNCIONA EM QUALQUER PÁGINA, SEM DEPENDER
        // DO ESTADO `models`. O VISUAL OTIMISTA/ROLLBACK FICA NO DataRowToggle, QUE LÊ O
        // RETORNO (true/false) DESTA FUNÇÃO.
        const handleToggle = async (rowId, colIndex, cell) => {

            const toggleAction = cell?.action || models.find((row) => row['row-id'] === rowId)?.columns?.[colIndex]?.action

            if (!toggleAction) {
                return false
            }

            try {

                const response = await api.post(buildApiUrl(toggleAction.toString()))

                toast(`✅ Sucesso!`, {
                    description: <span style={{ 'color': 'white' }}>{response?.data?.success?.response?.data?.message || 'Status alterado com sucesso!'}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-success)',
                        fontWeight: 'bold'
                    }
                })

                return true

            } catch (err) {

                toast(`❌ Erro`, {
                    description: <span style={{ 'color': 'white' }}>{'Não foi possível alterar o status deste item'}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-danger)',
                        fontWeight: 'bold'
                    }
                })

                return false

            }

        }

        // CRIA AS COLUNAS DO GRID
        const createColumns = (columnsData) => {
            
            if (!columnsData) return false

            return columnsData.map((col, index) => {

                const isCheckbox = col.component === 'select_all_checkbox'

                // A LARGURA VEM DA PONTE COMO '12.9%' OU '110px'. ANTES ERA APLICADA VIA
                // CLASSE TAILWIND DINÂMICA (w-[${col.width}]) — QUE NUNCA FUNCIONA, PORQUE O
                // JIT SÓ GERA CSS DAS CLASSES QUE ENXERGA EM TEMPO DE BUILD. RESULTADO: TODAS
                // AS COLUNAS FICAVAM COM LARGURA AUTOMÁTICA E O TEXTO QUEBRAVA EM VÁRIAS LINHAS.
                const hasWidth = col.width && col.width !== '0%' && col.width !== '0'

                const columnStyle = {}

                if (isCheckbox) {
                    columnStyle.width = '52px'
                    columnStyle.minWidth = '52px'
                } else if (hasWidth) {
                    columnStyle.width = col.width
                }

                columnStyle.textAlign = col.align === 'center' ? 'center' : col.align === 'right' ? 'right' : 'left'

                // ESTILO INLINE DECLARADO PELO CARD (ex.: 'color:#F00;')
                const backendStyle = col.style
                    ? Object.fromEntries(
                        col.style
                            .split(';')
                            .map((rule) => rule.split(':').map((s) => s.trim()))
                            .filter(([key, value]) => key && value)
                    )
                    : {}

                return {
                    accessorKey: `col_${index}`,
                    id: col.component === 'select_all_checkbox' ? 'id' : col?.content?.toLowerCase().replace(/\s/g, '_'),
                    header: ({ column }) => col.component === 'select_all_checkbox' ? (
                        
                        <DataGridRowSelectAll
                            setSelectedRows={setSelectedRows}
                        />

                    ) : (

                        <DataGridColumnHeader
                            title={col.content}
                            column={column}
                            filter={false}
                        />

                    ),
                    enableSorting: false,
                    enableHiding: false,
                    cell: ({ row }) => {

                        return (
                            <DataRowContext
                                fullRow={row}
                                row={row.original.columns[index]}
                                index={index}
                                //PASSA A FUNÇÃO DIRETO: uma closure aqui descartaria os argumentos
                                //que o DataRowContext envia (id, índice e a própria célula com o action)
                                handleToggle={handleToggle}
                            />
                        )

                    },
                    meta: {
                        headerClassName: [
                            isCheckbox ? '!ps-4 !pe-2' : '!px-3',
                            'whitespace-nowrap',
                            col.class ? col.class : '',
                        ]
                            .filter(Boolean)
                            .join(' '),

                        cellClassName: [
                            isCheckbox ? '!ps-4 !pe-2' : '!px-3',
                            'text-gray-800 font-normal align-middle',
                        ]
                            .filter(Boolean)
                            .join(' '),

                        headerStyle: columnStyle,
                        cellStyle: { ...columnStyle, ...backendStyle },
                    },
                }
            })
        }

        const handleRowSelection = (state) => {

            const selectedRowIds = Object.keys(state).filter((key) => {
                return state[key]
            })

            setSelectedRows(selectedRowIds)

        }

        //BUSCA SEM RECARREGAR A PÁGINA: SÓ TROCA O ?busca= NA URL. O PageDataContext ESCUTA OS
        //searchParams E REFAZ A CHAMADA DA LISTAGEM. PARTE DA URL ATUAL (E NÃO DO search.action
        //DA PONTE) PARA NÃO PERDER PARÂMETROS DE CONTEXTO COMO O cliente
        const aplicaBusca = (termo) => {

            const params = new URLSearchParams(window.location.search)

            if (termo) {
                params.set('busca', termo)
            } else {
                params.delete('busca')
            }
            params.delete('pagina')

            navigate({ search: '?' + params.toString() })

        }

        //ENTER → BUSCA NO SERVIDOR (?busca=termo)
        const submitSearch = (e) => {
            e.preventDefault()
            aplicaBusca(searchInput.trim())
        }

        // LIMPA A BUSCA — MESMO COMPORTAMENTO DO LINK "LIMPAR" DO PAINEL-PHP
        const limparBusca = () => {
            setSearchInput('')
            if ((search?.value || '') !== '') {
                aplicaBusca('')
            }
        }

        //FUNÇÃO DE RENDER (E NÃO COMPONENTE): UM COMPONENTE DECLARADO AQUI DENTRO SERIA RECRIADO A
        //CADA RENDER DO Models — COM O FILTRO AO DIGITAR, O INPUT PERDERIA O FOCO A CADA LETRA
        const renderToolbar = () => {

            const buscaAtiva = (search?.value || '') !== '' || searchInput !== ''

            const addBtn = btnAdd?.label ? (

                <a
                    className="btn btn-primary btn-sm"
                    href={cleanUrl(btnAdd?.url)}
                    target="_self"
                >
                    <i className="ki-filled ki-plus"></i>
                    {btnAdd?.label}
                </a>

            ) : (
                ''
            )

            return (
                <>
                
                    {tabs?.before && Array.isArray(tabs?.before) ? (

                        <Tabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            tabs={tabs?.before}
                            className="tabs w-f px-6"
                        />

                    ) : null}

                    <div className="bg-transparent">

                        {search !== undefined && addBtn !== undefined && (

                            <div className="card-header flex-wrap my-0 gap-2 border-b-0 px-3">

                                {addBtn}
                                
                                {search !== undefined && search !== false && (

                                    <div className="flex flex-wrap gap-2 lg:gap-5">

                                        <form
                                            id="form2"
                                            name="form2"
                                            role="search"
                                            onSubmit={(e) => submitSearch(e)}
                                            className="flex form-busca"
                                        >

                                            <label className="input input-sm">
                                                <input
                                                    type="text"
                                                    name="FrmBusca"
                                                    id="FrmBusca"
                                                    className="inputBusca"
                                                    placeholder={search?.placeholder}
                                                    value={searchInput}
                                                    onChange={(e) =>
                                                        setSearchInput(e.target.value)
                                                    }
                                                />
                                            </label>

                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-sm ml-1"
                                            >
                                                <KeenIcon
                                                    icon="magnifier"
                                                    className="!text-sm"
                                                />
                                            </button>

                                            {buscaAtiva && (
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-sm ml-1"
                                                    onClick={limparBusca}
                                                    title="Limpar busca"
                                                >
                                                    LIMPAR
                                                </button>
                                            )}

                                        </form>

                                    </div>

                                )}

                            </div>
                        )}

                        {tabs?.after && Array.isArray(tabs?.after) ? (
                            <div className="card-header justify-start flex-wrap gap-2 border-b-0 px-5">
                                {tabs?.after?.map((afterTab, i) => {
                                    return (
                                        <a
                                            key={i}
                                            className="btn btn-primary"
                                            href={
                                                !afterTab.url ||
                                                afterTab.url === 'javascript:;'
                                                    ? ''
                                                    : cleanUrl(afterTab.url)
                                            }
                                            target={afterTab.target ?? '_self'}
                                        >
                                            {afterTab.content}
                                        </a>
                                    )
                                })}
                            </div>
                        ) : null}
                    </div>
                </>
            )
        }

        // BOTÃO DE EXCLUSÃO EM LOTE — SEMPRE VISÍVEL; SEM SELEÇÃO FICA ESMAECIDO E
        // INCLICÁVEL, COM SELEÇÃO GANHA OPACIDADE TOTAL E MOSTRA O CONTADOR
        useEffect(() => {

            if (btnExcluir !== false) {

                const hasSelection = selectedRows.length > 0

                setFooter(
                    <div className="flex items-center gap-3 mt-3">

                        <button
                            className={`btn btn-sm btn-danger transition-opacity ${hasSelection ? '' : 'opacity-40 cursor-not-allowed'}`}
                            disabled={!hasSelection}
                            onClick={handleExcluir}
                        >
                            <i className="ki-filled ki-trash"></i>
                            Excluir selecionados
                        </button>

                        {hasSelection && (
                            <span className="text-2sm text-gray-700">
                                {selectedRows.length === 1
                                    ? '1 item selecionado'
                                    : `${selectedRows.length} itens selecionados`}
                            </span>
                        )}

                    </div>
                )

            } else {
                setFooter('')
            }

        }, [btnExcluir, selectedRows])

        const column = useMemo(() => (columnHeader ? createColumns(columnHeader) : []), [columnHeader]);

        // HTML DA LISTAGEM MONTADO PELO PRÓPRIO CARD ($novoResultadoInicial) — CHEGA EM
        // list.content, ÀS VEZES ANINHADO EM ARRAYS, ENTÃO ACHATAMOS ANTES DE RENDERIZAR
        const legacyHtml = useMemo(() => {

            const flatten = (value) => {

                if (typeof value === 'string') return value
                if (Array.isArray(value)) return value.map(flatten).join('')

                return ''

            }

            return flatten(content).trim()

        }, [content])

        // O CARD MONTOU A LISTAGEM INTEIRA EM HTML E NÃO HÁ LINHAS ESTRUTURADAS
        // (é o caso de $bloqResultados = true no painel-php): renderiza o HTML do card
        // no lugar do DataGrid, preservando a barra de ferramentas (busca, abas, adicionar)
        if (legacyHtml !== '' && models.length === 0) {

            return (
                <div>
                    <div className="card card-grid min-w-full">

                        {renderToolbar()}

                        <div className="card-body">
                            <LegacyList html={legacyHtml} columnHeader={columnHeader} />
                        </div>

                    </div>
                </div>
            )

        }

        return (
            <div>

                {confirmDialog}

                {/* LINHAS EXTRAS DECLARADAS PELO CARD, EXIBIDAS ACIMA DA LISTAGEM PADRÃO */}
                {legacyHtml !== '' && (
                    <LegacyList
                        html={legacyHtml}
                        columnHeader={columnHeader}
                        showHeader={false}
                    />
                )}

                <DataGrid
                    columns={column}
                    data={data}
                    rowSelection={true}
                    onRowSelectionChange={handleRowSelection}
                    pagination={gridPagination}
                    getRowId={(row) => row['row-id']}
                    sorting={[
                        {
                            id: 'id',
                            desc: false,
                        },
                    ]}
                    //TODOS OS REGISTROS JÁ CARREGADOS FICAM NA TELA; A BUSCA DA PRÓXIMA
                    //PÁGINA É FEITA PELO BOTÃO DO RODAPÉ, NÃO PELO GRID
                    serverSide={false}
                    toolbar={renderToolbar()}
                    layout={{
                        card: true,
                        hidePagination: true,
                        cellSpacing: espacamentoDaListagem(),
                    }}
                    //RODAPÉ DENTRO DO CARD (mesma posição da paginação que ele substitui).
                    //data-pagination faz herdar o padding do layout de card.
                    footer={
                        models.length > 0 ? (

                            <div data-pagination className="flex flex-col items-center gap-2">

                                {totalRegistros > models.length && (
                                    <button
                                        type="button"
                                        className="btn btn-light btn-sm"
                                        onClick={carregarMais}
                                        disabled={carregandoMais}
                                    >
                                        {carregandoMais ? 'Carregando...' : 'Carregar mais conteúdo'}
                                    </button>
                                )}

                                {totalRegistros > 0 && (
                                    <span className="text-2sm text-gray-600">
                                        Mostrando {models.length} de {totalRegistros} {totalRegistros === 1 ? 'resultado' : 'resultados'}
                                    </span>
                                )}

                            </div>

                        ) : null
                    }
                />

                {footer}
            </div>
        )
    }

    export { Models }
