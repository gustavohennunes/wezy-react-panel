    import { useMemo } from 'react'

    // LISTAGEM MONTADA EM HTML PELO PRÓPRIO CARD ($novoResultadoInicial no painel-php).
    // A ponte entrega esse HTML em params.list.content; como são <tr> crus, não é possível
    // injetá-los no DataGrid (TanStack) — aqui montamos uma tabela própria com o mesmo cabeçalho.
    //
    // LIMITAÇÃO CONHECIDA: os links de navegação do HTML funcionam normalmente, mas checkboxes,
    // botão de excluir e tooltips dependem dos handlers do painel.js legado e ficam inertes.
    const LegacyList = ({ html, columnHeader = [], showHeader = true }) => {

        const columns = useMemo(
            () => (Array.isArray(columnHeader) ? columnHeader : []),
            [columnHeader]
        )

        if (!html) {
            return null
        }

        return (
            <div className="grid min-w-full">
                <div className="overflow-x-auto">
                    <table className="table table-auto align-middle text-sm text-gray-700 w-full legacy-list">

                        {showHeader && columns.length > 0 && (

                            <thead>
                                <tr>
                                    {columns.map((col, index) => (
                                        <th
                                            key={`legacy-th-${index}`}
                                            className={col.class || ''}
                                            style={{
                                                width: col.width && col.width !== '0%' ? col.width : undefined,
                                                textAlign: col.align || 'left',
                                            }}
                                        >
                                            {typeof col.content === 'string' ? col.content : ''}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                        )}

                        <tbody dangerouslySetInnerHTML={{ __html: html }} />

                    </table>
                </div>
            </div>
        )

    }

    export { LegacyList }
