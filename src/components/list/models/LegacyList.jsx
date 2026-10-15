    import { useEffect, useMemo, useRef } from 'react'
    import { executarScript } from '@/components/legacy/executarScript'

    // LISTAGEM MONTADA EM HTML PELO PRÓPRIO CARD ($novoResultadoInicial no painel-php).
    // A ponte entrega esse HTML em params.list.content; como são <tr> crus, não é possível
    // injetá-los no DataGrid (TanStack) — aqui montamos uma tabela própria com o mesmo cabeçalho.
    //
    // OS <script> DO HTML SÃO EXECUTADOS DEPOIS DE MONTAR A TABELA, E O WRAPPER .legacy-html DEIXA O legacy-runtime.js
    // (SERVIDO PELA API) APLICAR DATAS E O CONTADOR DOS CHECKBOXES, COMO NO painel.js LEGADO.
    //DEFAULT FORA DO COMPONENTE: UM [] NOVO A CADA RENDER INVALIDAVA O useMemo DAS COLUNAS
    const SEM_COLUNAS = []

    const LegacyList = ({ html, columnHeader = SEM_COLUNAS, showHeader = true }) => {

        const corpoRef = useRef(null)

        //SCRIPT VINDO DE innerHTML NÃO RODA: RECRIA NA ORDEM, COMO O LegacyHtml
        useEffect(() => {

            const corpo = corpoRef.current
            if (!corpo) return

            let cancelado = false

            const executar = async () => {
                for (const script of Array.from(corpo.querySelectorAll('script'))) {
                    if (cancelado) return
                    await executarScript(script)
                }
            }

            executar()

            return () => {
                cancelado = true
            }

        }, [html])

        const columns = useMemo(
            () => (Array.isArray(columnHeader) ? columnHeader : []),
            [columnHeader]
        )

        if (!html) {
            return null
        }

        return (
            <div className="grid min-w-full legacy-html">
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

                        <tbody ref={corpoRef} dangerouslySetInnerHTML={{ __html: html }} />

                    </table>
                </div>
            </div>
        )

    }

    export { LegacyList }
