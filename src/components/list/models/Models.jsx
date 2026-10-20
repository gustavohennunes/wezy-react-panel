    import { useMemo, useState } from 'react'
    import { DataGrid } from '@/components'
    import { LegacyList } from './LegacyList'
    import { LegacyHtml } from '@/components/legacy/LegacyHtml'
    import { useConfirm } from '@/components/ui/confirm-dialog'
    import { criarColunas } from './colunasDoGrid'
    import { useCarregarMais } from './useCarregarMais'
    import { useRemocaoDeItens } from './useRemocaoDeItens'
    import { useBuscaDaListagem } from './useBuscaDaListagem'
    import { useAcoesDasLinhas } from './useAcoesDasLinhas'
    import { BarraDaListagem } from './BarraDaListagem'
    import { RodapeCarregarMais, RodapeExclusao } from './RodapesDaListagem'

    //ORDEM INICIAL DO GRID (A PONTE JÁ MANDA AS LINHAS ORDENADAS)
    const ORDEM_INICIAL = [{ id: 'id', desc: false }]

    //TUDO QUE FOI CARREGADO FICA EM UMA ÚNICA "PÁGINA" (TAMANHO GIGANTE DESDE O PRIMEIRO RENDER:
    //O DataGridProvider CAPTURA O pageSize NA MONTAGEM) — QUEM CONTROLA O CARREGAMENTO É O BOTÃO
    //"Carregar mais conteúdo" DO RODAPÉ
    const TAMANHO_DA_PAGINA = 1000000

    const LAYOUT_DO_GRID = {
        card: true,
        hidePagination: true,
        //LINHAS ESPAÇADAS EM TODAS AS LISTAGENS (O md PADRÃO DO GRID DEIXAVA OS REGISTROS COLADOS)
        cellSpacing: 'xl',
    }

    const idDaLinha = (row) => row['row-id']

    // HTML DA LISTAGEM MONTADO PELO PRÓPRIO CARD ($novoResultadoInicial) — CHEGA EM
    // list.content, ÀS VEZES ANINHADO EM ARRAYS, ENTÃO ACHATAMOS ANTES DE RENDERIZAR
    const achatarHtml = (value) => {
        if (typeof value === 'string') return value
        if (Array.isArray(value)) return value.map(achatarHtml).join('')
        return ''
    }

    // PAGINAÇÃO DO GRID — DERIVADA DAS PROPS (SEM STATE + useEffect, QUE CUSTAVA UM RENDER A MAIS)
    // QUANDO O CARD ESCONDE O "Exibindo de X até Y" ($bloqExibindo), A PONTE NÃO ENVIA
    // pagination.information — E O RODAPÉ MOSTRAVA "1 - 0 de 0" MESMO COM REGISTROS NA
    // TELA. NESSE CASO CONSIDERAMOS QUE TUDO QUE FOI CARREGADO ESTÁ NA PÁGINA ATUAL.
    const totalDaListagem = (pagination, model, removidos) => {
        const total = typeof pagination?.information?.total === 'number' ? pagination.information.total : (model?.length || 0)
        return Math.max(0, total - removidos)
    }

    const Models = ({ model, columnHeader, btnAdd, search, btnExcluir, extraButton, pagination, tabs, content, sequence = false }) => {

        const [ confirm, confirmDialog ]        = useConfirm()
        const [ models, setModels ]             = useState(model || [])
        const [ selectedRows, setSelectedRows ] = useState([])
        const scope = useMemo(() => ({ model, content }), [model, content])

        const { removedIds, removeItems, selectionTable, excluindo } = useRemocaoDeItens({ scope, confirm, setSelectedRows })
        const visibleModels = useMemo(() => models.filter((row) => !removedIds.has(String(row['row-id']))), [models, removedIds])

        // ATUALIZA O ESTADO QUANDO O MODELO É ALTERADO — DURANTE O RENDER, E NÃO NUM useEffect: COM O EFFECT,
        // O PRIMEIRO RENDER DEPOIS DO LOADER AINDA MOSTRAVA AS LINHAS ANTERIORES (OU "Nenhum conteúdo encontrado!")
        const [ modeloAnterior, setModeloAnterior ] = useState(model)
        if (model !== modeloAnterior) {
            setModeloAnterior(model)
            setModels(Array.isArray(model) ? model : [])
        }

        const totalRegistros = totalDaListagem(pagination, model, removedIds.size)

        const { carregarMais, carregandoMais } = useCarregarMais(model, setModels)
        const busca = useBuscaDaListagem({ search, models, visibleModels, totalRegistros })
        const { handleReorder, handleToggle } = useAcoesDasLinhas({ models, visibleModels, setModels, excluindo })

        const gridPagination = useMemo(
            () => ({ size: TAMANHO_DA_PAGINA, rowCount: totalRegistros, pageCount: 1 }),
            [totalRegistros]
        )

        const column = useMemo(() => criarColunas(columnHeader, { handleToggle, removeItems }), [columnHeader, handleToggle, removeItems])

        const handleRowSelection = (state, table) => {
            selectionTable.current = table
            setSelectedRows(Object.keys(state).filter((key) => state[key]))
        }

        const legacyHtml = useMemo(() => achatarHtml(content).trim(), [content])

        const barra = (
            <BarraDaListagem
                tabs={tabs}
                btnAdd={btnAdd}
                search={search}
                searchInput={busca.searchInput}
                setSearchInput={busca.setSearchInput}
                onBuscar={busca.aplicaBusca}
                onLimpar={busca.limparBusca}
            />
        )

        // O CARD MONTOU A LISTAGEM INTEIRA EM HTML E NÃO HÁ LINHAS ESTRUTURADAS
        // (é o caso de $bloqResultados = true no painel-php): renderiza o HTML do card
        // no lugar do DataGrid, preservando a barra de ferramentas (busca, abas, adicionar)
        if (legacyHtml !== '' && models.length === 0) {

            return (
                <div>
                    {confirmDialog}
                    <div className="card card-grid min-w-full">

                        {barra}

                        <div className="card-body">
                            <LegacyList html={legacyHtml} columnHeader={columnHeader} onRemoveItems={removeItems} />
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
                        onRemoveItems={removeItems}
                    />
                )}

                <DataGrid
                    columns={column}
                    data={busca.linhasFiltradas}
                    rowSelection={true}
                    onRowSelectionChange={handleRowSelection}
                    pagination={gridPagination}
                    getRowId={idDaLinha}
                    //ARRASTAR PARA REORDENAR SÓ NOS CARDS COM $sequencia; DESATIVADO COM O FILTRO AO DIGITAR ATIVO,
                    //QUE ESCONDE LINHAS E MANDARIA UMA ORDEM INCOMPLETA
                    onRowReorder={sequence === true ? handleReorder : undefined}
                    rowReorderDisabled={busca.filtroLocal !== ''}
                    sorting={ORDEM_INICIAL}
                    //TODOS OS REGISTROS JÁ CARREGADOS FICAM NA TELA; A BUSCA DA PRÓXIMA
                    //PÁGINA É FEITA PELO BOTÃO DO RODAPÉ, NÃO PELO GRID
                    serverSide={false}
                    toolbar={barra}
                    layout={LAYOUT_DO_GRID}
                    footer={
                        <RodapeCarregarMais
                            exibidos={visibleModels.length}
                            total={totalRegistros}
                            carregando={carregandoMais}
                            onCarregarMais={carregarMais}
                        />
                    }
                />

                {btnExcluir !== false && (
                    <RodapeExclusao selecionados={selectedRows.length} onExcluir={() => removeItems(selectedRows)} />
                )}

                {/* $addBotaoListagem DO CARTÃO (HTML DO LEGADO, ex.: confirmar(...)) */}
                {typeof extraButton === 'string' && extraButton.trim() !== '' && (
                    <LegacyHtml html={extraButton} className="mt-3" />
                )}
            </div>
        )
    }

    export { Models }
