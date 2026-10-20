
    // "Carregar mais conteúdo" E O CONTADOR, DENTRO DO CARD (MESMA POSIÇÃO DA PAGINAÇÃO QUE ELES SUBSTITUEM).
    // data-pagination FAZ HERDAR O PADDING DO LAYOUT DE CARD
    const RodapeCarregarMais = ({ exibidos, total, carregando, onCarregarMais }) => {

        if (exibidos === 0) return null

        return (
            <div data-pagination className="flex flex-col items-center gap-3">

                {total > exibidos && (
                    <button
                        type="button"
                        //leading-none + items-center: O line-height HERDADO DO RODAPÉ DEIXAVA O TEXTO MAIS PARA BAIXO DO QUE O CENTRO
                        className="btn btn-light btn-sm items-center justify-center leading-none"
                        onClick={onCarregarMais}
                        disabled={carregando}
                    >
                        {carregando ? 'Carregando...' : 'Carregar mais conteúdo'}
                    </button>
                )}

                {total > 0 && (
                    <span className="text-2sm text-gray-600">
                        Mostrando {exibidos} de {total} {total === 1 ? 'resultado' : 'resultados'}
                    </span>
                )}

            </div>
        )

    }

    // BOTÃO DE EXCLUSÃO EM LOTE — SEMPRE VISÍVEL; SEM SELEÇÃO FICA ESMAECIDO E
    // INCLICÁVEL, COM SELEÇÃO GANHA OPACIDADE TOTAL E MOSTRA O CONTADOR
    const RodapeExclusao = ({ selecionados, onExcluir }) => {

        const hasSelection = selecionados > 0

        return (
            <div className="flex items-center gap-3 mt-3">

                <button
                    type="button"
                    className={`btn btn-sm btn-danger transition-opacity ${hasSelection ? '' : 'opacity-40 cursor-not-allowed'}`}
                    disabled={!hasSelection}
                    onClick={onExcluir}
                >
                    <i className="ki-filled ki-trash !text-sm"></i>
                    Excluir selecionados
                </button>

                {hasSelection && (
                    <span className="text-2sm text-gray-700">
                        {selecionados === 1 ? '1 item selecionado' : `${selecionados} itens selecionados`}
                    </span>
                )}

            </div>
        )

    }

    export { RodapeCarregarMais, RodapeExclusao }
